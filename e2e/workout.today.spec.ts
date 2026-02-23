import { expect, test, type Page } from '@playwright/test';

export const formatLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getAuthToken = async (page: Page) => {
  const cookies = await page.context().cookies();
  const tokenCookie = cookies.find((cookie) => cookie.name === 'sb_access_token');
  if (!tokenCookie?.value) {
    throw new Error('sb_access_token cookie not found');
  }
  return tokenCookie.value;
};

test.use({ storageState: 'e2e/.auth/user.json' });

test.describe.serial('오늘 운동 기록 e2e', () => {
  test('생성, 수정(세트 저장), 삭제', async ({ page }) => {
    const token = await getAuthToken(page);
    const routineName = `E2E-${Date.now()}`;

    const routineResponse = await page.request.post('/api/routines', {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      data: {
        routineName,
        exercises: [{ exerciseName: '스쿼트' }],
      },
    });

    expect(routineResponse.ok()).toBeTruthy();

    await page.goto('/routine/routine-cal');
    await page.getByRole('button', { name: '운동 기록 추가' }).click();

    const recordDialog = page.getByRole('dialog');
    await expect(recordDialog).toBeVisible();

    const routineHeading = recordDialog.getByRole('heading', { name: routineName });
    await expect(routineHeading).toBeVisible();
    await routineHeading.click();

    await recordDialog.getByRole('button', { name: '루틴외의 운동 추가하기' }).click();
    await recordDialog.getByLabel(/운동1 이름/).fill('푸쉬업');
    await recordDialog.getByRole('button', { name: '확인' }).click();
    await expect(recordDialog).toBeHidden();

    const recordedRoutineHeading = page.getByRole('heading', { name: routineName });
    await expect(recordedRoutineHeading).toBeVisible();

    await recordedRoutineHeading.click();
    const manageDialog = page.getByRole('dialog');
    await expect(manageDialog).toBeVisible();

    await manageDialog.getByRole('button', { name: /값 증가/ }).click();
    const setInputs = manageDialog.getByRole('spinbutton');
    await setInputs.nth(0).fill('20');
    await setInputs.nth(1).fill('8');

    await manageDialog.getByRole('button', { name: '저장' }).click();
    await expect(manageDialog).toBeHidden();

    const today = formatLocalDate(new Date());
    const workoutResponse = await page.request.get(`/api/workouts?date=${today}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(workoutResponse.ok()).toBeTruthy();
    const workout = (await workoutResponse.json()) as { id?: string } | null;
    expect(workout?.id).toBeTruthy();

    const deleteResponse = await page.request.delete(`/api/workouts/${workout?.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(deleteResponse.ok()).toBeTruthy();

    await page.reload();
    await expect(page.getByText('운동 기록이 없습니다.')).toBeVisible();
  });
});
