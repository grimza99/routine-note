const API = {
  AUTH: {
    SIGNUP: '/api/auth/signup',
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    PASSWORD_RESET_REQUEST: '/api/auth/password-reset/request',
    PASSWORD_RESET_CONFIRM: '/api/auth/password-reset/confirm',
  },
  ACCOUNT: {
    PROFILE: '/api/account/profile',
    PROFILE_IMAGE: '/api/account/profile-image',
  },
  WORKOUT: {
    CREATE: '/api/workouts',
    UPDATE: (workoutId: string) => `/api/workouts/${workoutId}`,
    DELETE: (workoutId: string) => `/api/workouts/${workoutId}`,
    REPORT: (month: string) => `/api/reports/monthly?month=${month}`,
    BY_DATE: (date: string) => `/api/workouts?date=${date}`,
    SETS: {
      CREATE: (exerciseId: string) => `/api/workout-exercises/${exerciseId}/sets`,
      DELETE: (setId: string) => `/api/sets/${setId}`,
      EDIT: (setId: string) => `/api/sets/${setId}`,
    },
    NOTE: {
      ROUTINE: (workoutRoutineId: string) => `/api/workout-routines/${workoutRoutineId}`,
    },
  },
  REPORT: {
    MONTHLY_ALL: '/api/reports/monthly-all',
    MONTHLY_TRENDS: (month: string) => `/api/reports/monthly-trends?month=${month}`,
    ROUTINE_DISTRIBUTION: (month: string) => `/api/reports/routine-distribution?month=${month}`,
    WEEKLY_VOLUME: (month: string) => `/api/reports/weekly-volume?month=${month}`,
  },
  EVENT: {
    TRACK: '/api/events',
  },
  CHALLENGE: {
    MONTHLY_RANK: (month: string) => `/api/challenges/monthly-rank?month=${month}`,
    MY_RANK: (month?: string) => `/api/challenges/my-rank${month ? `?month=${month}` : ''}`,
  },
  ROUTINE: {
    DETAIL: (routineId: string) => `/api/routines/${routineId}`,
    LIST: '/api/routines',
    CREATE: '/api/routines',
    EDIT: (routineId: string) => `/api/routines/${routineId}`,
    DELETE: (routineId: string) => `/api/routines/${routineId}`,
  },
};

export default API;
