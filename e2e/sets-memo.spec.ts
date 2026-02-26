import { expect, test } from '@playwright/test';
import { A11Y_LABELS } from '../src/shared/constants';
import { getAuthToken } from './auth-utils';
import { formatDate } from '../src/shared/libs/date/format';

test.use({ storageState: 'e2e/.auth/user.json' });

const routineName = `E2E-sets-test(${Date.now()})`;

test.describe.serial('sets-memo 테스트', () => {
  test('sets 테스트전 사전 준비 workout 생성', async ({ page }) => {
    const emptyWorkoutText = page.getByText('운동 기록이 없습니다.');

    const hasWorkout = await emptyWorkoutText.isVisible().then(
      (visible) => visible,
      () => false,
    );

    if (!hasWorkout) {
      const token = await getAuthToken(page);
      const routineResponse = await page.request.post('/api/routines', {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        data: { routineName, exercises: [{ exerciseName: '스쿼트' }] },
      });

      if (!routineResponse.ok()) {
        throw new Error(`루틴 생성 실패: ${routineResponse.status()} ${routineResponse.statusText()}`);
      }
      const routineData = await routineResponse.json();

      const workoutResponse = await page.request.post('/api/workouts', {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        data: {
          date: formatDate(new Date()),
          routines: [{ routineId: routineData.routineId }],
          exercises: [],
        },
      });
    }
  });

  test('sets-memo', async ({ page }) => {
    await page.goto('/workout/workout-cal');

    /**----------workout routine card click */
    const workoutClickHeading = page.getByRole('heading', { name: routineName });
    await expect(workoutClickHeading).toBeVisible();
    await workoutClickHeading.click();

    /**----------sets dialog open */
    const setsDialog = page.getByRole('dialog');
    await expect(setsDialog).toBeVisible();

    /**----------sets press */
    await setsDialog.getByRole('button', { name: A11Y_LABELS.WORKOUT_SETS.addSet }).click(); //세트 +버튼

    const weightInputs = setsDialog.getByLabel(A11Y_LABELS.WORKOUT_SETS.weightInput);
    await expect(weightInputs.last()).toBeVisible();
    await weightInputs.last().fill('10');

    const repsInputs = setsDialog.getByLabel(A11Y_LABELS.WORKOUT_SETS.repsInput);
    await expect(repsInputs.last()).toBeVisible();
    await repsInputs.last().fill('10');

    const memeoInputs = setsDialog.getByLabel(A11Y_LABELS.WORKOUT_SETS.memoInput);
    await expect(memeoInputs).toBeVisible();
    await memeoInputs.last().fill('세트 메모 테스트');

    /**----------create sets mutation */
    const createSetsPromise = page.waitForResponse(
      (response) =>
        /\/api\/workout-exercises\/[^/]+\/sets$/.test(response.url()) && response.request().method() === 'POST',
    );
    await setsDialog.getByRole('button', { name: A11Y_LABELS.WORKOUT_SETS.confirmCreate }).click();
    const createResponse = await createSetsPromise;
    expect(createResponse.ok()).toBeTruthy();
    await expect(setsDialog).toBeHidden();
    await expect(page.getByText('1세트')).toBeVisible();
  });
});
