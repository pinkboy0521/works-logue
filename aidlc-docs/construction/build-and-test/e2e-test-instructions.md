# E2E Test Instructions

## ツール

**Playwright**（Next.js 15 との公式相性が良好）

```bash
cd frontend
npm install -D @playwright/test
npx playwright install chromium
```

`frontend/playwright.config.ts`:
```typescript
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
  },
})
```

---

## E2E テストシナリオ

### シナリオ 1: ユーザー登録 → ログイン
```typescript
// e2e/auth.spec.ts
test('ユーザー登録とログイン', async ({ page }) => {
  await page.goto('/register')
  await page.fill('[name="email"]', 'e2e-test@example.com')
  await page.fill('[name="password"]', 'SecurePass123!')
  await page.click('[type="submit"]')
  await expect(page).toHaveURL('/seeds')
})
```

### シナリオ 2: Seed 作成 → Log 投稿 → 成長確認
```typescript
// e2e/seed-growth.spec.ts
test('Seed 作成から成長ステージ変化まで', async ({ page }) => {
  // ログイン済みの状態で開始
  await page.goto('/seeds/new')
  await page.fill('[name="title"]', 'E2E テスト Seed')
  await page.fill('[name="description"]', 'テスト用の説明文')
  await page.click('[data-testid="submit-seed"]')

  // Seed 詳細ページへ遷移
  await expect(page).toHaveURL(/\/seeds\/[a-z0-9-]+/)

  // 初期ステージ確認
  await expect(page.locator('[data-testid="growth-stage"]')).toHaveText('seedling')

  // Log 投稿
  await page.fill('[data-testid="log-input"]', 'はじめてのログです')
  await page.click('[data-testid="submit-log"]')

  // Log が表示されることを確認
  await expect(page.locator('[data-testid="log-thread"]')).toContainText('はじめてのログです')
})
```

### シナリオ 3: Louge 閲覧 → Fork
```typescript
// e2e/louge.spec.ts
test('Louge 詳細表示と Fork', async ({ page }) => {
  await page.goto('/louges')
  await expect(page.locator('[data-testid="louge-list"]')).toBeVisible()

  // 最初の Louge を開く
  await page.locator('[data-testid="louge-card"]').first().click()
  await expect(page).toHaveURL(/\/louges\/[a-z0-9-]+/)

  // 公開済み Louge には Fork ボタンが表示される
  const forkButton = page.locator('[data-testid="fork-button"]')
  if (await forkButton.isVisible()) {
    await forkButton.click()
    await expect(page.locator('[data-testid="fork-success-toast"]')).toBeVisible()
  }
})
```

### シナリオ 4: 通知確認
```typescript
// e2e/notifications.spec.ts
test('通知ドロップダウン表示', async ({ page }) => {
  await page.goto('/seeds')
  await page.click('[data-testid="notification-bell"]')
  await expect(page.locator('[data-testid="notification-dropdown"]')).toBeVisible()
})
```

---

## 実行

```bash
cd frontend

# 全 E2E テスト実行
npx playwright test

# ヘッドフル（ブラウザ表示あり）
npx playwright test --headed

# 特定シナリオのみ
npx playwright test e2e/seed-growth.spec.ts

# HTML レポート
npx playwright show-report
```

---

## テストデータ管理

E2E テストで使用するユーザーは専用のテストアカウントを用意する:
```bash
# .env.test.local
E2E_TEST_EMAIL=e2e@test.works-logue.dev
E2E_TEST_PASSWORD=<test-password>
```

テスト後のクリーンアップは Supabase のテスト DB に対して行う（本番 DB では実行しない）。
