# Unit Test Execution

## Backend Unit Tests (pytest)

### 前提条件
```bash
cd backend
source .venv/bin/activate
pip install -r requirements.txt   # pytest / pytest-asyncio 含む
```

### テスト実行

#### 全ユニットテスト実行
```bash
cd backend
pytest tests/unit/ -v
```

#### カバレッジ付き実行
```bash
pytest tests/unit/ -v --cov=app --cov-report=term-missing --cov-report=html
# → htmlcov/index.html でカバレッジレポート確認
```

#### テストファイル別実行
```bash
# GrowthEngine ロジック
pytest tests/unit/test_growth_engine.py -v

# AIService パターン計算・フォールバック
pytest tests/unit/test_ai_service.py -v

# ScoreEngine スコア計算・バッジ付与
pytest tests/unit/test_score_engine.py -v
```

### 期待されるテスト結果

| テストファイル | テスト内容 | 期待 |
|---|---|---|
| `test_growth_engine.py` | ステージ判定ロジック（BR-01, BR-04） | 全テスト PASS |
| `test_ai_service.py` | PatternAnalysis 計算式 / フォールバック動作（P-04） | 全テスト PASS |
| `test_score_engine.py` | スコア計算 / bloom contributor ルール（BR-05, BR-06） | 全テスト PASS |

- **期待カバレッジ**: services/ ≥ 80%
- **テストレポート**: `backend/htmlcov/index.html`

### テスト失敗時の対応
1. `pytest tests/unit/ -v --tb=short` でエラー詳細を確認
2. 失敗テスト名を特定 (`FAILED tests/unit/test_xxx.py::test_yyy`)
3. 対応する実装ファイル (`app/services/`) を修正
4. 再実行して全 PASS を確認

---

## Frontend Unit Tests (Vitest / Jest)

> **Note**: フロントエンドのユニットテストフレームワークは `package.json` の `scripts.test` を確認してください。Next.js 15 + TanStack Query 構成では Vitest を推奨します。

### セットアップ（Vitest を使用する場合）
```bash
cd frontend
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/user-event jsdom
```

`frontend/vitest.config.ts` を作成:
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
```

### 実行
```bash
npm run test          # ウォッチモード
npm run test -- --run # 1回実行
npm run test -- --coverage
```

### 推奨テスト対象
- `src/lib/utils.ts` — ユーティリティ関数
- TanStack Query フック（`useSeedRealtime`, `useReactionMutation` 等）のロジック部分
- `src/store/atoms.ts` の Jotai atom 動作
