const API = {
  AUTH: {
    SIGNUP: '/api/auth/signup',
    LOGIN: '/api/auth/login',
  },
  WORKOUT: {
    REPORT: (month: string) => `/api/reports/monthly?month=${month}`,
  },
};

export default API;
