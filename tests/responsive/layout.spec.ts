import { test, expect, type Page } from '@playwright/test';

// Logical point sizes, not physical screenshot pixels. The 440x956 case
// matches the review attachment (1320x2868 / 3). Insets are conservative test
// fixtures, not claims about the native safe-area values of each model.
const sizes = [
  [320, 568], [375, 667], [375, 812], [390, 844], [393, 852],
  [402, 874], [414, 896], [428, 926], [430, 932], [440, 956],
  [768, 1024], [1024, 1366],
];
const longName = '晨間全身間歇訓練 Long workout name with strength cardio and mobility 1234567890';

async function seed(page: Page, language: string, theme = 'fitness', photo = false) {
  await page.addInitScript(({ language, theme, photo, longName }) => {
    localStorage.setItem('hiit-settings', JSON.stringify({ version: 0, state: {
      language, theme, timeFormat: 'MM:SS', sound: false, vibration: false,
      landscapeRibbonPosition: 'right',
      backgroundUri: photo ? 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><rect width="20" height="20" fill="gray"/></svg>') : null,
    } }));
    localStorage.setItem('hiit-workouts', JSON.stringify({ version: 0, state: {
      presetOrder: [], custom: [{ id: 'responsive-fixture', name: longName, workTime: 3600,
        restTime: 10, prepareTime: 10, cooldownTime: 10, rounds: 2, difficulty: 'MEDIUM', isPreset: false }],
    } }));
    localStorage.setItem('hiit-history', JSON.stringify({ version: 0, state: { entries: [
      { id: 'fixture', completedAt: new Date().toISOString(), sessionId: 'fixture', sessionName: longName,
        totalDuration: 360000, workSeconds: 340000, completedRounds: 99, plannedRounds: 99 },
    ] } }));
  }, { language, theme, photo, longName });
}

async function safeViewport(page: Page, width: number, height: number) {
  await page.setViewportSize({ width, height });
  const insets = width > height ? [0, 59, 21, 59] : width <= 375 && height <= 667 ? [20, 0, 0, 0] : [62, 0, 34, 0];
  await page.addStyleTag({ content: `#root { box-sizing: border-box; padding: ${insets.map(n => `${n}px`).join(' ')}; background: #080e19; }` });
}

async function audit(page: Page, screen: string) {
  const root = page.getByTestId(screen);
  await expect(root).toBeVisible();
  await root.evaluate(root => {
    // Browser-only text stress. This does NOT emulate UIKit Dynamic Type or
    // adjustsFontSizeToFit; native accessibility testing remains required.
    const scale = Number(document.documentElement.dataset.textStress || 1);
    if (scale === 1) return;
    for (const el of root.querySelectorAll<HTMLElement>('[dir="auto"]')) {
      if (el.dataset.stressed || el.querySelector('[dir="auto"]')) continue;
      const value = el.textContent?.trim() ?? '';
      let multiplier = scale;
      if (el.closest('[data-testid="stats-chart"]') || /^[⚙‹✕⏮⏭▶❙▲▼⌃⌄✎🗑−+]+$/u.test(value)) multiplier = 1;
      // RN Web does not implement native numeric shrink-to-fit. Leave numeric
      // readouts at base size; their native scaling needs device verification.
      else if (
        el.dataset.testid === 'timer-time' ||
        el.dataset.testid === 'stat-value' ||
        el.dataset.testid === 'time-format-label' ||
        el.dataset.testid === 'language-label' ||
        el.dataset.testid === 'landscape-position-label'
      ) multiplier = 1;
      else if (el.closest('[data-testid="timer-ring"]')) multiplier = 1.2;
      else if (el.closest('[data-testid="screen-header"]') || /^[\d:]+$/.test(value)) multiplier = Math.min(1.5, scale);
      el.style.fontSize = `${parseFloat(getComputedStyle(el).fontSize) * multiplier}px`;
      el.dataset.stressed = 'true';
    }
  });
  const errors = await root.evaluate(root => {
    const errors: string[] = [];
    const texts = [...root.querySelectorAll<HTMLElement>('[dir="auto"]')]
      .filter(e => e.textContent?.trim() && !e.querySelector('[dir="auto"]'));
    const visibleRect = (el: HTMLElement) => {
      const rect = el.getBoundingClientRect().toJSON();
      for (let p = el.parentElement; p; p = p.parentElement) {
        const style = getComputedStyle(p), parent = p.getBoundingClientRect();
        if (/(auto|scroll|hidden)/.test(style.overflowY)) {
          rect.top = Math.max(rect.top, parent.top); rect.bottom = Math.min(rect.bottom, parent.bottom);
        }
        if (/(auto|scroll|hidden)/.test(style.overflowX)) {
          rect.left = Math.max(rect.left, parent.left); rect.right = Math.min(rect.right, parent.right);
        }
      }
      return rect;
    };
    for (const el of texts) {
      const rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height) continue;
      const name = el.textContent!.slice(0, 45);
      const parent = el.parentElement!.getBoundingClientRect();
      if (rect.left < parent.left - 1 || rect.right > parent.right + 1) errors.push(`outside parent: ${name}`);
      if (rect.left < -1 || rect.right > innerWidth + 1) errors.push(`outside viewport: ${name}`);
      if (el.scrollWidth > el.clientWidth + 2) errors.push(`clipped text: ${name}`);
    }
    for (let a = 0; a < texts.length; a++) for (let b = a + 1; b < texts.length; b++) {
      const x = visibleRect(texts[a]!), y = visibleRect(texts[b]!);
      if (Math.min(x.right, y.right) - Math.max(x.left, y.left) > 1 &&
          Math.min(x.bottom, y.bottom) - Math.max(x.top, y.top) > 1) {
        errors.push(`overlap: ${texts[a]!.textContent} / ${texts[b]!.textContent}`);
      }
    }
    return errors;
  });
  expect(errors, screen).toEqual([]);
}

