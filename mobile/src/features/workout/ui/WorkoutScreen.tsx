import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { routineApi } from '../../routine/api/routineApi';
import { workoutApi } from '../api/workoutApi';
import { trackEvent } from '../../../shared/libs/analytics/track';
import type { RoutineItem } from '../../../shared/types/routine';
import type { WorkoutItem } from '../../../shared/types/workout';
import { Button } from '../../../shared/ui';

type ExerciseSetConfig = {
  order: number;
  exerciseName: string;
  setCountInput: string;
  weightInput: string;
  repsInput: string;
};

const parsePositiveInt = (value: string, fallback: number) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
};

const parseNonNegativeNumber = (value: string, fallback: number) => {
  const parsed = Number.parseFloat(value);
  if (Number.isNaN(parsed) || parsed < 0) {
    return fallback;
  }

  return parsed;
};

const createDefaultSetConfig = (order: number, exerciseName: string): ExerciseSetConfig => ({
  order,
  exerciseName,
  setCountInput: '3',
  weightInput: '20',
  repsInput: '10',
});

export const WorkoutScreen = () => {
  const [date, setDate] = useState(workoutApi.toDate(new Date()));
  const [routines, setRoutines] = useState<RoutineItem[]>([]);
  const [selectedRoutineIds, setSelectedRoutineIds] = useState<string[]>([]);
  const [exerciseInput, setExerciseInput] = useState('');
  const [exerciseSetConfigs, setExerciseSetConfigs] = useState<ExerciseSetConfig[]>([]);
  const [workout, setWorkout] = useState<WorkoutItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadRoutines = useCallback(async () => {
    const list = await routineApi.list();
    setRoutines(list);
  }, []);

  const loadWorkout = useCallback(async (selectedDate: string) => {
    const item = await workoutApi.getByDate(selectedDate);
    setWorkout(item);
    setSelectedRoutineIds(item?.routines.map((routine) => routine.routineId) ?? []);

    const exerciseNames = item?.exercises.map((exercise) => exercise.name).join(', ') ?? '';
    setExerciseInput(exerciseNames);

    const loadedSetConfigs =
      item?.exercises.map((exercise, index) => {
        const firstSet = exercise.sets?.[0];
        return {
          order: index + 1,
          exerciseName: exercise.name,
          setCountInput: String(exercise.sets?.length ?? 0),
          weightInput: String(firstSet?.weight ?? 0),
          repsInput: String(firstSet?.reps ?? 1),
        };
      }) ?? [];

    setExerciseSetConfigs(loadedSetConfigs);
  }, []);

  const loadAll = useCallback(async () => {
    try {
      setIsLoading(true);
      await Promise.all([loadRoutines(), loadWorkout(date)]);
    } catch (error) {
      Alert.alert('조회 실패', error instanceof Error ? error.message : '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [date, loadRoutines, loadWorkout]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const exercisePayload = useMemo(() => workoutApi.parseExercises(exerciseInput), [exerciseInput]);

  useEffect(() => {
    setExerciseSetConfigs((prev) =>
      exercisePayload.map((exercise) => {
        const existing = prev.find(
          (config) => config.order === exercise.order && config.exerciseName === exercise.exerciseName,
        );
        return existing ?? createDefaultSetConfig(exercise.order, exercise.exerciseName);
      }),
    );
  }, [exercisePayload]);

  const toggleRoutine = (routineId: string) => {
    setSelectedRoutineIds((prev) =>
      prev.includes(routineId) ? prev.filter((value) => value !== routineId) : [...prev, routineId],
    );
  };

  const updateSetConfig = (
    order: number,
    field: keyof Omit<ExerciseSetConfig, 'order' | 'exerciseName'>,
    value: string,
  ) => {
    setExerciseSetConfigs((prev) =>
      prev.map((config) => (config.order === order ? { ...config, [field]: value } : config)),
    );
  };

  const buildPayload = () => ({
    date,
    routines: selectedRoutineIds.map((routineId, index) => ({
      routineId,
      order: index + 1,
      note: '',
    })),
    exercises: exercisePayload,
  });

  const createSetsForExercises = async (savedWorkout: WorkoutItem | null) => {
    if (!savedWorkout?.exercises?.length) return;

    for (const config of exerciseSetConfigs) {
      const targetExercise = savedWorkout.exercises.find((exercise) => exercise.order === config.order);
      if (!targetExercise) continue;

      const setCount = parsePositiveInt(config.setCountInput, 0);
      const weight = parseNonNegativeNumber(config.weightInput, 0);
      const reps = parsePositiveInt(config.repsInput, 1);

      if (!setCount) continue;

      for (let index = 0; index < setCount; index += 1) {
        await workoutApi.createSet(targetExercise.id, {
          weight,
          reps,
          note: '',
        });
      }
    }
  };

  const totalPlannedSets = useMemo(
    () => exerciseSetConfigs.reduce((sum, config) => sum + parsePositiveInt(config.setCountInput, 0), 0),
    [exerciseSetConfigs],
  );

  const handleSave = async () => {
    if (!date.trim()) {
      Alert.alert('입력 확인', '날짜를 입력해 주세요.');
      return;
    }

    try {
      setIsSaving(true);
      const payload = buildPayload();

      let savedWorkout: WorkoutItem | null = null;
      if (workout?.id) {
        savedWorkout = await workoutApi.update(workout.id, payload);
      } else {
        savedWorkout = await workoutApi.create(payload);
      }

      await createSetsForExercises(savedWorkout);
      await loadWorkout(date);
      void trackEvent('workout_saved', {
        date,
        routineCount: payload.routines.length,
        exerciseCount: payload.exercises.length,
      });
      if (payload.routines.length > 0) {
        void trackEvent('routine_applied', {
          date,
          routineCount: payload.routines.length,
        });
      }
      Alert.alert('완료', workout?.id ? '운동 기록을 수정했습니다.' : '운동 기록을 생성했습니다.');
    } catch (error) {
      Alert.alert('저장 실패', error instanceof Error ? error.message : '오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (!workout?.id) {
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
            await workoutApi.remove(workout.id);
            setWorkout(null);
            setSelectedRoutineIds([]);
            setExerciseInput('');
            setExerciseSetConfigs([]);
            Alert.alert('완료', '운동 기록을 삭제했습니다.');
          } catch (error) {
            Alert.alert('삭제 실패', error instanceof Error ? error.message : '오류가 발생했습니다.');
          }
        },
      },
    ]);
  };

  const handleDateSearch = async () => {
    try {
      setIsLoading(true);
      await loadWorkout(date);
    } catch (error) {
      Alert.alert('조회 실패', error instanceof Error ? error.message : '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="small" color="#E60023" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.containerContent}>
      <Text style={styles.title}>운동 기록</Text>
      <Text style={styles.description}>날짜를 기준으로 운동 기록을 생성/수정/삭제합니다.</Text>

      <View style={styles.form}>
        <View style={styles.inlineRow}>
          <TextInput
            value={date}
            onChangeText={setDate}
            style={[styles.input, styles.dateInput]}
            placeholder="YYYY-MM-DD"
          />
          <Button
            label="조회"
            variant="secondary"
            onPress={handleDateSearch}
            disabled={isSaving}
            style={{
              width: 100,
              alignSelf: 'flex-end',
            }}
          />
        </View>

        <Text style={styles.label}>루틴 선택</Text>
        <FlatList
          data={routines}
          horizontal
          keyExtractor={(item) => item.routineId}
          contentContainerStyle={styles.routineList}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadAll} tintColor="#E60023" />}
          renderItem={({ item }) => {
            const selected = selectedRoutineIds.includes(item.routineId);
            return (
              <Button
                label={item.routineName}
                onPress={() => toggleRoutine(item.routineId)}
                variant={selected ? 'primary' : 'secondary'}
              />
            );
          }}
          ListEmptyComponent={<Text style={styles.emptyText}>선택 가능한 루틴이 없습니다.</Text>}
          showsHorizontalScrollIndicator={false}
        />

        <Text style={styles.label}>개별 운동(콤마 구분)</Text>
        <TextInput
          value={exerciseInput}
          onChangeText={setExerciseInput}
          style={[styles.input, styles.multiline]}
          multiline
          placeholder="예: 푸쉬업, 플랭크"
        />

        <Text style={styles.label}>운동별 세트 값</Text>
        {exerciseSetConfigs.length ? (
          <View style={styles.setConfigList}>
            {exerciseSetConfigs.map((config) => (
              <View key={`${config.order}-${config.exerciseName}`} style={styles.setConfigCard}>
                <Text style={styles.setConfigTitle}>
                  {config.order}. {config.exerciseName}
                </Text>
                <View style={styles.inlineRow}>
                  <TextInput
                    value={config.setCountInput}
                    onChangeText={(value) => updateSetConfig(config.order, 'setCountInput', value)}
                    style={[styles.input, styles.metricInput]}
                    keyboardType="number-pad"
                    placeholder="세트수"
                  />
                  <TextInput
                    value={config.weightInput}
                    onChangeText={(value) => updateSetConfig(config.order, 'weightInput', value)}
                    style={[styles.input, styles.metricInput]}
                    keyboardType="decimal-pad"
                    placeholder="무게"
                  />
                  <TextInput
                    value={config.repsInput}
                    onChangeText={(value) => updateSetConfig(config.order, 'repsInput', value)}
                    style={[styles.input, styles.metricInput]}
                    keyboardType="number-pad"
                    placeholder="횟수"
                  />
                </View>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>운동을 입력하면 세트 값을 개별 설정할 수 있어요.</Text>
        )}

        <View style={styles.actionsRow}>
          <Button
            label={isSaving ? '저장 중...' : workout?.id ? '운동 수정' : '운동 생성'}
            onPress={handleSave}
            disabled={isSaving}
          />
          <Button label="삭제" onPress={handleDelete} disabled={isSaving} variant="tertiary" />
        </View>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>현재 상태</Text>
        <Text style={styles.summaryText}>기록 ID: {workout?.id ?? '없음'}</Text>
        <Text style={styles.summaryText}>선택 루틴 수: {selectedRoutineIds.length}</Text>
        <Text style={styles.summaryText}>개별 운동 수: {exercisePayload.length}</Text>
        <Text style={styles.summaryText}>입력 세트(총합): {totalPlannedSets}세트</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  containerContent: {
    padding: 16,
    paddingBottom: 40,
  },
  metricInput: {
    flex: 1,
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
    borderWidth: 1,
    borderColor: '#E6E6E6',
    borderRadius: 8,
    backgroundColor: '#F7F7F7',
    padding: 12,
    gap: 10,
  },
  inlineRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E6E6E6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  dateInput: {
    flex: 1,
  },
  label: {
    fontWeight: '600',
    color: '#1A1A1A',
  },
  routineList: {
    gap: 8,
  },

  routineChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  routineChipTextDefault: {
    color: '#1A1A1A',
  },
  multiline: {
    minHeight: 70,
    textAlignVertical: 'top',
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
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  summaryCard: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FFFFFF',
    gap: 4,
  },
  summaryTitle: {
    fontWeight: '700',
    color: '#1A1A1A',
  },
  summaryText: {
    color: '#666666',
  },
  emptyText: {
    color: '#666666',
    paddingVertical: 8,
  },
});
