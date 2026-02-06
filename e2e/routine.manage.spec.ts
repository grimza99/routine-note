import { expect, test } from '@playwright/test';

test.use({ storageState: 'e2e/.auth/user.json' });

test.describe.serial('루틴 관리 플로우', () => {
  test('루틴수정,생성,삭제', async ({ page }) => {
    const uniqueSuffix = Date.now();
    const routineName = `E2E ${uniqueSuffix}`;
    const updatedRoutineName = `E2E ${uniqueSuffix}`;

    await page.goto('/routine/manage');
    await page.getByRole('button', { name: '새 루틴 추가하기' }).click();

    await page.getByLabel(/루틴 이름/).fill(routineName);
    await page.getByLabel(/운동1 이름/).fill('스쿼트');
    await page.getByRole('button', { name: '운동 추가' }).click();
    await page.getByLabel(/운동2 이름/).fill('벤치프레스');
    await page.getByRole('button', { name: '루틴 저장' }).click();

    //루틴 수정
    const createdRoutineHeading = page.getByRole('heading', { name: routineName });
    await expect(createdRoutineHeading).toBeVisible();

    const createdRoutineCard = page.locator('div', { has: createdRoutineHeading });
    await createdRoutineCard.getByRole('button', { name: '수정' }).click();

    const form = page.locator('form');

    await page.getByLabel(/루틴 이름/).fill(updatedRoutineName);
    await page.getByLabel(/운동1 이름/).fill('데드리프트');

    const editButton = form.getByRole('button', { name: '수정' });
    await editButton.click();

    //루틴 삭제
    const updatedRoutineHeading = page.getByRole('heading', { name: updatedRoutineName });
    await expect(updatedRoutineHeading).toBeVisible();

    const updatedRoutineCard = page.locator('div', { has: updatedRoutineHeading });
    await updatedRoutineCard.getByRole('button', { name: '삭제' }).click();

    await page.getByRole('button', { name: '확인' }).click();
    await expect(updatedRoutineHeading).toHaveCount(0);
  });
});
