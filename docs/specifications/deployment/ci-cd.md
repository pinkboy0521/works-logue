# CI/CD パイプライン仕様書

**文書番号**: CICD-001  
**バージョン**: 1.0.0  
**最終更新**: 2026-01-24

## 概要

Works Logue プロジェクトの継続的インテグレーション（CI）・継続的デプロイメント（CD）の設計・運用手順を定義します。

## CI/CD アーキテクチャ

### パイプライン概要

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Developer     │    │   GitHub        │    │   GitHub        │
│   Local         │───▶│   Repository    │───▶│   Actions       │
│   Environment   │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Quality       │    │   Build &       │    │   Test          │
│   Gate          │◀───│   Package       │◀───│   Execution     │
│   (SonarQube)   │    │   (Docker)      │    │   (Jest/E2E)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
          │                       │                       │
          ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Security      │    │   Registry      │    │   Deployment    │
│   Scan          │    │   (ECR)         │───▶│   (ECS)         │
│   (Snyk)        │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## GitHub Actions ワークフロー

### メインワークフロー

#### `.github/workflows/main.yml`

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  # コード品質チェック
  lint-and-format:
    name: Lint and Format Check
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Check Prettier formatting
        run: npm run format:check

      - name: TypeScript type check
        run: npm run type-check

  # 単体テスト・結合テスト
  test:
    name: Unit and Integration Tests
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_DB: test_db
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_password
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Setup test database
        env:
          DATABASE_URL: postgresql://test_user:test_password@localhost:5432/test_db
        run: |
          npx prisma migrate deploy
          npx prisma db seed

      - name: Run unit tests
        env:
          DATABASE_URL: postgresql://test_user:test_password@localhost:5432/test_db
        run: npm run test

      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: test-results
          path: |
            coverage/
            test-results.xml

  # E2E テスト
  e2e-test:
    name: E2E Tests
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Build application
        run: npm run build

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload E2E results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: e2e-results
          path: |
            playwright-report/
            test-results/

  # セキュリティスキャン
  security-scan:
    name: Security Scan
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run Snyk to check for vulnerabilities
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high

      - name: Upload Snyk report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: snyk-report
          path: snyk-report.json

  # Docker イメージビルド
  build:
    name: Build Docker Image
    runs-on: ubuntu-latest
    needs: [lint-and-format, test]
    if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/develop'

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ap-northeast-1

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build and push Docker image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: works-logue
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY:latest
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest

      - name: Output image URI
        run: echo "IMAGE_URI=${{ steps.login-ecr.outputs.registry }}/works-logue:${{ github.sha }}" >> $GITHUB_OUTPUT

  # デプロイメント（ステージング）
  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: [build, security-scan]
    if: github.ref == 'refs/heads/develop'
    environment: staging

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ap-northeast-1

      - name: Deploy to ECS Staging
        run: |
          aws ecs update-service \
            --cluster works-logue-staging \
            --service works-logue-staging-service \
            --force-new-deployment

      - name: Wait for deployment
        run: |
          aws ecs wait services-stable \
            --cluster works-logue-staging \
            --services works-logue-staging-service

  # デプロイメント（本番）
  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: [build, security-scan]
    if: github.ref == 'refs/heads/main'
    environment: production

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ap-northeast-1

      - name: Database migration (if needed)
        run: |
          # Only run if migration files changed
          if git diff --name-only HEAD~1 HEAD | grep -q "prisma/migrations"; then
            echo "Running database migrations..."
            # Run migrations via ECS task
            aws ecs run-task \
              --cluster works-logue-prod \
              --task-definition works-logue-migration-task \
              --launch-type FARGATE \
              --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=DISABLED}"
          fi

      - name: Deploy to ECS Production
        run: |
          aws ecs update-service \
            --cluster works-logue-prod \
            --service works-logue-prod-service \
            --force-new-deployment

      - name: Wait for deployment
        run: |
          aws ecs wait services-stable \
            --cluster works-logue-prod \
            --services works-logue-prod-service

      - name: Health check
        run: |
          # Wait for ALB health check to pass
          sleep 60
          curl -f https://works-logue.com/api/health || exit 1

      - name: Notify Slack
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          channel: "#deployments"
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## ブランチ戦略

### Git Flow

```
main ─────────────────●───────●─────────▶
     \               /       /
      \    hotfix   /       /
       \  ●───●───●       /
        \             release
         \            ●───●───●
          \          /       /
           develop ─●───●───●───●───●─────▶
              \   /   \   /   \   /
               \ /     \ /     \ /
              feature feature feature
               ●───●   ●───●   ●───●
```

### ブランチ運用ルール

| ブランチ    | 役割         | デプロイ先 | マージルール      |
| ----------- | ------------ | ---------- | ----------------- |
| `main`      | 本番リリース | Production | PR + レビュー必須 |
| `develop`   | 開発統合     | Staging    | PR + テスト通過   |
| `feature/*` | 機能開発     | なし       | PR作成時にCI実行  |
| `hotfix/*`  | 緊急修正     | Production | PR + 緊急承認     |
| `release/*` | リリース準備 | Staging    | テスト完了後      |

