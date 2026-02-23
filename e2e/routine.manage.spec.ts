import { expect, test } from '@playwright/test';
import { A11Y_LABELS } from '../src/shared/constants';

test.use({ storageState: 'e2e/.auth/user.json' });

test.describe.serial('루틴 관리 플로우', () => {
  const uniqueSuffix = Date.now();
  const routineName = `E2E-routine-test(${uniqueSuffix})`;
  const updatedRoutineName = `E2-routine-test-edit(${uniqueSuffix})`;
  test('루틴 생성-수정', async ({ page }) => {
    await page.goto('/routine');
    await page.getByRole('button', { name: A11Y_LABELS.ROUTINE.create }).click();

    await page.getByLabel(/루틴 이름/).fill(routineName);
    await page.getByLabel(/운동1 이름/).fill('스쿼트');

    await page.getByRole('button', { name: A11Y_LABELS.ROUTINE.addExercise }).click(); //standalone 운동 추가
    await page.getByLabel(/운동2 이름/).fill('벤치프레스');
    await page.getByRole('button', { name: A11Y_LABELS.ROUTINE.confirmCreate }).click(); //루틴 생성 버튼

    //루틴 수정
    const createdRoutineHeading = page.getByRole('heading', { name: routineName });
    await expect(createdRoutineHeading).toBeVisible();

    const createdRoutineCard = page
      .locator('div', { has: createdRoutineHeading })
      .filter({ has: page.getByRole('button', { name: A11Y_LABELS.ROUTINE.edit }) })
      .first();
    await createdRoutineCard.getByRole('button', { name: A11Y_LABELS.ROUTINE.edit }).click(); //루틴 수정 버튼

    const form = page.locator('form');
    const routineNameInput = form.getByLabel(/루틴 이름/);
    await expect(routineNameInput).toHaveValue(routineName);

    await routineNameInput.fill(updatedRoutineName);
    await form.getByLabel(/운동1 이름/).fill('데드리프트');

    const editButton = form.getByRole('button', { name: A11Y_LABELS.ROUTINE.confirmEdit }); //루틴 수정 확인 버튼
    const editResponsePromise = page.waitForResponse(
      (response) => response.request().method() === 'PATCH' && /\/api\/routines\//.test(response.url()),
    );
    await editButton.click();
    const editResponse = await editResponsePromise;
    expect(editResponse.ok()).toBeTruthy();

    await expect(page.getByRole('heading', { name: updatedRoutineName })).toBeVisible();
  });

  test('루틴 삭제', async ({ page }) => {
    //루틴 삭제
    await page.goto('/routine');
    const updatedRoutineHeading = page.getByRole('heading', { name: updatedRoutineName });
    await expect(updatedRoutineHeading).toBeVisible();

    const updatedRoutineCard = page
      .locator('div', { has: updatedRoutineHeading })
      .filter({ has: page.getByRole('button', { name: A11Y_LABELS.ROUTINE.delete }) })
      .first();
    await updatedRoutineCard.getByRole('button', { name: A11Y_LABELS.ROUTINE.delete }).click();

    await page.getByRole('button', { name: A11Y_LABELS.ROUTINE.confirmDelete }).click();
    await expect(updatedRoutineHeading).toHaveCount(0);
  });
});
