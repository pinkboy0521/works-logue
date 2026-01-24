# 監視・運用仕様書

**文書番号**: MON-001  
**バージョン**: 1.0.0  
**最終更新**: 2026-01-24

## 概要

Works Logue プロジェクトの本番運用における監視・ログ・アラート・運用手順を定義します。

## 監視アーキテクチャ

### 監視システム構成

```
┌─────────────────────────────────────────────────────────────────┐
│                        Observability Stack                      │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │
│  │   Metrics       │  │     Logs        │  │    Traces       │   │
│  │  (CloudWatch)   │  │  (CloudWatch    │  │   (AWS X-Ray)   │   │
│  │                 │  │     Logs)       │  │                 │   │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │
│  │   Dashboard     │  │    Alerting     │  │    Analysis     │   │
│  │   (Grafana)     │  │   (PagerDuty)   │  │   (Datadog)     │   │
│  │                 │  │                 │  │                 │   │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │
│  │  Application    │  │ Infrastructure  │  │   Business      │   │
│  │   Monitoring    │  │   Monitoring    │  │   Metrics       │   │
│  │                 │  │                 │  │                 │   │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 監視対象と収集データ

| レイヤー             | 監視対象      | メトリクス                             | ツール            |
| -------------------- | ------------- | -------------------------------------- | ----------------- |
| **アプリケーション** | Next.js App   | レスポンス時間、エラー率、スループット | CloudWatch、X-Ray |
| **インフラ**         | ECS、RDS、ALB | CPU、メモリ、ネットワーク、ディスク    | CloudWatch        |
| **ビジネス**         | ユーザー行動  | PV、UU、コンバージョン                 | Custom Metrics    |
| **セキュリティ**     | アクセスログ  | 不正アクセス、認証失敗                 | CloudTrail、WAF   |

## メトリクス監視

### アプリケーションメトリクス

#### カスタムメトリクス定義

```typescript
// src/shared/lib/metrics.ts
import { CloudWatch } from "@aws-sdk/client-cloudwatch";

const cloudwatch = new CloudWatch({ region: "ap-northeast-1" });

export const recordMetric = async (
  metricName: string,
  value: number,
  unit: string = "Count",
  dimensions: Record<string, string> = {},
) => {
  await cloudwatch.putMetricData({
    Namespace: "WorksLogue/Application",
    MetricData: [
      {
        MetricName: metricName,
        Value: value,
        Unit: unit,
        Dimensions: Object.entries(dimensions).map(([name, value]) => ({
          Name: name,
          Value: value,
        })),
        Timestamp: new Date(),
      },
    ],
  });
};

// 使用例
export const trackArticleView = (articleId: string, userId?: string) => {
  recordMetric("ArticleViews", 1, "Count", {
    ArticleId: articleId,
    ...(userId && { UserId: userId }),
  });
};

export const trackUserRegistration = (method: "email" | "oauth") => {
  recordMetric("UserRegistrations", 1, "Count", {
    Method: method,
  });
};
```

#### パフォーマンスメトリクス

```typescript
// src/shared/lib/performance.ts
import { recordMetric } from "./metrics";

export const trackPerformance = (name: string, startTime: number) => {
  const duration = Date.now() - startTime;
  recordMetric("Performance", duration, "Milliseconds", {
    Operation: name,
  });
};

// API ルートでの使用
export async function GET(request: Request) {
  const startTime = Date.now();

  try {
    const result = await someOperation();
    trackPerformance("ArticleList", startTime);
    return Response.json(result);
  } catch (error) {
    recordMetric("APIErrors", 1, "Count", {
      Endpoint: "ArticleList",
      ErrorType: error.name,
    });
    throw error;
  }
}
```

### インフラストラクチャメトリクス

#### CloudWatch メトリクス設定

```yaml
# CloudFormation template
Resources:
  # ALB メトリクス
  ALBTargetResponseTime:
    Type: AWS::CloudWatch::Alarm
    Properties:
      AlarmName: ALB-HighResponseTime
      AlarmDescription: ALB response time is too high
      MetricName: TargetResponseTime
      Namespace: AWS/ApplicationELB
      Statistic: Average
      Period: 300
      EvaluationPeriods: 3
      Threshold: 2.0
      ComparisonOperator: GreaterThanThreshold
      Dimensions:
        - Name: LoadBalancer
          Value: !GetAtt ApplicationLoadBalancer.LoadBalancerFullName
      AlarmActions:
        - !Ref SNSTopicAlert

  # ECS メトリクス
  ECSHighCPUUtilization:
    Type: AWS::CloudWatch::Alarm
    Properties:
      AlarmName: ECS-HighCPUUtilization
      MetricName: CPUUtilization
      Namespace: AWS/ECS
      Statistic: Average
      Period: 300
      EvaluationPeriods: 2
      Threshold: 80.0
      ComparisonOperator: GreaterThanThreshold
      Dimensions:
        - Name: ServiceName
          Value: works-logue-prod-service
        - Name: ClusterName
          Value: works-logue-prod
      AlarmActions:
        - !Ref SNSTopicAlert

  # RDS メトリクス
  RDSHighConnections:
    Type: AWS::CloudWatch::Alarm
    Properties:
      AlarmName: RDS-HighConnections
      MetricName: DatabaseConnections
      Namespace: AWS/RDS
      Statistic: Average
      Period: 300
      EvaluationPeriods: 2
      Threshold: 80
      ComparisonOperator: GreaterThanThreshold
      Dimensions:
        - Name: DBInstanceIdentifier
          Value: !Ref WorksLogueDB
      AlarmActions:
        - !Ref SNSTopicAlert
