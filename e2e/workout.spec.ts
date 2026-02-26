import { expect, test, type Page } from '@playwright/test';
import { A11Y_LABELS } from '../src/shared/constants';
import { getAuthToken } from './auth-utils';

test.use({ storageState: 'e2e/.auth/user.json' });

const routineName = `E2E-workout-test(${Date.now()})`;

const clearWorkoutIfExists = async (page: Page) => {
  const deleteButton = page.getByRole('button', { name: A11Y_LABELS.WORKOUT.delete });
  const emptyWorkoutText = page.getByText('운동 기록이 없습니다.');

  if (emptyWorkoutText) {
    return;
  }

  await deleteButton.click();
  const deleteConfirmDialog = page.getByRole('dialog');
  await deleteConfirmDialog.getByRole('button', { name: A11Y_LABELS.WORKOUT.confirmDelete }).click();
  await expect(deleteConfirmDialog).toBeHidden();
};

test.describe.serial('workout 테스트', () => {
  test('workout 생성', async ({ page }) => {
    const token = await getAuthToken(page);
    await page.request.post('/api/routines', {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      data: { routineName, exercises: [{ exerciseName: '스쿼트' }] },
    });

    await page.goto('/workout/workout-cal');
    await clearWorkoutIfExists(page);
    await page.getByRole('button', { name: A11Y_LABELS.WORKOUT.create }).click();

    const recordDialog = page.getByRole('dialog');
    await expect(recordDialog).toBeVisible();

    const routineHeading = recordDialog.getByRole('heading', { name: routineName });
    await expect(routineHeading).toBeVisible();
    await routineHeading.click();

    await recordDialog.getByRole('button', { name: A11Y_LABELS.WORKOUT.addStandAloneExercise }).click();
    const exerciseInputs = recordDialog.getByLabel(/운동\d+ 이름/);
    await expect(exerciseInputs.last()).toBeVisible();
    await exerciseInputs.last().fill('푸쉬업');

    const createResponsePromise = page.waitForResponse(
      (response) =>
        /\/api\/workouts(?:\/[^/]+)?$/.test(response.url()) && ['POST'].includes(response.request().method()),
    );
    await recordDialog.getByRole('button', { name: A11Y_LABELS.WORKOUT.confirmCreate }).click();
    const createResponse = await createResponsePromise;
    expect(createResponse.ok()).toBeTruthy();
    await expect(recordDialog).toBeHidden();
  });

  test('workout 수정', async ({ page }) => {
    await page.goto('/workout/workout-cal');

    await expect(page.getByRole('heading', { name: routineName })).toBeVisible();

    await page.getByRole('button', { name: A11Y_LABELS.WORKOUT.create }).click();

    const manageDialog = page.getByRole('dialog');
    await expect(manageDialog).toBeVisible();

    const routineHeading = manageDialog.getByRole('heading', { name: routineName });
    await expect(routineHeading).toBeVisible();

    await manageDialog.getByRole('button', { name: A11Y_LABELS.WORKOUT.addStandAloneExercise }).click();
    await expect(manageDialog).toBeVisible();

    const exerciseInputs = manageDialog.getByLabel(/운동\d+ 이름/);
    await expect(exerciseInputs.last()).toBeVisible();
    await exerciseInputs.last().fill('달리기');

    const updateResponsePromise = page.waitForResponse(
      (response) => /\/api\/workouts\/[^/]+$/.test(response.url()) && response.request().method() === 'PUT',
    );
    await manageDialog.getByRole('button', { name: A11Y_LABELS.WORKOUT.confirmCreate }).click();
    const updateResponse = await updateResponsePromise;
    expect(updateResponse.ok()).toBeTruthy();
    await expect(manageDialog).toBeHidden();
  });

  test('workout 삭제', async ({ page }) => {
    await page.goto('/workout/workout-cal');

    await page.getByRole('button', { name: A11Y_LABELS.WORKOUT.delete }).click();
    const deleteConfirmDialog = page.getByRole('dialog');
    await deleteConfirmDialog.getByRole('button', { name: A11Y_LABELS.WORKOUT.confirmDelete }).click();
    await expect(deleteConfirmDialog).toBeHidden();
    await expect(page.getByText('운동 기록이 없습니다.')).toBeVisible();
  });
});