async function ringFits(page: Page) {
  await expect(page.getByTestId('timer-time')).toBeVisible();
  const errors = await page.getByTestId('timer-ring').evaluate(ring => {
    const box = ring.getBoundingClientRect();
    const errors: string[] = [];
    const center = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    for (const node of ring.querySelectorAll<HTMLElement>('[dir="auto"]')) {
      const rect = node.getBoundingClientRect();
      for (const x of [rect.left, rect.right]) for (const y of [rect.top, rect.bottom]) {
        if (Math.hypot(x - center.x, y - center.y) > box.width / 2 - 16) errors.push(`${node.textContent} crosses ring`);
      }
    }
    const time = ring.querySelector<HTMLElement>('[data-testid="timer-time"]')!;
    if (getComputedStyle(time).whiteSpace !== 'nowrap') errors.push('timer can wrap');
    if (time.scrollWidth > time.clientWidth + 1) errors.push('timer clipped');
    return errors;
  });
  expect(errors).toEqual([]);
}

async function expectFullProgressRing(page: Page) {
  const progressCircles = page.getByTestId('timer-progress').locator('circle');
  for (let circle = 0; circle < await progressCircles.count(); circle += 1) {
    const dash = await progressCircles.nth(circle).getAttribute('stroke-dasharray');
    expect(dash).toMatch(/(?:[, ]|^)0$/);
  }
}

