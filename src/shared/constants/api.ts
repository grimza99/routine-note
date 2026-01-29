const API = {
  AUTH: {
    SIGNUP: '/api/auth/signup',
    LOGIN: '/api/auth/login',
  },
  WORKOUT: {
    REPORT: (month: string) => `/api/reports/monthly?month=${month}`,
    BY_DATE: (date: string) => `/api/workouts?date=${date}`,
  },
  ROUTINE: {
    LIST: '/api/routines',
    CREATE: '/api/routines',
  },
};

export default API;
