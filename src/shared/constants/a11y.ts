import { memo } from 'react';

export const A11Y_LABELS = {
  AUTH: {
    withdraw: '회원 탈퇴하기',
  },
  ROUTINE: {
    create: '새 루틴 추가하기',
    edit: '루틴 수정 하기',
    delete: '루틴 삭제 하기',

    addExercise: '루틴에 운동 추가',
    confirmCreate: '루틴 저장',
    confirmEdit: '루틴 수정 저장',
    confirmDelete: '루틴 삭제 확인',
  },
  WORKOUT: {
    create: '운동 기록 추가',
    delete: '운동 기록 삭제',
    addStandAloneExercise: '루틴외의 운동 추가하기',
    confirmCreate: '운동 기록 저장',
    confirmDelete: '운동 기록 삭제 확인',
  },
  WORKOUT_SETS: {
    addSet: '세트 추가하기',
    deleteSet: '세트 삭제하기',

    weightInput: '세트 무게 입력',
    repsInput: '세트 반복 횟수 입력',
    memoInput: '루틴 메모 입력',

    confirmCreate: '세트 저장',
  },
} as const;
