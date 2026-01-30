const API = {
  AUTH: {
    SIGNUP: '/api/auth/signup',
    LOGIN: '/api/auth/login',
  },
  WORKOUT: {
    CREATE: '/api/workouts',
    REPORT: (month: string) => `/api/reports/monthly?month=${month}`,
    BY_DATE: (date: string) => `/api/workouts?date=${date}`,
  },
  ROUTINE: {
    DETAIL: (routineId: string) => `/api/routines/${routineId}`,
    LIST: '/api/routines',
    CREATE: '/api/routines',
    EDIT: (routineId: string) => `/api/routines/${routineId}`,
  },
};

export default API;
