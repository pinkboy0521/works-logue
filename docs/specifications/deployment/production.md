# 本番環境構築仕様書

**文書番号**: PRD-001  
**バージョン**: 1.0.0  
**最終更新**: 2026-01-24

## 概要

Works Logue プロジェクトの本番環境構成・デプロイメント手順を定義します。

## 本番環境アーキテクチャ

### インフラストラクチャ概要

```
┌─────────────────────────────────────────────────────────────┐
│                        Internet                              │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                  CDN (Cloudflare)                           │
│                 - Static Assets                             │
│                 - Cache Layer                               │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│              Load Balancer (ALB)                            │
│                 - SSL Termination                           │
│                 - Health Checks                             │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│              Application Layer                               │
│  ┌─────────────────┐  ┌─────────────────┐                   │
│  │   Next.js App   │  │   Next.js App   │                   │
│  │   (Primary)     │  │   (Standby)     │                   │
│  │   ECS Fargate   │  │   ECS Fargate   │                   │
│  └─────────────────┘  └─────────────────┘                   │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│               Database Layer                                 │
│  ┌─────────────────┐  ┌─────────────────┐                   │
│  │  PostgreSQL     │  │  PostgreSQL     │                   │
│  │  (Primary)      │  │  (Read Replica) │                   │
│  │  RDS            │  │  RDS            │                   │
│  └─────────────────┘  └─────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

### AWS サービス構成

| サービス | 用途 | 設定 |
|---------|------|------|
| **ECS Fargate** | コンテナオーケストレーション | 2タスク、Auto Scaling |
| **RDS PostgreSQL** | データベース | Multi-AZ、Read Replica |
| **ALB** | ロードバランサー | HTTPS、Health Check |
| **CloudFront** | CDN | 静的コンテンツキャッシュ |
| **Route 53** | DNS | ドメイン管理 |
| **ECR** | コンテナレジストリ | イメージ保存 |
| **VPC** | ネットワーク | プライベート/パブリックサブネット |
| **S3** | オブジェクトストレージ | 静的ファイル、バックアップ |
| **CloudWatch** | モニタリング | ログ、メトリクス |
| **Secrets Manager** | シークレット管理 | DB認証情報、API Key |

## 環境設定

### 本番環境変数

```env
# アプリケーション設定
NODE_ENV=production
NEXTAUTH_URL=https://works-logue.com
NEXTAUTH_SECRET=prod-secret-key-secure

# データベース設定
DATABASE_URL=postgresql://username:password@prod-db.region.rds.amazonaws.com:5432/works_logue

# AWS設定
AWS_REGION=ap-northeast-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=secret

# Redis設定（セッションストア）
REDIS_URL=redis://elasticache.region.cache.amazonaws.com:6379

# 外部API設定
GOOGLE_CLIENT_ID=prod-google-client-id
GOOGLE_CLIENT_SECRET=prod-google-client-secret

# 監視設定
SENTRY_DSN=https://sentry.io/project-dsn
```

## デプロイメント手順

### 1. コンテナイメージビルド

#### Dockerfile設定

```dockerfile
# Multi-stage build for production
FROM node:18-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runtime
WORKDIR /app

# 必要なファイルのみコピー
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json

# 非root ユーザーで実行
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

EXPOSE 3000
CMD ["npm", "start"]
```

#### イメージビルド・プッシュ

```bash
# ECRログイン
aws ecr get-login-password --region ap-northeast-1 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.ap-northeast-1.amazonaws.com

# イメージビルド
docker build -t works-logue .

# タグ付け
docker tag works-logue:latest 123456789012.dkr.ecr.ap-northeast-1.amazonaws.com/works-logue:latest

# プッシュ
docker push 123456789012.dkr.ecr.ap-northeast-1.amazonaws.com/works-logue:latest
```

### 2. データベース設定

#### RDS PostgreSQL設定

```yaml
# CloudFormation template (抜粋)
Resources:
  WorksLogueDB:
    Type: AWS::RDS::DBInstance
    Properties:
      DBInstanceIdentifier: works-logue-prod
      DBInstanceClass: db.t3.medium
      Engine: postgres
      EngineVersion: '14.9'
      AllocatedStorage: 100
      StorageType: gp2
      StorageEncrypted: true
      MultiAZ: true
      BackupRetentionPeriod: 7
      PreferredBackupWindow: "03:00-04:00"
      PreferredMaintenanceWindow: "sun:04:00-sun:05:00"
      VPCSecurityGroups:
        - !Ref DBSecurityGroup
      DBSubnetGroupName: !Ref DBSubnetGroup
