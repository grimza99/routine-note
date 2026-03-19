import type { Page } from '@playwright/test';
import { TOKEN } from '../packages/index';

export const getAuthToken = async (page: Page) => {
  const cookies = await page.context().cookies();
  const tokenCookie = cookies.find((cookie) => cookie.name === TOKEN.ACCESS);
  if (!tokenCookie?.value) {
    throw new Error('sb_access_token cookie not found');
  }
  return tokenCookie.value;
};