```

### ビジネスメトリクス

#### ダッシュボード設定

```typescript
// ビジネスメトリクス収集
export const trackBusinessMetrics = {
  // ユーザーエンゲージメント
  userEngagement: (userId: string, action: string, value?: number) => {
    recordMetric("UserEngagement", value || 1, "Count", {
      UserId: userId,
      Action: action,
    });
  },

  // コンテンツパフォーマンス
  contentPerformance: (
    contentType: "article" | "comment",
    metrics: {
      views?: number;
      likes?: number;
      shares?: number;
    },
  ) => {
    Object.entries(metrics).forEach(([key, value]) => {
      if (value !== undefined) {
        recordMetric("ContentMetrics", value, "Count", {
          ContentType: contentType,
          MetricType: key,
        });
      }
    });
  },

  // システムヘルス
  systemHealth: (
    component: string,
    status: "healthy" | "degraded" | "unhealthy",
  ) => {
    recordMetric("SystemHealth", status === "healthy" ? 1 : 0, "Count", {
      Component: component,
      Status: status,
    });
  },
};
```

## ログ管理

### ログレベルとカテゴリ

| レベル    | 用途                     | 例                               |
| --------- | ------------------------ | -------------------------------- |
| **ERROR** | システムエラー、例外     | データベース接続失敗、未処理例外 |
| **WARN**  | 警告、パフォーマンス劣化 | 長時間実行クエリ、非推奨API使用  |
| **INFO**  | システム状態変更         | ユーザーログイン、記事投稿       |
| **DEBUG** | 詳細デバッグ情報         | クエリ実行、関数呼び出し         |

### 構造化ログ設定

```typescript
// src/shared/lib/logger.ts
import pino from "pino";

const logger = pino({
  name: "works-logue",
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: [
      "password",
      "email",
      "token",
      "authorization",
      "cookie",
      "req.headers.authorization",
      "req.headers.cookie",
    ],
    remove: true,
  },
});

export const createLogger = (module: string) => {
  return logger.child({ module });
};

// 使用例
const log = createLogger("auth");

log.info({ userId: "123", action: "login" }, "User logged in successfully");
log.error(
  { error: error.message, stack: error.stack },
  "Authentication failed",
);
```

### ログ収集設定

#### CloudWatch Logs設定

```yaml
# ECS Task Definition での設定
containerDefinitions:
  - name: works-logue-app
    logConfiguration:
      logDriver: awslogs
      options:
        awslogs-group: /ecs/works-logue-prod
        awslogs-region: ap-northeast-1
        awslogs-stream-prefix: ecs
        awslogs-create-group: "true"
```

#### ログフィルタリング

```json
{
  "filterPattern": "[timestamp, requestId, level=\"ERROR\", module, msg]",
  "metricTransformations": [
    {
      "metricName": "ErrorCount",
      "metricNamespace": "WorksLogue/Application",
      "metricValue": "1",
      "defaultValue": 0
    }
  ]
}
```

## アラート設定

### アラート分類と対応レベル

| 分類         | 緊急度 | 対応時間   | 通知先           | 例                       |
| ------------ | ------ | ---------- | ---------------- | ------------------------ |
| **Critical** | P1     | 15分以内   | 電話、SMS、Slack | サービス停止、データ損失 |
| **High**     | P2     | 1時間以内  | Slack、Email     | 高エラー率、性能劣化     |
| **Medium**   | P3     | 4時間以内  | Email            | 警告しきい値超過         |
| **Low**      | P4     | 24時間以内 | Email            | 情報通知                 |

### PagerDuty設定

```yaml
# PagerDuty サービス設定
Resources:
  PagerDutyService:
    Type: AWS::SNS::Topic
    Properties:
      DisplayName: WorksLogue-Alerts
      Subscription:
        - Endpoint: !Sub "https://events.pagerduty.com/integration/${PagerDutyIntegrationKey}/enqueue"
          Protocol: https

  # Critical アラート
  CriticalAlertPolicy:
    Type: AWS::SNS::TopicPolicy
    Properties:
      Topics:
        - !Ref PagerDutyService
      PolicyDocument:
        Statement:
          - Effect: Allow
            Principal:
              Service: cloudwatch.amazonaws.com
            Action: SNS:Publish
            Resource: !Ref PagerDutyService