```

#### データベースマイグレーション

```bash
# 本番環境マイグレーション
DATABASE_URL="postgresql://prod-url" npx prisma migrate deploy

# シードデータ（初回のみ）
DATABASE_URL="postgresql://prod-url" npx prisma db seed
```

### 3. ECS設定

#### Task Definition

```json
{
  "family": "works-logue-prod",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::123456789012:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::123456789012:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "works-logue-app",
      "image": "123456789012.dkr.ecr.ap-northeast-1.amazonaws.com/works-logue:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:prod/database-url"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/works-logue-prod",
          "awslogs-region": "ap-northeast-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

#### Service設定

```yaml
# ECS Service
Resources:
  WorksLogueService:
    Type: AWS::ECS::Service
    Properties:
      ServiceName: works-logue-prod
      Cluster: !Ref ECSCluster
      TaskDefinition: !Ref TaskDefinition
      DesiredCount: 2
      LaunchType: FARGATE
      NetworkConfiguration:
        AwsvpcConfiguration:
          SecurityGroups:
            - !Ref AppSecurityGroup
          Subnets:
            - !Ref PrivateSubnet1
            - !Ref PrivateSubnet2
          AssignPublicIp: DISABLED
      LoadBalancers:
        - ContainerName: works-logue-app
          ContainerPort: 3000
          TargetGroupArn: !Ref ALBTargetGroup
      HealthCheckGracePeriodSeconds: 60
```

### 4. ALB設定

#### ロードバランサー設定

```yaml
Resources:
  ApplicationLoadBalancer:
    Type: AWS::ElasticLoadBalancingV2::LoadBalancer
    Properties:
      Name: works-logue-alb
      Type: application
      Scheme: internet-facing
      SecurityGroups:
        - !Ref ALBSecurityGroup
      Subnets:
        - !Ref PublicSubnet1
        - !Ref PublicSubnet2

  ALBTargetGroup:
    Type: AWS::ElasticLoadBalancingV2::TargetGroup
    Properties:
      Name: works-logue-targets
      Port: 3000
      Protocol: HTTP
      TargetType: ip
      VpcId: !Ref VPC
      HealthCheckPath: /api/health
      HealthCheckIntervalSeconds: 30
      HealthCheckTimeoutSeconds: 5
      HealthyThresholdCount: 2
      UnhealthyThresholdCount: 5
```

### 5. SSL証明書設定

#### AWS Certificate Manager

```bash
# SSL証明書の取得
aws acm request-certificate \
    --domain-name works-logue.com \
    --domain-name *.works-logue.com \
    --validation-method DNS \
    --region us-east-1
```

#### HTTPS リスナー設定

```yaml
Resources:
  HTTPSListener:
    Type: AWS::ElasticLoadBalancingV2::Listener
    Properties:
      LoadBalancerArn: !Ref ApplicationLoadBalancer
      Port: 443
      Protocol: HTTPS
      Certificates:
        - CertificateArn: !Ref SSLCertificate
      DefaultActions:
        - Type: forward
          TargetGroupArn: !Ref ALBTargetGroup
```

## セキュリティ設定

### ネットワークセキュリティ

#### Security Group設定

```yaml
# ALB Security Group
ALBSecurityGroup:
  Type: AWS::EC2::SecurityGroup
  Properties:
    GroupDescription: Security group for ALB
    VpcId: !Ref VPC
    SecurityGroupIngress:
      - IpProtocol: tcp
        FromPort: 80
        ToPort: 80
        CidrIp: 0.0.0.0/0
      - IpProtocol: tcp
        FromPort: 443
        ToPort: 443
        CidrIp: 0.0.0.0/0

# Application Security Group  
AppSecurityGroup:
  Type: AWS::EC2::SecurityGroup
  Properties:
    GroupDescription: Security group for ECS tasks
    VpcId: !Ref VPC
    SecurityGroupIngress:
      - IpProtocol: tcp
        FromPort: 3000
        ToPort: 3000
        SourceSecurityGroupId: !Ref ALBSecurityGroup
```

### アプリケーションセキュリティ

#### CSP (Content Security Policy)

```typescript
// next.config.ts
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      font-src 'self';
    `.replace(/\s{2,}/g, ' ').trim()
  }
];
```

#### セキュリティミドルウェア

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  return response;
}
```