## 品質ゲート

### 必須チェック項目

#### コード品質

- **ESLint**: エラー0件
- **Prettier**: フォーマットチェック通過
- **TypeScript**: 型エラー0件
- **テストカバレッジ**: 80%以上

#### セキュリティ

- **Snyk**: 高危険度脆弱性なし
- **SonarQube**: セキュリティホットスポットなし
- **依存関係**: 既知脆弱性なし

#### パフォーマンス

- **Bundle size**: 前回比+10%以内
- **Lighthouse**: Performance 90以上
- **Core Web Vitals**: 基準内

### 品質ゲート設定

```yaml
# .github/workflows/quality-gate.yml
name: Quality Gate

on:
  pull_request:
    branches: [main, develop]

jobs:
  quality-check:
    name: Quality Gate
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: SonarQube Scan
        uses: sonarqube-quality-gate-action@master
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}

      - name: Bundle size check
        uses: andresz1/size-limit-action@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}

      - name: Performance audit
        uses: treosh/lighthouse-ci-action@v10
        with:
          configPath: "./.lighthouserc.js"
          uploadArtifacts: true
```

## 環境管理

### 環境設定

| 環境            | ブランチ   | URL                     | 用途                   |
| --------------- | ---------- | ----------------------- | ---------------------- |
| **Development** | feature/\* | localhost:3000          | 開発・デバッグ         |
| **Staging**     | develop    | staging.works-logue.com | 統合テスト・受入テスト |
| **Production**  | main       | works-logue.com         | 本番運用               |

### 環境変数管理

#### GitHub Secrets設定

```bash
# AWS認証
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY

# データベース
DATABASE_URL_STAGING
DATABASE_URL_PRODUCTION

# 外部サービス
SNYK_TOKEN
SONAR_TOKEN
SLACK_WEBHOOK

# その他
NEXTAUTH_SECRET_STAGING
NEXTAUTH_SECRET_PRODUCTION
```

#### 環境固有設定

```yaml
# .github/environments/staging.yml
environment:
  name: staging
  url: https://staging.works-logue.com
  protection_rules:
    - type: required_reviewers
      required_reviewers: 1

# .github/environments/production.yml
environment:
  name: production
  url: https://works-logue.com
  protection_rules:
    - type: required_reviewers
      required_reviewers: 2
    - type: wait_timer
      wait_timer: 5
```

## デプロイメント戦略

### Blue-Green デプロイメント

```yaml
# Blue-Green deployment script
deploy_blue_green:
  runs-on: ubuntu-latest
  steps:
    - name: Deploy to Blue environment
      run: |
        # Deploy new version to blue environment
        aws ecs update-service \
          --cluster works-logue-prod \
          --service works-logue-blue \
          --task-definition works-logue-prod:${{ github.sha }}

    - name: Health check Blue
      run: |
        # Wait and verify blue environment health
        sleep 60
        curl -f https://blue.works-logue.com/api/health

    - name: Switch traffic to Blue
      run: |
        # Switch ALB target group to blue environment
        aws elbv2 modify-listener \
          --listener-arn $ALB_LISTENER_ARN \
          --default-actions Type=forward,TargetGroupArn=$BLUE_TARGET_GROUP_ARN

    - name: Monitor and rollback if needed
      run: |
        # Monitor for 5 minutes, rollback if issues detected
        timeout 300 ./scripts/monitor-deployment.sh || {
          echo "Issues detected, rolling back..."
          aws elbv2 modify-listener \
            --listener-arn $ALB_LISTENER_ARN \
            --default-actions Type=forward,TargetGroupArn=$GREEN_TARGET_GROUP_ARN
        }
```

### Canary デプロイメント

```yaml
# Canary deployment for high-risk changes
deploy_canary:
  runs-on: ubuntu-latest
  steps:
    - name: Deploy Canary (10% traffic)
      run: |
        aws elbv2 modify-listener \
          --listener-arn $ALB_LISTENER_ARN \
          --default-actions Type=forward,TargetGroupArn=$MAIN_TARGET_GROUP_ARN,Weight=90 \
                            Type=forward,TargetGroupArn=$CANARY_TARGET_GROUP_ARN,Weight=10

    - name: Monitor Canary for 30 minutes
      run: |
        # Monitor error rates, performance metrics
        ./scripts/monitor-canary.sh 30

    - name: Gradually increase Canary traffic
      run: |
        # 10% -> 25% -> 50% -> 100%
        for weight in 25 50 100; do
          aws elbv2 modify-listener \
            --listener-arn $ALB_LISTENER_ARN \
            --default-actions Type=forward,TargetGroupArn=$MAIN_TARGET_GROUP_ARN,Weight=$((100-weight)) \
                              Type=forward,TargetGroupArn=$CANARY_TARGET_GROUP_ARN,Weight=$weight
          sleep 900  # Wait 15 minutes between increases
        done
```

