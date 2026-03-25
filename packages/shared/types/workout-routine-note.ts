export type IWorkoutRoutineNotePayload = {
  note?: string;
};

export type IWorkoutRoutineNoteResponse = {
  id: string;
  routineId: string;
  note: string | null;
};