```

### Slack通知設定

```typescript
// src/shared/lib/alerts.ts
import { WebClient } from "@slack/web-api";

const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

export const sendAlert = async (
  severity: "critical" | "high" | "medium" | "low",
  message: string,
  details?: Record<string, any>,
) => {
  const colors = {
    critical: "#FF0000",
    high: "#FF8C00",
    medium: "#FFD700",
    low: "#90EE90",
  };

  const channel = severity === "critical" ? "#alerts-critical" : "#alerts";

  await slack.chat.postMessage({
    channel,
    attachments: [
      {
        color: colors[severity],
        title: `${severity.toUpperCase()} Alert`,
        text: message,
        fields: details
          ? Object.entries(details).map(([key, value]) => ({
              title: key,
              value: String(value),
              short: true,
            }))
          : [],
        ts: Math.floor(Date.now() / 1000),
      },
    ],
  });
};
```

## ダッシュボード

### Grafana ダッシュボード設定

#### システム概要ダッシュボード

```json
{
  "dashboard": {
    "title": "Works Logue - System Overview",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "sum(rate(http_requests_total[5m]))",
            "legendFormat": "Requests/sec"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "singlestat",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5.*\"}[5m]) / rate(http_requests_total[5m])",
            "legendFormat": "Error Rate"
          }
        ]
      },
      {
        "title": "Active Users",
        "type": "graph",
        "targets": [
          {
            "expr": "sum(increase(user_sessions_total[1h]))",
            "legendFormat": "Active Users"
          }
        ]
      }
    ]
  }
}
```

#### アプリケーション詳細ダッシュボード

```json
{
  "dashboard": {
    "title": "Works Logue - Application Metrics",
    "panels": [
      {
        "title": "Database Connection Pool",
        "type": "graph",
        "targets": [
          {
            "expr": "pg_stat_database_connections",
            "legendFormat": "Active Connections"
          }
        ]
      },
      {
        "title": "Cache Hit Rate",
        "type": "singlestat",
        "targets": [
          {
            "expr": "cache_hits_total / (cache_hits_total + cache_misses_total)",
            "legendFormat": "Hit Rate"
          }
        ]
      },
      {
        "title": "Article Operations",
        "type": "graph",
        "targets": [
          {
            "expr": "increase(article_operations_total[1m])",
            "legendFormat": "{{operation}}"
          }
        ]
      }
    ]
  }
}
```

## ヘルスチェック

### アプリケーションヘルスチェック

```typescript
// app/api/health/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";

export async function GET() {
  const checks: Record<string, { status: "ok" | "error"; message?: string }> =
    {};

  // データベース接続チェック
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = { status: "ok" };
  } catch (error) {
    checks.database = {
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }

  // 外部API接続チェック
  try {
    const response = await fetch("https://api.external-service.com/health", {
      timeout: 5000,
    });
    checks.externalApi = response.ok
      ? { status: "ok" }
      : { status: "error", message: `HTTP ${response.status}` };
  } catch (error) {
    checks.externalApi = {
      status: "error",
      message: error instanceof Error ? error.message : "Connection failed",
    };
  }

  // Redis接続チェック（セッションストア）
  try {
    // Redis ping check implementation
    checks.redis = { status: "ok" };
  } catch (error) {
    checks.redis = {
      status: "error",
      message: error instanceof Error ? error.message : "Redis unavailable",
    };
  }

  const overallStatus = Object.values(checks).every(
    (check) => check.status === "ok",
  )
    ? "ok"
    : "error";

  return NextResponse.json(
    {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks,
    },
    { status: overallStatus === "ok" ? 200 : 503 },
  );
}
```

### インフラストラクチャヘルスチェック

```bash
#!/bin/bash
# scripts/health-check.sh

# ALB ターゲットグループヘルスチェック
aws elbv2 describe-target-health \
  --target-group-arn $TARGET_GROUP_ARN \
  --query 'TargetHealthDescriptions[?TargetHealth.State!=`healthy`]'

# ECS サービスヘルスチェック
aws ecs describe-services \
  --cluster works-logue-prod \
  --services works-logue-prod-service \
  --query 'services[0].runningCount'

# RDS ヘルスチェック
aws rds describe-db-instances \
  --db-instance-identifier works-logue-prod \
  --query 'DBInstances[0].DBInstanceStatus'
