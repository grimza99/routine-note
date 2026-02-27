import { expect, test } from '@playwright/test';
import { getAuthToken } from './auth-utils';

test.describe.serial('테스트 이후 DB 관리를 위한 탈퇴', () => {
  test('withdraw', async ({ page }) => {
    await page.goto('/');

    const token = await getAuthToken(page);
    const deleteResponse = await page.request.delete('/api/auth/hard-delete-withdraw', {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (!deleteResponse.ok()) {
      console.error('회원 탈퇴 실패:', await deleteResponse.text());
    }
    expect(deleteResponse.ok()).toBeTruthy();
  });
});
