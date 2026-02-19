import { Pressable, StyleSheet, Text, View } from 'react-native';
import { WorkoutExerciseItem } from '../../../shared/types/workout';
import { WorkoutRoutineCardStyle as styles } from './WorkoutRoutineCardWithSets';

// workout 생성시 루틴을 선택할수있는 카드
interface WorkoutRoutineCardProps {
  routineName: string;
  exercises: WorkoutExerciseItem[];
  selected?: boolean;
  onPress?: () => void;
}

export function WorkoutRoutineCard({ routineName, exercises, onPress, selected }: WorkoutRoutineCardProps) {
  if (exercises.length < 1) {
    return null;
  }

  return (
    <Pressable style={[styles.container, selected && ownStyles.selectedStyle]} onPress={onPress}>
      <Text style={styles.title}>{routineName}</Text>
      <View style={styles.exerciseList}>
        {exercises.map((exercise) => (
          <View key={exercise.id} style={styles.exerciseItem}>
            <Text style={[styles.text, styles.ellipsizeText]} numberOfLines={1} ellipsizeMode="tail">
              {exercise.exerciseName}
            </Text>
          </View>
        ))}
      </View>
    </Pressable>
  );
}

const ownStyles = StyleSheet.create({
  selectedStyle: {
    borderWidth: 2,
    borderColor: '#E60023',
  },
});
