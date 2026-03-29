# Performance Test Instructions

## パフォーマンス要件（NFR より）

| 指標 | 目標値 |
|---|---|
| API レスポンスタイム (P95) | < 500ms（AI 非依存エンドポイント） |
| AI エンドポイントレスポンスタイム (P95) | < 5000ms |
| スループット | 100 req/s（通常トラフィック想定） |
| 同時接続ユーザー | 50 ユーザー |
| エラーレート | < 1% |

---

## テストツール

**推奨**: [k6](https://k6.io/)（軽量・JavaScript DSL）

```bash
# k6 インストール
brew install k6          # macOS
choco install k6         # Windows
```

---

## テストシナリオ

### シナリオ 1: Seed フィード取得（読み取り負荷）

`k6-scripts/seed-feed-load.js`:
```javascript
import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  stages: [
    { duration: '30s', target: 20 },   // ランプアップ
    { duration: '60s', target: 50 },   // 定常負荷
    { duration: '10s', target: 0 },    // クールダウン
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
}

export default function () {
  const res = http.get(`${__ENV.API_URL}/seeds?page=1&size=20`)
  check(res, { 'status is 200': (r) => r.status === 200 })
  sleep(1)
}
```

### シナリオ 2: Log 投稿（書き込み負荷）

`k6-scripts/log-post-load.js`:
```javascript
import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  vus: 20,
  duration: '60s',
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.01'],
  },
}

export default function () {
  const payload = JSON.stringify({
    content: 'テスト投稿',
    seed_id: __ENV.TEST_SEED_ID,
  })
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${__ENV.TEST_JWT}`,
  }
  const res = http.post(`${__ENV.API_URL}/seeds/${__ENV.TEST_SEED_ID}/logs`, payload, { headers })
  check(res, { 'status is 201': (r) => r.status === 201 })
  sleep(2)
}
```

---

## 実行手順

### 1. テスト環境準備
```bash
export API_URL=https://your-staging-api.run.app
export TEST_JWT=<テスト用JWTトークン>
export TEST_SEED_ID=<テスト用Seed ID>
```

### 2. 負荷テスト実行
```bash
# Seed フィード読み取り
k6 run -e API_URL=$API_URL k6-scripts/seed-feed-load.js

# Log 投稿書き込み
k6 run -e API_URL=$API_URL -e TEST_JWT=$TEST_JWT -e TEST_SEED_ID=$TEST_SEED_ID k6-scripts/log-post-load.js
```

### 3. ストレステスト（上限確認）
```bash
k6 run --vus 100 --duration 30s -e API_URL=$API_URL k6-scripts/seed-feed-load.js
```

### 4. 結果確認
k6 は実行後に以下を出力:
- `http_req_duration` (avg/p90/p95/p99)
- `http_req_failed` (エラーレート)
- `iterations` (合計リクエスト数)

---

## パフォーマンス最適化ガイド

### レスポンスタイムが遅い場合
1. Cloud Run の最小インスタンス数を 1 以上に設定（コールドスタート排除）
2. Supabase クエリに `EXPLAIN ANALYZE` でインデックス漏れを確認
3. `GrowthEngine.check_and_advance` が BackgroundTask として非同期実行されているか確認

### AI エンドポイントが遅い場合
1. `AIService` の Semaphore 上限 (`P-01`) を調整
2. Fallback (`P-04`) が正常に動作しているか確認
3. Vertex AI のリージョンを API サーバーと同じリージョンに統一

### Frontend Core Web Vitals
```bash
cd frontend
npm run build
npx lighthouse http://localhost:3000 --output html --output-path ./lighthouse-report.html
```
- **LCP**: < 2.5s
- **FID**: < 100ms
- **CLS**: < 0.1