## ロールバック戦略

### 自動ロールバック

```yaml
# Automatic rollback triggers
rollback_triggers:
  - error_rate_threshold: 5%
    duration_minutes: 5
    action: immediate_rollback

  - response_time_p95_threshold: 2000ms
    duration_minutes: 10
    action: immediate_rollback

  - health_check_failures: 3
    duration_minutes: 2
    action: immediate_rollback
```

### 手動ロールバック

```bash
# Emergency rollback script
#!/bin/bash
PREVIOUS_TASK_DEF=$(aws ecs describe-services \
  --cluster works-logue-prod \
  --services works-logue-prod-service \
  --query 'services[0].deployments[1].taskDefinition' \
  --output text)

echo "Rolling back to: $PREVIOUS_TASK_DEF"

aws ecs update-service \
  --cluster works-logue-prod \
  --service works-logue-prod-service \
  --task-definition $PREVIOUS_TASK_DEF

aws ecs wait services-stable \
  --cluster works-logue-prod \
  --services works-logue-prod-service

echo "Rollback completed successfully"
```

## 監視・アラート

### デプロイメント監視

```yaml
# CloudWatch Alarms for deployment monitoring
Resources:
  HighErrorRateAlarm:
    Type: AWS::CloudWatch::Alarm
    Properties:
      AlarmName: HighErrorRate
      ComparisonOperator: GreaterThanThreshold
      EvaluationPeriods: 2
      MetricName: HTTPCode_Target_5XX_Count
      Namespace: AWS/ApplicationELB
      Period: 300
      Statistic: Sum
      Threshold: 10
      AlarmActions:
        - !Ref SNSTopicArn
      TreatMissingData: notBreaching

  HighResponseTimeAlarm:
    Type: AWS::CloudWatch::Alarm
    Properties:
      AlarmName: HighResponseTime
      ComparisonOperator: GreaterThanThreshold
      EvaluationPeriods: 3
      MetricName: TargetResponseTime
      Namespace: AWS/ApplicationELB
      Period: 300
      Statistic: Average
      Threshold: 2.0
      AlarmActions:
        - !Ref SNSTopicArn
```

### Slack通知設定

```yaml
# Slack notification for deployments
notify_slack:
  runs-on: ubuntu-latest
  if: always()
  needs: [deploy-production]
  steps:
    - name: Notify deployment result
      uses: 8398a7/action-slack@v3
      with:
        status: ${{ needs.deploy-production.result }}
        channel: "#deployments"
        webhook_url: ${{ secrets.SLACK_WEBHOOK }}
        custom_payload: |
          {
            "blocks": [
              {
                "type": "section",
                "text": {
                  "type": "mrkdwn",
                  "text": "🚀 *Production Deployment*\n*Status:* ${{ needs.deploy-production.result }}\n*Branch:* ${{ github.ref_name }}\n*Commit:* <https://github.com/${{ github.repository }}/commit/${{ github.sha }}|${{ github.sha }}>"
                }
              }
            ]
          }
```

## トラブルシューティング

### 一般的な問題と解決法

#### Docker Build 失敗

```bash
# Dockerビルドログ確認
docker build --progress=plain --no-cache .

# マルチステージビルド中間結果確認
docker build --target dependencies -t debug-deps .
docker run --rm -it debug-deps sh
```

#### ECS デプロイメント失敗

```bash
# ECS サービスイベント確認
aws ecs describe-services \
  --cluster works-logue-prod \
  --services works-logue-prod-service \
  --query 'services[0].events[0:10]'

# タスク定義検証
aws ecs describe-task-definition \
  --task-definition works-logue-prod:latest \
  --query 'taskDefinition.containerDefinitions[0]'
```

#### データベースマイグレーション失敗

```bash
# マイグレーション状況確認
npx prisma migrate status

# ロールバック実行
npx prisma migrate rollback

# 手動マイグレーション
npx prisma db execute --file ./path/to/migration.sql
```

## パフォーマンス最適化

### ビルド最適化

```dockerfile
# .dockerignore for faster builds
node_modules
.git
.next
coverage
.env*
*.log
```

```yaml
# GitHub Actions cache optimization
- name: Cache node modules
  uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

### パイプライン最適化

```yaml
# Parallel job execution
jobs:
  test:
    strategy:
      matrix:
        test-group: [unit, integration, e2e]
    runs-on: ubuntu-latest
    steps:
      - name: Run ${{ matrix.test-group }} tests
        run: npm run test:${{ matrix.test-group }}
```

## 関連ドキュメント

- [開発環境構築](development.md) - ローカル開発環境
- [本番環境構築](production.md) - インフラストラクチャ
- [監視・運用](monitoring.md) - 運用監視体制
- [要件定義書 - 非機能要件](../requirements/non-functional.md) - 可用性・性能要件
- [外部設計書 - API仕様](../external-design/api-specification.md) - ヘルスチェックAPI
