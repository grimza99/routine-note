import { expect, test } from '@playwright/test';

test.describe.serial('회원가입, 로그인 테스트', () => {
  const password = 'password123';
  let email = '';
  let nickname = '';

  test.beforeAll(() => {
    email = `e2e+${Date.now()}@example.com`;
    nickname = `e2e-user-${Date.now()}`;
  });

  test('signup', async ({ page }) => {
    await page.goto('/auth');
    await page.getByRole('button', { name: '회원가입' }).click();

    const form = page.locator('form');

    await page.getByLabel('이메일 *').fill(email);
    await page.getByLabel('이름 *').fill('E2E-User');
    await page.getByLabel('닉네임').fill(nickname);
    await page.getByLabel('비밀번호 *').fill(password);
    await page.getByRole('checkbox', { name: '개인정보 수집 및 이용에 동의합니다.' }).check();

    const submitButton = form.getByRole('button', { name: '회원가입' });
    await submitButton.click();
    await expect(page).toHaveURL(/\/routine\/routine-cal/);
  });

  test('login', async ({ page }) => {
    await page.goto('/auth');
    const form = page.locator('form');

    await page.getByLabel('이메일').fill(email);
    await page.getByLabel('비밀번호').fill(password);
    await form.getByRole('button', { name: '로그인' }).click();

    await expect(page).toHaveURL(/\/routine\/routine-cal/);
  });
});
