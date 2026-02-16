import { StyleSheet, Text, View } from 'react-native';
import { WorkoutExerciseItem } from '../../../shared/types/workout';

interface WorkoutRoutineCardProps {
  title: string;
  exercises: WorkoutExerciseItem[];
}

export function WorkoutRoutineCard({ title, exercises }: WorkoutRoutineCardProps) {
  if (exercises.length < 1) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.exerciseList}>
        {exercises.map((exercise) => (
          <View key={exercise.id} style={styles.exerciseItem}>
            <Text style={[styles.text, styles.ellipsizeText]} numberOfLines={1} ellipsizeMode="tail">
              {exercise.name}
            </Text>
            {exercise.sets && <Text style={styles.text}>{exercise.sets.length}세트</Text>}
          </View>
        ))}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    color: '#1A1A1A',
  },
  title: {
    fontWeight: '700',
    color: '#E60023',
  },
  exerciseList: {
    marginTop: 8,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  exerciseItem: {
    flex: 0,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#F5F5F5',
  },
  text: {
    fontSize: 12,
    color: '#E60023',
    fontWeight: 600,
  },
  ellipsizeText: {
    maxWidth: 100,
  },
});
