import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';

import { workoutApi } from '../api/workoutApi';
import { Button, DraggableSheet } from '../../../shared/ui';
import { WorkoutCalendar } from './WorkoutCalendar';
import { formatDate, formatMonthDay, trackEvent } from '../../../shared/libs';
import { WorkoutRoutineCardWithSets } from './WorkoutRoutineCardWithSets';
import { WorkoutBydateResponse } from '../../../shared/types';
import { WorkoutSheet } from './sheet/WorkoutSheet';
import { WorkoutSetsSheet } from './sheet/WorkoutSetsSheet';

export const WorkoutScreen = () => {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [sheetMode, setSheetMode] = useState<'create' | 'manage' | 'sets' | null>(null); //null이면 닫힘
  const [workoutByDate, setWorkoutByDate] = useState<WorkoutBydateResponse | null>(null);

  const loadWorkoutByDate = useCallback(
    async (selectedDate: string) => {
      const workoutByDateData = await workoutApi.getByDate(selectedDate);
      setWorkoutByDate(workoutByDateData);
    },
    [selectedDate],
  );

  useEffect(() => {
    const initialize = async () => {
      try {
        setIsInitialLoading(true);
        await loadWorkoutByDate(formatDate(selectedDate));
      } catch (error) {
        Alert.alert('조회 실패', error instanceof Error ? error.message : '오류가 발생했습니다.');
      } finally {
        setIsInitialLoading(false);
      }
    };

    void initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadWorkoutByDate, selectedDate]);

  if (isInitialLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="small" color="#E60023" />
      </View>
    );
  }

  const handleDelete = () => {
    if (!workoutByDate?.id) {
      Alert.alert('안내', '삭제할 운동 기록이 없습니다.');
      return;
    }

    Alert.alert('운동 기록 삭제', '선택한 날짜의 운동 기록을 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await workoutApi.remove(workoutByDate.id);
            await loadWorkoutByDate(formatDate(selectedDate));
            setSheetMode(null);
            Alert.alert('완료', '운동 기록을 삭제했습니다.');
            void trackEvent('workout_removed', {
              date: formatDate(selectedDate),
            });
          } catch (error) {
            Alert.alert('삭제 실패', error instanceof Error ? error.message : '오류가 발생했습니다.');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.containerContent}>
        <Text style={styles.title}>운동 기록</Text>
        <Text style={styles.description}>하단 시트에서 운동 기록을 관리할수있어요!</Text>
        <WorkoutCalendar
          currentDate={selectedDate}
          onSelectDate={(selectedDate) => {
            setSelectedDate(selectedDate);
          }}
        />
      </View>
      {/* workout 기록 */}
      <View style={styles.workoutSection}>
        <View style={styles.workoutSectionHeader}>
          <Text style={styles.secondaryTitle}>{formatMonthDay(selectedDate)} 기록</Text>
          <Button
            label="세트 기록 하기"
            onPress={() => setSheetMode('sets')}
            style={{ paddingHorizontal: 6, paddingVertical: 4 }}
            variant="secondary"
          />
          <Button
            label="운동 기록 전체 삭제"
            onPress={handleDelete}
            style={{ paddingHorizontal: 6, paddingVertical: 4 }}
          />
        </View>
        <ScrollView contentContainerStyle={styles.workoutListContent} style={styles.workoutList}>
          {isInitialLoading && (
            <View style={styles.centeredInline}>
              <ActivityIndicator size="small" color="#E60023" />
            </View>
          )}

          {!workoutByDate ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>저장된 운동 기록이 없습니다.</Text>
              <Text style={styles.emptyText}>아래에서 바로 새 운동 기록을 생성할 수 있습니다.</Text>
              <Button label="운동 기록 생성하기" onPress={() => setSheetMode('create')} variant="secondary" />
            </View>
          ) : null}

          {workoutByDate?.routines && (
            <>
              {workoutByDate?.routines.length > 0 &&
                workoutByDate?.routines.map((routine) => (
                  <WorkoutRoutineCardWithSets
                    key={routine.routineId}
                    title={routine.routineName ?? '루틴'}
                    exercises={routine.exercises}
                  />
                ))}
            </>
          )}
          {workoutByDate?.exercises && (
            <WorkoutRoutineCardWithSets title={'루틴외 운동'} exercises={workoutByDate.exercises} />
          )}
        </ScrollView>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="하단 시트 열기"
        style={styles.sheetHandleTrigger}
        onPress={() => setSheetMode(workoutByDate ? 'manage' : 'create')}
      >
        <AntDesign name="caret-up" size={24} color="black" />
      </Pressable>

      <DraggableSheet
        visible={!!sheetMode}
        onClose={() => setSheetMode(null)}
        renderContent={() => (
          <ScrollView contentContainerStyle={styles.sheetContent}>
            {sheetMode !== 'sets' ? (
              <WorkoutSheet
                selectedDate={selectedDate}
                initialWorkoutData={workoutByDate}
                onSubmitSuccess={async (date) => {
                  await loadWorkoutByDate(formatDate(date));
                  setSheetMode(null);
                }}
              />
            ) : (
              <WorkoutSetsSheet
                selectedDate={selectedDate}
                initialWorkoutData={workoutByDate}
                onSubmitSuccess={async (date) => {
                  await loadWorkoutByDate(formatDate(date));
                  setSheetMode(null);
                }}
              />
            )}
          </ScrollView>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingBottom: 30,
  },
  containerContent: {
    padding: 16,
    gap: 10,
  },
  workoutSection: {
    flex: 1,
    paddingHorizontal: 16,
    gap: 10,
  },
  workoutList: {
    flex: 1,
    minHeight: 0,
  },
  workoutListContent: {
    display: 'flex',
    gap: 12,
    paddingBottom: 20,
  },
  workoutSectionHeader: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  centeredInline: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  secondaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  description: {
    color: '#666666',
  },

  sheetHandleTrigger: {
    position: 'absolute',
    left: '50%',
    bottom: 6,
    marginLeft: -100,
    width: 200,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    zIndex: 20,
  },

  sheetContent: {
    gap: 10,
    paddingBottom: 40,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },

  sectionTitle: {
    marginTop: 4,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  exerciseRowButton: {
    justifyContent: 'flex-start',
  },
  emptyCard: {
    borderWidth: 1,
    borderColor: '#E6E6E6',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  emptyTitle: {
    fontWeight: '700',
    color: '#1A1A1A',
  },
  emptyText: {
    color: '#666666',
  },

  focusedExerciseText: {
    color: '#1A1A1A',
    fontWeight: '600',
  },

  setConfigList: {
    gap: 8,
  },
  setConfigCard: {
    borderWidth: 1,
    borderColor: '#E6E6E6',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    padding: 10,
    gap: 8,
  },
  setConfigTitle: {
    fontWeight: '600',
    color: '#1A1A1A',
  },
  inlineRow: {
    flexDirection: 'row',
    gap: 8,
  },
  flex1: {
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
});
