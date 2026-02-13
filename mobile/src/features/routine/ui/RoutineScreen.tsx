import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { routineApi } from '../api/routineApi';
import type { RoutineItem } from '../../../shared/types/routine';
import { Button, Input } from '../../../shared/ui';

export const RoutineScreen = () => {
  const [routines, setRoutines] = useState<RoutineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [routineName, setRoutineName] = useState('');
  const [exercises, setExercises] = useState([{ exerciseName: '', id: Math.random().toString() }]);
  const [editingRoutineId, setEditingRoutineId] = useState<string | null>(null);

  const loadRoutines = useCallback(async () => {
    try {
      const list = await routineApi.list();
      setRoutines(list);
    } catch (error) {
      Alert.alert('루틴 조회 실패', error instanceof Error ? error.message : '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRoutines();
  }, [loadRoutines]);

  const resetForm = () => {
    setRoutineName('');
    setExercises([{ exerciseName: '', id: Math.random().toString() }]);
    setEditingRoutineId(null);
  };

  const handleSubmit = async () => {
    if (!routineName.trim()) {
      Alert.alert('입력 확인', '루틴 이름을 입력해 주세요.');
      return;
    }

    if (!exercises.length) {
      Alert.alert('입력 확인', '운동을 1개 이상 입력해 주세요.');
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        routineName: routineName.trim(),
        exercises,
      };

      if (editingRoutineId) {
        await routineApi.update(editingRoutineId, payload);
      } else {
        await routineApi.create(payload);
      }

      resetForm();
      await loadRoutines();
    } catch (error) {
      Alert.alert('저장 실패', error instanceof Error ? error.message : '오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (routineId: string) => {
    Alert.alert('루틴 삭제', '선택한 루틴을 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await routineApi.remove(routineId);
            await loadRoutines();
            if (editingRoutineId === routineId) {
              resetForm();
            }
          } catch (error) {
            Alert.alert('삭제 실패', error instanceof Error ? error.message : '오류가 발생했습니다.');
          }
        },
      },
    ]);
  };

  const handleEdit = (routine: RoutineItem) => {
    setEditingRoutineId(routine.routineId);
    setRoutineName(routine.routineName);
    setExercises(
      routine.exercises.map((exercise) => ({
        exerciseName: exercise.exerciseName,
        id: exercise.id,
      })),
    );
    // setExerciseInput(routine.exercises.map((exercise) => exercise.exerciseName).join(', '));
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="small" color="#E60023" />
      </View>
    );
  }

  const handleExerciseChange = (id: string, text: string) => {
    const updatedExercises = exercises.map((exercise) =>
      exercise.id === id ? { ...exercise, exerciseName: text } : exercise,
    );
    setExercises(updatedExercises);
  };
  const handleAddExercise = () => {
    setExercises([...exercises, { exerciseName: '', id: Math.random().toString() }]);
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>내 루틴 관리</Text>
      <View style={styles.form}>
        <Input placeholder="루틴 이름" value={routineName} onChangeText={setRoutineName} />
        <Button
          label="운동 추가"
          variant="secondary"
          onPress={handleAddExercise}
          disabled={isSaving}
          style={{
            width: 100,
            alignSelf: 'flex-end',
          }}
        />
        {exercises.map((exercise, idx) => (
          <View key={exercise.id} style={{ display: 'flex', flexDirection: 'row', gap: 4, alignItems: 'center' }}>
            <Text>{`운동 ${idx + 1}`}</Text>
            <Input
              key={exercise.id}
              placeholder="예: 벤치프레스, 랫풀다운, 숄더프레스"
              value={exercise.exerciseName}
              onChangeText={(value) => handleExerciseChange(exercise.id, value)}
            />
          </View>
        ))}
        <View style={styles.actionsRow}>
          <Button
            label={isSaving ? '저장 중...' : editingRoutineId ? '루틴 수정' : '루틴 생성'}
            onPress={handleSubmit}
            disabled={isSaving}
          />
          {editingRoutineId ? <Button label="취소" variant="tertiary" onPress={resetForm} disabled={isSaving} /> : null}
        </View>
      </View>

      <FlatList
        data={routines}
        keyExtractor={(item) => item.routineId}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadRoutines} tintColor="#E60023" />}
        ListEmptyComponent={<Text style={styles.emptyText}>등록된 루틴이 없습니다.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.routineName}</Text>
            <Text style={styles.cardSubTitle}>
              {item.exercises.map((exercise) => exercise.exerciseName).join(', ')}
            </Text>
            <View style={styles.cardActions}>
              <Button label="수정" onPress={() => handleEdit(item)} variant="secondary" />
              <Button label="삭제" onPress={() => handleDelete(item.routineId)} variant="tertiary" />
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 10,
  },
  form: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    backgroundColor: '#F7F7F7',
    gap: 5,
  },
  addExerciseButton: {
    width: 60,
  },
  actionsRow: {
    flexDirection: 'column',
    gap: 4,
  },
  listContent: {
    paddingTop: 14,
    paddingBottom: 32,
    gap: 10,
  },
  emptyText: {
    color: '#666666',
    textAlign: 'center',
    marginTop: 24,
  },
  card: {
    borderWidth: 1,
    borderColor: '#E6E6E6',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  cardSubTitle: {
    color: '#666666',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
});
