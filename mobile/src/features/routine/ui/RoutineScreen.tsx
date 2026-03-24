import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { IRoutine } from '@routine-note/package-shared';

import { routineApi } from '../api/routineApi';
import { Button, DraggableSheet } from '../../../shared/ui';
import { initialRoutineSheetProps, RoutineSheet, RoutineSheetProps } from './RoutineSheet';

export const RoutineScreen = () => {
  const [routines, setRoutines] = useState<IRoutine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sheetMode, setSheetMode] = useState<'create' | 'edit' | null>(null);
  const [sheetProps, setSheetProps] = useState<RoutineSheetProps>(initialRoutineSheetProps);

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

  const resetSheet = () => {
    setSheetMode(null);
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
          } catch (error) {
            Alert.alert('삭제 실패', error instanceof Error ? error.message : '오류가 발생했습니다.');
          }
        },
      },
    ]);
  };

  const handleCreate = () => {
    setSheetProps({
      initialName: '',
      initialExercises: [{ name: '', id: '1', trainingType: 'STRENGTH' }],
      editingRoutineId: null,
      onSubmit: async () => {
        await loadRoutines();
        resetSheet();
      },
    });

    setSheetMode('create');
  };
  const handleEdit = (routine: IRoutine) => {
    setSheetProps({
      initialName: routine.name,
      initialExercises: routine.exercises.map((exercise) => ({
        name: exercise.name,
        id: exercise.id,
        trainingType: exercise.trainingType,
      })),
      editingRoutineId: routine.routineId,
      onSubmit: async () => {
        await loadRoutines();
        resetSheet();
      },
    });

    setSheetMode('edit');
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
      <FlatList
        data={routines}
        keyExtractor={(item) => item.routineId}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadRoutines} tintColor="#E60023" />}
        ListEmptyComponent={<Text style={styles.emptyText}>등록된 루틴이 없습니다.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardSubTitle}>{item.exercises.map((exercise) => exercise.name).join(', ')}</Text>
            <View style={styles.cardActions}>
              <Button
                label="수정"
                onPress={() => handleEdit(item)}
                variant="secondary"
                textStyle={{ fontSize: 12 }}
                style={{ paddingHorizontal: 8, paddingVertical: 9 }}
              />
              <Button
                label="삭제"
                onPress={() => handleDelete(item.routineId)}
                variant="tertiary"
                textStyle={{ fontSize: 12 }}
                style={{ paddingHorizontal: 8, paddingVertical: 9 }}
              />
            </View>
          </View>
        )}
      />
      <Button label="루틴 추가하기" onPress={handleCreate} />

      <DraggableSheet
        visible={!!sheetMode}
        onClose={resetSheet}
        renderContent={() => <RoutineSheet {...sheetProps} />}
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
  addExerciseButton: {
    width: 60,
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