## スケーリング設定

### Auto Scaling

#### ECS Auto Scaling

```yaml
Resources:
  ECSScalingTarget:
    Type: AWS::ApplicationAutoScaling::ScalableTarget
    Properties:
      MaxCapacity: 10
      MinCapacity: 2
      ResourceId: !Sub "service/${ECSCluster}/${WorksLogueService}"
      RoleARN: !Sub "arn:aws:iam::${AWS::AccountId}:role/aws-service-role/ecs.application-autoscaling.amazonaws.com/AWSServiceRoleForApplicationAutoScaling_ECSService"
      ScalableDimension: ecs:service:DesiredCount
      ServiceNamespace: ecs

  CPUScalingPolicy:
    Type: AWS::ApplicationAutoScaling::ScalingPolicy
    Properties:
      PolicyName: CPUScalingPolicy
      PolicyType: TargetTrackingScaling
      ScalingTargetId: !Ref ECSScalingTarget
      TargetTrackingScalingPolicyConfiguration:
        PredefinedMetricSpecification:
          PredefinedMetricType: ECSServiceAverageCPUUtilization
        TargetValue: 70.0
```

### データベーススケーリング

#### Read Replica設定

```yaml
Resources:
  ReadReplica:
    Type: AWS::RDS::DBInstance
    Properties:
      SourceDBInstanceIdentifier: !Ref WorksLogueDB
      DBInstanceClass: db.t3.medium
      PubliclyAccessible: false
      VPCSecurityGroups:
        - !Ref DBSecurityGroup
```

## バックアップ・リストア

### データベースバックアップ

#### 自動バックアップ設定

```yaml
Resources:
  WorksLogueDB:
    Type: AWS::RDS::DBInstance
    Properties:
      BackupRetentionPeriod: 7
      PreferredBackupWindow: "03:00-04:00"
      DeleteAutomatedBackups: false
      DeletionProtection: true
```

#### スナップショット作成

```bash
# 手動スナップショット作成
aws rds create-db-snapshot \
    --db-instance-identifier works-logue-prod \
    --db-snapshot-identifier works-logue-snapshot-$(date +%Y%m%d-%H%M%S)
```

### アプリケーションファイルバックアップ

#### S3バックアップ

```bash
# アップロードファイルのS3同期
aws s3 sync /app/public/uploads s3://works-logue-backups/uploads/ \
    --exclude "*.tmp" \
    --delete
```

## 災害復旧

### RTO/RPO要件

| 項目 | 目標値 | 対策 |
|------|--------|------|
| RTO (復旧時間目標) | 1時間以内 | Multi-AZ、Auto Scaling |
| RPO (復旧ポイント目標) | 1時間以内 | 継続的レプリケーション |

### 復旧手順

#### データベース復旧

```bash
# スナップショットからの復旧
aws rds restore-db-instance-from-db-snapshot \
    --db-instance-identifier works-logue-restored \
    --db-snapshot-identifier works-logue-snapshot-20260124
```

#### アプリケーション復旧

```bash
# 前のバージョンにロールバック
aws ecs update-service \
    --cluster works-logue-cluster \
    --service works-logue-prod \
    --task-definition works-logue-prod:123
```

## パフォーマンス最適化

### Next.js最適化

```typescript
// next.config.ts
const nextConfig = {
  output: 'standalone',
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  
  images: {
    domains: ['example.com'],
    formats: ['image/avif', 'image/webp'],
  },
  
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|png)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};
```

### データベース最適化

```sql
-- インデックス最適化
CREATE INDEX CONCURRENTLY idx_articles_published_at_desc 
ON articles (published_at DESC) 
WHERE status = 'published';

-- 統計更新
ANALYZE articles;
ANALYZE users;
ANALYZE comments;
```

## 関連ドキュメント

- [開発環境構築](development.md) - ローカル開発環境設定
- [CI/CD パイプライン](ci-cd.md) - 自動デプロイ設定
- [監視・運用](monitoring.md) - パフォーマンス監視
- [内部設計書 - パフォーマンス](../internal-design/performance.md) - 性能要件
- [要件定義書 - 非機能要件](../requirements/non-functional.md) - 可用性要件