async function flow(page: Page, language: string) {
  const zh = language === 'zh-TW';
  await audit(page, 'home-screen');
  await expect(page.getByText(zh ? '準備開始' : 'READY TO TRAIN', { exact: true })).toHaveCount(0);
  await ringFits(page);
  await page.screenshot({ path: test.info().outputPath('home.png') });
  await page.getByTestId('header-settings').click();
  await audit(page, 'settings-screen');
  await page.getByTestId('settings-screen').getByText('English', { exact: true }).scrollIntoViewIfNeeded();
  await page.screenshot({ path: test.info().outputPath('settings.png') });
  await page.getByTestId('settings-screen').getByTestId('header-back').click();
  await page.getByTestId('tab-workouts').click();
  await audit(page, 'workouts-screen');
  await page.getByText(zh ? '我的課表' : 'MY WORKOUTS', { exact: true }).click();
  await page.getByText(longName, { exact: true }).click();
  await audit(page, 'workouts-screen');
  await page.screenshot({ path: test.info().outputPath('workouts.png') });
  await page.getByText(zh ? '開始' : 'START', { exact: true }).click();
  await expect(page.getByTestId('timer-time')).toHaveText('60:00');
  await audit(page, 'home-screen');
  await ringFits(page);
  await page.getByText(zh ? '調整計時' : 'ADJUST TIMER', { exact: true }).click();
  await audit(page, 'setup-screen');
  await page.getByRole('textbox').fill(longName);
  await page.getByRole('textbox').blur();
  await page.getByText(zh ? '套用' : 'USE', { exact: true }).scrollIntoViewIfNeeded();
  await page.screenshot({ path: test.info().outputPath('setup.png') });
  await page.getByText(zh ? '套用' : 'USE', { exact: true }).click();
  await page.getByText(zh ? '開始' : 'START', { exact: true }).click();
  await expect(page.getByTestId('run-close-icon')).toBeVisible();
  await expect(page.getByTestId('run-close-icon').locator('g')).toHaveAttribute('stroke-width', '4');
  await page.getByTestId('run-pause').click();
  await expect(page.getByTestId('run-pause')).toHaveAccessibleName(zh ? '繼續' : 'Resume');
  await expect(page.getByTestId('run-previous')).toBeDisabled();
  await expect(page.getByTestId('run-next')).toBeDisabled();
  await audit(page, 'run-screen');
  await page.getByTestId('run-pause').click();
  await expect(page.getByTestId('run-pause')).toHaveAccessibleName(zh ? '暫停' : 'Pause');
  await expect(page.getByTestId('run-next')).toBeEnabled();
  const controlBoxes = await Promise.all(
    ['run-previous', 'run-pause', 'run-next'].map((id) => page.getByTestId(id).boundingBox()),
  );
  expect(controlBoxes.every((box) => box?.width === controlBoxes[0]?.width)).toBe(true);
  expect(controlBoxes.every((box) => box?.height === controlBoxes[0]?.height)).toBe(true);
  const phases = zh ? ['準備', '運動', '休息', '運動', '緩和', '完成'] : ['PREPARE', 'WORK', 'REST', 'WORK', 'COOL DOWN', 'DONE'];
  for (const [index, phase] of phases.entries()) {
    await expect(page.getByTestId('timer-phase')).toHaveText(phase);
    if (index === phases.length - 1) {
      await expect(page.getByTestId('timer-progress')).toHaveCount(0);
    } else {
      await expect(page.getByTestId('timer-progress')).toBeVisible();
      if (index > 0) {
        await expectFullProgressRing(page);
      }
    }
    await audit(page, 'run-screen');
    await page.getByTestId('timer-ring').scrollIntoViewIfNeeded();
    await ringFits(page);
    await page.screenshot({ path: test.info().outputPath(`run-${index}.png`) });
    if (index < phases.length - 1) await page.getByTestId('run-next').click();
  }
  await page.getByText(zh ? '結束' : 'FINISH', { exact: true }).click();
  await page.getByTestId('tab-stats').click();
  for (const period of zh ? ['週', '月', '年'] : ['WEEK', 'MONTH', 'YEAR']) {
    await page.getByText(period, { exact: true }).click();
    await audit(page, 'stats-screen');
  }
  await page.screenshot({ path: test.info().outputPath('stats.png') });
}

for (const [w, h] of sizes) for (const landscape of [false, true]) for (const language of ['zh-TW', 'en']) {
  const width = landscape ? h! : w!, height = landscape ? w! : h!;
  test(`${width}x${height} ${language} all screens`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    await seed(page, language);
    await page.goto('/');
    await safeViewport(page, width, height);
    await flow(page, language);
    expect(errors).toEqual([]);
  });
}