```

## トラブルシューティング

### 一般的な問題と解決手順

#### 高レスポンス時間

1. **症状確認**

   ```bash
   # CloudWatch メトリクス確認
   aws cloudwatch get-metric-statistics \
     --namespace AWS/ApplicationELB \
     --metric-name TargetResponseTime \
     --start-time 2026-01-24T00:00:00Z \
     --end-time 2026-01-24T23:59:59Z \
     --period 300 \
     --statistics Average
   ```

2. **原因調査**
   - データベースクエリ性能
   - ECS タスクのCPU/メモリ使用率
   - 外部API依存関係

3. **対応手順**

   ```bash
   # スケールアップ
   aws ecs update-service \
     --cluster works-logue-prod \
     --service works-logue-prod-service \
     --desired-count 4

   # データベース接続確認
   psql $DATABASE_URL -c "SELECT * FROM pg_stat_activity;"
   ```

#### メモリリーク検知

```typescript
// メモリ使用量監視
const reportMemoryUsage = () => {
  const usage = process.memoryUsage();

  recordMetric("MemoryUsage", usage.heapUsed, "Bytes", {
    Type: "HeapUsed",
  });

  recordMetric("MemoryUsage", usage.heapTotal, "Bytes", {
    Type: "HeapTotal",
  });

  // 閾値超過時の警告
  if (usage.heapUsed > 500 * 1024 * 1024) {
    // 500MB
    log.warn({ usage }, "High memory usage detected");
  }
};

// 定期実行
setInterval(reportMemoryUsage, 60000); // 1分間隔
```

## 運用手順

### 日次運用タスク

1. **システム状態確認**
   - ダッシュボードでの全体確認
   - アラート履歴の確認
   - パフォーマンス指標の確認

2. **ログ監視**
   - エラーログの確認
   - 異常なアクセスパターンの検知
   - パフォーマンス劣化の兆候確認

3. **レポート作成**
   ```bash
   # 日次レポート生成スクリプト
   ./scripts/generate-daily-report.sh
   ```

### 週次運用タスク

1. **容量計画見直し**
   - リソース使用状況の分析
   - 成長予測とキャパシティ計画

2. **セキュリティ監査**
   - アクセスログの分析
   - 脆弱性スキャン結果確認

3. **バックアップ検証**
   - バックアップの完全性確認
   - リストア手順の確認

### 月次運用タスク

1. **パフォーマンス分析**
   - 月次パフォーマンスレポート
   - ボトルネック分析と改善計画

2. **コスト最適化**
   - リソース使用効率の分析
   - 不要リソースの特定と削除

3. **災害復旧テスト**
   - DR手順の実行テスト
   - 復旧時間の測定と改善

## セキュリティ監視

### セキュリティイベント監視

```yaml
# WAF ログ監視
Resources:
  WAFSQLInjectionAlarm:
    Type: AWS::CloudWatch::Alarm
    Properties:
      AlarmName: WAF-SQLInjectionAttempts
      MetricName: BlockedRequests
      Namespace: AWS/WAFV2
      Statistic: Sum
      Period: 300
      EvaluationPeriods: 1
      Threshold: 10
      ComparisonOperator: GreaterThanThreshold
      Dimensions:
        - Name: Rule
          Value: SQLInjectionRule
      AlarmActions:
        - !Ref SecurityAlertTopic

  # 認証失敗監視
  AuthFailureAlarm:
    Type: AWS::CloudWatch::Alarm
    Properties:
      AlarmName: HighAuthenticationFailures
      MetricName: AuthenticationFailures
      Namespace: WorksLogue/Security
      Statistic: Sum
      Period: 300
      EvaluationPeriods: 2
      Threshold: 50
      ComparisonOperator: GreaterThanThreshold
      AlarmActions:
        - !Ref SecurityAlertTopic
```

### インシデント対応

```typescript
// セキュリティインシデント自動対応
export const handleSecurityIncident = async (incident: {
  type: "brute_force" | "sql_injection" | "xss" | "suspicious_access";
  sourceIp: string;
  severity: "low" | "medium" | "high" | "critical";
}) => {
  // ログ記録
  log.error({ incident }, "Security incident detected");

  // 自動ブロック（高重要度の場合）
  if (incident.severity === "critical" || incident.severity === "high") {
    await blockIpAddress(incident.sourceIp);
  }

  // アラート送信
  await sendAlert(
    incident.severity === "critical" ? "critical" : "high",
    `Security incident: ${incident.type} from ${incident.sourceIp}`,
    incident,
  );

  // インシデント記録
  await recordSecurityIncident(incident);
};
```

## 関連ドキュメント

- [開発環境構築](development.md) - ローカル監視設定
- [本番環境構築](production.md) - インフラ監視設定
- [CI/CD パイプライン](ci-cd.md) - デプロイ監視
- [要件定義書 - 非機能要件](../requirements/non-functional.md) - 可用性・監視要件
- [外部設計書 - エラーハンドリング](../external-design/error-handling.md) - エラー監視
