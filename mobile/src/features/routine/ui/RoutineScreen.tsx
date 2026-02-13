import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { routineApi } from '../api/routineApi';
import type { RoutineItem } from '../../../shared/types/routine';

export const RoutineScreen = () => {
  const [routines, setRoutines] = useState<RoutineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [routineName, setRoutineName] = useState('');
  const [exerciseInput, setExerciseInput] = useState('');
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

  const exercisePayload = useMemo(() => routineApi.parseExercises(exerciseInput), [exerciseInput]);

  const resetForm = () => {
    setRoutineName('');
    setExerciseInput('');
    setEditingRoutineId(null);
  };

  const handleSubmit = async () => {
    if (!routineName.trim()) {
      Alert.alert('입력 확인', '루틴 이름을 입력해 주세요.');
      return;
    }

    if (!exercisePayload.length) {
      Alert.alert('입력 확인', '운동을 1개 이상 입력해 주세요.');
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        routineName: routineName.trim(),
        exercises: exercisePayload,
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
    setExerciseInput(routine.exercises.map((exercise) => exercise.exerciseName).join(', '));
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="small" color="#E60023" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>루틴 관리</Text>
      <Text style={styles.description}>운동은 콤마(,)로 구분해서 입력합니다.</Text>

      <View style={styles.form}>
        <TextInput
          placeholder="루틴 이름"
          style={styles.input}
          value={routineName}
          onChangeText={setRoutineName}
        />
        <TextInput
          placeholder="예: 벤치프레스, 랫풀다운, 숄더프레스"
          style={[styles.input, styles.multiline]}
          multiline
          value={exerciseInput}
          onChangeText={setExerciseInput}
        />
        <View style={styles.actionsRow}>
          <Pressable style={styles.primaryButton} onPress={handleSubmit} disabled={isSaving}>
            <Text style={styles.primaryButtonText}>
              {isSaving ? '저장 중...' : editingRoutineId ? '루틴 수정' : '루틴 생성'}
            </Text>
          </Pressable>
          {editingRoutineId ? (
            <Pressable style={styles.secondaryButton} onPress={resetForm}>
              <Text style={styles.secondaryButtonText}>취소</Text>
            </Pressable>
          ) : null}
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
            <Text style={styles.cardSubTitle}>{item.exercises.map((exercise) => exercise.exerciseName).join(', ')}</Text>
            <View style={styles.cardActions}>
              <Pressable style={styles.cardEditButton} onPress={() => handleEdit(item)}>
                <Text style={styles.cardEditText}>수정</Text>
              </Pressable>
              <Pressable style={styles.cardDeleteButton} onPress={() => handleDelete(item.routineId)}>
                <Text style={styles.cardDeleteText}>삭제</Text>
              </Pressable>
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
  },
  description: {
    marginTop: 6,
    marginBottom: 10,
    color: '#666666',
  },
  form: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    backgroundColor: '#F7F7F7',
    gap: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E6E6E6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  multiline: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#E60023',
    borderRadius: 8,
    alignItems: 'center',
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  secondaryButton: {
    minWidth: 72,
    borderWidth: 1,
    borderColor: '#E60023',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  secondaryButtonText: {
    color: '#E60023',
    fontWeight: '600',
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
  cardEditButton: {
    borderWidth: 1,
    borderColor: '#E60023',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cardEditText: {
    color: '#E60023',
    fontWeight: '600',
  },
  cardDeleteButton: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cardDeleteText: {
    color: '#666666',
    fontWeight: '600',
  },
});