for (const theme of ['fitness', 'bohemia', 'zen', 'ikea']) {
  test(`${theme} photo background and live rotation`, async ({ page }) => {
    await seed(page, 'zh-TW', theme, true);
    await page.goto('/');
    await safeViewport(page, 440, 956);
    await ringFits(page);
    // Every theme starts with a full colored ring without a seam.
    await expectFullProgressRing(page);
    await safeViewport(page, 956, 440);
    await audit(page, 'home-screen');
    await ringFits(page);
    await page.getByText('開始', { exact: true }).click();
    await expect(page.getByTestId('run-screen')).toBeVisible();
    await page.waitForTimeout(1_100);
    const runningProgress = page.getByTestId('timer-progress').locator('circle').first();
    await expect(runningProgress).toHaveAttribute('stroke-dasharray', /.+/);

    // Pausing freezes both the number and its matching arc length.
    await page.getByTestId('run-pause').click();
    const pausedDash = await runningProgress.getAttribute('stroke-dasharray');
    await page.waitForTimeout(1_100);
    expect(await runningProgress.getAttribute('stroke-dasharray')).toBe(pausedDash);
    await page.getByTestId('run-pause').click();

    // Skipping starts the next phase at a full circle, then completion removes
    // the colored progress group while leaving the closed base track visible.
    await page.getByTestId('run-next').click();
    await expect(page.getByTestId('timer-phase')).toHaveText('運動');
    await expectFullProgressRing(page);
    for (let remainingSkips = 32; remainingSkips > 0; remainingSkips -= 1) {
      const next = page.getByTestId('run-next');
      if (await next.count() === 0) break;
      await next.click();
      await page.waitForTimeout(50);
    }
    await expect(page.getByTestId('timer-phase')).toHaveText('完成');
    await expect(page.getByTestId('timer-progress')).toHaveCount(0);
  });
}

for (const [width, height] of [[320, 568], [667, 375], [440, 956]]) for (const language of ['zh-TW', 'en']) {
  test(`${width}x${height} ${language} 200 percent text stress`, async ({ page }) => {
    await seed(page, language);
    await page.goto('/');
    await safeViewport(page, width!, height!);
    await page.evaluate(() => { document.documentElement.dataset.textStress = '2'; });
    await flow(page, language);
  });
}

for (const language of ['zh-TW', 'en']) {
  test(`${language} named controls, limits and cancel returns to workouts`, async ({ page }) => {
    const zh = language === 'zh-TW';
    await seed(page, language);
    await page.goto('/');
    await safeViewport(page, 375, 667);
    await expect(page.getByTestId('header-settings')).toHaveAccessibleName(zh ? '設定' : 'SETTINGS');
    await page.getByTestId('header-settings').click();
    await expect(page.getByRole('switch', { name: zh ? '音效' : 'Sound', exact: true })).toBeVisible();
    await page.getByTestId('settings-screen').getByRole('button', { name: zh ? '返回' : 'Back' }).click();
    await page.getByRole('tab', { name: zh ? '課表' : 'WORKOUTS', exact: true }).click();
    await expect(page.getByTestId('tab-workouts')).toHaveAttribute('aria-selected', 'true');
    await page.getByText(zh ? '我的課表' : 'MY WORKOUTS', { exact: true }).click();
    await page.getByText(longName, { exact: true }).click();
    await page.getByRole('button', { name: zh ? '編輯' : 'Edit', exact: true }).click();
    await expect(page.getByRole('button', { name: zh ? '增加運動' : 'Increase Work', exact: true })).toBeDisabled();
    const decreaseRounds = page.getByRole('button', { name: zh ? '減少回合數' : 'Decrease Rounds', exact: true });
    await decreaseRounds.click();
    await expect(decreaseRounds).toBeDisabled();
    await page.getByRole('textbox').fill('Unsaved changes');
    await page.getByTestId('header-back').click();
    await expect(page.getByTestId('workouts-screen')).toBeVisible();
    await page.getByText(zh ? '我的課表' : 'MY WORKOUTS', { exact: true }).click();
    await expect(page.getByText(longName, { exact: true })).toBeVisible();
    await expect(page.getByText('Unsaved changes', { exact: true })).toHaveCount(0);
  });
}

