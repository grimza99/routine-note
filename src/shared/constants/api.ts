const API = {
  AUTH: {
    SIGNUP: '/api/auth/signup',
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
  },
  WORKOUT: {
    CREATE: '/api/workouts',
    REPORT: (month: string) => `/api/reports/monthly?month=${month}`,
    BY_DATE: (date: string) => `/api/workouts?date=${date}`,
    SETS: {
      CREATE: (exerciseId: string) => `/workout-exercises/${exerciseId}/sets`,
    },
    NOTE: {
      ROUTINE: (workoutRoutineId: string) => `/api/workout-routines/${workoutRoutineId}`,
    },
  },
  REPORT: {
    MONTHLY_TRENDS: '/api/reports/monthly-trends',
    ROUTINE_DISTRIBUTION: (month: string) => `/api/reports/routine-distribution?month=${month}`,
    WEEKLY_VOLUME: (month: string) => `/api/reports/weekly-volume?month=${month}`,
  },
  ROUTINE: {
    DETAIL: (routineId: string) => `/api/routines/${routineId}`,
    LIST: '/api/routines',
    CREATE: '/api/routines',
    EDIT: (routineId: string) => `/api/routines/${routineId}`,
  },
};

export default API;