test('landscape ribbon defaults right, can move left, and returns to bottom in portrait', async ({ page }) => {
  await seed(page, 'en');
  await page.goto('/');
  await safeViewport(page, 667, 375);

  const bar = page.getByTestId('main-tab-bar');
  const home = page.getByTestId('home-screen');
  await expect(page.getByTestId('settings-gear-icon')).toBeVisible();
  await expect(page.getByText('⚙', { exact: true })).toHaveCount(0);
  await page.screenshot({ path: test.info().outputPath('sketch-gear.png') });
  await expect(bar).toBeVisible();
  let barBox = await bar.boundingBox();
  let homeBox = await home.boundingBox();
  expect(barBox).not.toBeNull();
  expect(homeBox).not.toBeNull();
  expect(barBox!.width).toBeLessThanOrEqual(86);
  expect(barBox!.x).toBeGreaterThanOrEqual(homeBox!.x + homeBox!.width - 1);

  await page.getByTestId('header-settings').click();
  await expect(page.getByText('Landscape Navigation Position', { exact: true })).toBeVisible();
  const optionWidths = await Promise.all(
    ['mm:ss', 'ss', 'Right', 'Left'].map((label) =>
      page.getByText(label, { exact: true }).evaluate((node) => node.parentElement!.getBoundingClientRect().width),
    ),
  );
  expect(Math.abs(optionWidths[0]! - optionWidths[1]!)).toBeLessThan(1);
  expect(Math.abs(optionWidths[2]! - optionWidths[3]!)).toBeLessThan(1);
  await page.getByText('Left', { exact: true }).click();
  await page.getByTestId('header-back').click();

  barBox = await bar.boundingBox();
  homeBox = await home.boundingBox();
  expect(barBox).not.toBeNull();
  expect(homeBox).not.toBeNull();
  expect(barBox!.x + barBox!.width).toBeLessThanOrEqual(homeBox!.x + 1);

  await safeViewport(page, 375, 667);
  await expect(bar).toBeVisible();
  barBox = await bar.boundingBox();
  homeBox = await home.boundingBox();
  expect(barBox).not.toBeNull();
  expect(homeBox).not.toBeNull();
  expect(barBox!.width).toBeGreaterThan(homeBox!.width - 1);
  expect(barBox!.y).toBeGreaterThanOrEqual(homeBox!.y + homeBox!.height - 1);
});

for (const [width, height] of [[320, 568], [568, 320]]) {
  test(`${width}x${height} long Chinese settings label wraps without changing option width`, async ({ page }) => {
    await seed(page, 'zh-TW');
    await page.goto('/');
    await safeViewport(page, width!, height!);
    await page.getByTestId('header-settings').click();
    const settings = page.getByTestId('settings-screen');
    await expect(page.getByText('裝置橫放的\n導覽列位置', { exact: true })).toBeVisible();
    await audit(page, 'settings-screen');
    const positionLabelMetrics = await page.getByTestId('landscape-position-label').evaluate((node) => ({
      clientHeight: node.clientHeight,
      scrollHeight: node.scrollHeight,
      text: node.textContent,
    }));
    expect(positionLabelMetrics.text).toBe('裝置橫放的\n導覽列位置');
    expect(positionLabelMetrics.scrollHeight).toBeLessThanOrEqual(positionLabelMetrics.clientHeight + 1);

    for (const [label, option] of [
      ['時間格式', 'mm:ss'],
      ['語言', '正體中文'],
      ['裝置橫放的\n導覽列位置', '右側'],
    ]) {
      const labelBox = await settings.getByText(label!, { exact: true }).boundingBox();
      const optionBox = await settings.getByText(option!, { exact: true }).locator('..').boundingBox();
      expect(labelBox).not.toBeNull();
      expect(optionBox).not.toBeNull();
      const labelCenter = labelBox!.y + labelBox!.height / 2;
      const optionCenter = optionBox!.y + optionBox!.height / 2;
      expect(Math.abs(labelCenter - optionCenter)).toBeLessThan(2);
    }

    const widths = await Promise.all(
      ['右側', '左側'].map((label) =>
        page.getByText(label, { exact: true }).evaluate((node) => node.parentElement!.getBoundingClientRect().width),
      ),
    );
    expect(Math.abs(widths[0]! - widths[1]!)).toBeLessThan(1);
    expect(widths[0]).toBeGreaterThanOrEqual(99);
  });
}
