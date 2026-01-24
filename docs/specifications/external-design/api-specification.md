# Works Logue - API仕様

**バージョン**: 1.0  
**最終更新**: 2026年1月24日  
**ステータス**: 実装済み

## 1. API概要

### 1.1 基本情報

- **ベースURL**: `/api`
- **認証方式**: NextAuth.js Session + JWT
- **データ形式**: JSON
- **文字エンコーディング**: UTF-8

### 1.2 共通レスポンス形式

#### 成功レスポンス

```json
{
  "success": true,
  "data": {...},
  "message": "操作が完了しました"
}
```

#### エラーレスポンス

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "エラーの詳細メッセージ",
    "details": {...}
  }
}
```

### 1.3 認証ヘッダー

```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

## 2. 認証API

### 2.1 ログイン

**POST** `/api/auth/signin`

#### リクエスト

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

#### レスポンス

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "displayName": "山田太郎",
      "image": "https://example.com/avatar.jpg",
      "role": "USER"
    },
    "session": {
      "expires": "2026-02-24T10:30:00Z"
    }
  }
}
```

### 2.2 新規登録

**POST** `/api/auth/signup`

#### リクエスト

```json
{
  "email": "newuser@example.com",
  "password": "securePassword123",
  "displayName": "新規ユーザー"
}
```

#### レスポンス

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_124",
      "email": "newuser@example.com",
      "displayName": "新規ユーザー",
      "emailVerified": false
    },
    "message": "確認メールを送信しました"
  }
}
```

### 2.3 ログアウト

**POST** `/api/auth/signout`

#### レスポンス

```json
{
  "success": true,
  "message": "ログアウトしました"
}
```

## 3. ユーザーAPI

### 3.1 ユーザー詳細取得

**GET** `/api/user/[userId]`

#### レスポンス

```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "userId": "yamada_taro",
    "displayName": "山田太郎",
    "bio": "フロントエンドエンジニアです",
    "image": "https://example.com/avatar.jpg",
    "coverImage": "https://example.com/cover.jpg",
    "location": "東京",
    "website": "https://yamada-blog.com",
    "twitter": "yamada_taro",
    "github": "yamada-taro",
    "createdAt": "2025-12-01T00:00:00Z",
    "stats": {
      "articleCount": 15,
      "followerCount": 42,
      "followingCount": 28
    },
    "skills": [
      {
        "id": "skill_1",
        "name": "JavaScript",
        "category": "プログラミング言語"
      }
    ],
    "occupations": [
      {
        "id": "occupation_1",
        "name": "フロントエンドエンジニア"
      }
    ]
  }
}
```

### 3.2 プロフィール更新

**PUT** `/api/user/profile`

#### リクエスト

```json
{
  "displayName": "山田太郎",
  "bio": "更新されたプロフィール",
  "location": "大阪",
  "website": "https://new-blog.com",
  "skillIds": ["skill_1", "skill_2"],
  "occupationIds": ["occupation_1"]
}
```

#### レスポンス

```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "displayName": "山田太郎",
    "bio": "更新されたプロフィール"
  },
  "message": "プロフィールを更新しました"
}
```

## 4. 記事API

### 4.1 記事一覧取得

**GET** `/api/articles`

#### クエリパラメータ

```
page: 1              # ページ番号（デフォルト: 1）
limit: 10            # 1ページあたりの件数（デフォルト: 10）
sort: latest         # ソート順 (latest, popular, oldest)
topicId: topic_123   # トピックで絞り込み
tagIds: tag_1,tag_2  # タグで絞り込み（カンマ区切り）
authorId: user_123   # 著者で絞り込み
status: PUBLISHED    # ステータスで絞り込み
```

#### レスポンス

```json
{
  "success": true,
  "data": {
    "articles": [
      {
        "id": "article_123",
        "title": "Next.js 15の新機能について",
        "slug": "nextjs-15-new-features",
        "excerpt": "Next.js 15で追加された新機能について解説します...",
        "topImageUrl": "https://example.com/image.jpg",
        "status": "PUBLISHED",
        "publishedAt": "2026-01-15T10:00:00Z",
        "author": {
          "id": "user_123",
          "userId": "yamada_taro",
          "displayName": "山田太郎",
          "image": "https://example.com/avatar.jpg"
        },
        "topic": {
          "id": "topic_123",
          "name": "フロントエンド"
        },
        "tags": [
          {
            "id": "tag_1",
            "name": "Next.js",
            "type": "TECHNOLOGY"
          }
        ],
        "stats": {
          "viewCount": 1250,
          "likeCount": 45,
          "bookmarkCount": 23,
          "commentCount": 8
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalCount": 95,
      "hasNext": true,
      "hasPrevious": false
    }
  }
}
```

### 4.2 記事詳細取得

**GET** `/api/articles/[articleId]`

#### レスポンス

```json
{
  "success": true,
  "data": {
    "id": "article_123",
    "title": "Next.js 15の新機能について",
    "slug": "nextjs-15-new-features",
    "content": {
      "type": "doc",
      "content": [...]  // BlockNote JSON形式
    },
    "topImageUrl": "https://example.com/image.jpg",
    "status": "PUBLISHED",
    "publishedAt": "2026-01-15T10:00:00Z",
    "createdAt": "2026-01-10T09:00:00Z",
    "updatedAt": "2026-01-14T15:30:00Z",
    "author": {
      "id": "user_123",
      "userId": "yamada_taro",
      "displayName": "山田太郎",
      "image": "https://example.com/avatar.jpg",
      "bio": "フロントエンドエンジニアです"
    },
    "topic": {
      "id": "topic_123",
      "name": "フロントエンド",
      "slug": "frontend"
    },
    "tags": [
      {
        "id": "tag_1",
        "name": "Next.js",
        "type": "TECHNOLOGY"
      }
    ],
    "stats": {
      "viewCount": 1250,
      "likeCount": 45,
      "bookmarkCount": 23,
      "commentCount": 8
    },
    "userReaction": {
      "isLiked": false,
      "isBookmarked": true
    }
  }
}
```

### 4.3 記事作成

**POST** `/api/articles`

#### リクエスト

```json
{
  "title": "新しい記事のタイトル",
  "content": {
    "type": "doc",
    "content": [...]  // BlockNote JSON形式
  },
  "topImageUrl": "https://example.com/image.jpg",
  "topicId": "topic_123",
  "tagIds": ["tag_1", "tag_2"],
  "status": "DRAFT"
}
```

#### レスポンス

```json
{
  "success": true,
  "data": {
    "id": "article_124",
    "title": "新しい記事のタイトル",
    "slug": "new-article-title",
    "status": "DRAFT",
    "createdAt": "2026-01-24T14:30:00Z"
  },
  "message": "記事を作成しました"
}
```

### 4.4 記事更新

**PUT** `/api/articles/[articleId]`

#### リクエスト

```json
{
  "title": "更新されたタイトル",
  "content": {
    "type": "doc",
    "content": [...]
  },
  "topImageUrl": "https://example.com/new-image.jpg",
  "topicId": "topic_456",
  "tagIds": ["tag_1", "tag_3"],
  "status": "PUBLISHED"
}
```

#### レスポンス

```json
{
  "success": true,
  "data": {
    "id": "article_123",
    "title": "更新されたタイトル",
    "updatedAt": "2026-01-24T15:00:00Z"
  },
  "message": "記事を更新しました"
}
```

### 4.5 記事削除

**DELETE** `/api/articles/[articleId]`

#### レスポンス

```json
{
  "success": true,
  "message": "記事を削除しました"
}
```

## 5. リアクションAPI

### 5.1 いいね追加/削除

**POST** `/api/articles/[articleId]/like`

#### レスポンス

```json
{
  "success": true,
  "data": {
    "isLiked": true,
    "likeCount": 46
  },
  "message": "いいねしました"
}
```

### 5.2 ブックマーク追加/削除

**POST** `/api/articles/[articleId]/bookmark`

#### レスポンス

```json
{
  "success": true,
  "data": {
    "isBookmarked": true,
    "bookmarkCount": 24
  },
  "message": "ブックマークしました"
}
```

## 6. コメントAPI

### 6.1 コメント一覧取得

**GET** `/api/articles/[articleId]/comments`

#### レスポンス

```json
{
  "success": true,
  "data": {
    "comments": [
      {
        "id": "comment_123",
        "content": "とても参考になりました！",
        "createdAt": "2026-01-16T09:30:00Z",
        "author": {
          "id": "user_456",
          "displayName": "田中花子",
          "image": "https://example.com/avatar2.jpg"
        },
        "replies": [
          {
            "id": "comment_124",
            "content": "ありがとうございます！",
            "createdAt": "2026-01-16T10:00:00Z",
            "parentId": "comment_123",
            "author": {
              "id": "user_123",
              "displayName": "山田太郎",
              "image": "https://example.com/avatar.jpg"
            }
          }
        ]
      }
    ]
  }
}
```

### 6.2 コメント投稿

**POST** `/api/articles/[articleId]/comments`

#### リクエスト

```json
{
  "content": "素晴らしい記事でした！",
  "parentId": null // 返信の場合は親コメントのID
}
```

#### レスポンス

```json
{
  "success": true,
  "data": {
    "id": "comment_125",
    "content": "素晴らしい記事でした！",
    "createdAt": "2026-01-24T16:00:00Z",
    "author": {
      "id": "user_789",
      "displayName": "佐藤次郎",
      "image": "https://example.com/avatar3.jpg"
    }
  },
  "message": "コメントを投稿しました"
}
```

## 7. 検索API

### 7.1 統合検索

**GET** `/api/search`

#### クエリパラメータ

```
q: 検索キーワード        # 必須
type: all               # 検索対象 (all, articles, users)
page: 1                 # ページ番号
limit: 10               # 1ページあたりの件数
```

#### レスポンス

```json
{
  "success": true,
  "data": {
    "results": {
      "articles": [
        {
          "id": "article_123",
          "title": "Next.js 15の新機能について",
          "excerpt": "...検索キーワードがハイライトされた抜粋...",
          "author": {...},
          "stats": {...}
        }
      ],
      "users": [
        {
          "id": "user_123",
          "displayName": "山田太郎",
          "bio": "...検索キーワードがハイライトされた説明...",
          "image": "https://example.com/avatar.jpg"
        }
      ]
    },
    "pagination": {
      "currentPage": 1,
      "totalCount": 25,
      "hasNext": true
    }
  }
}
```

## 8. ファイルアップロードAPI

### 8.1 画像アップロード

**POST** `/api/upload/image`

#### リクエスト

```
Content-Type: multipart/form-data
file: [画像ファイル]
type: avatar|cover|article  # 画像の用途
```

#### レスポンス

```json
{
  "success": true,
  "data": {
    "url": "https://example.com/uploaded/image_123.jpg",
    "filename": "image_123.jpg",
    "size": 245760,
    "mimetype": "image/jpeg"
  },
  "message": "画像をアップロードしました"
}
```

## 9. エラーコード

| コード                | HTTPステータス | 説明                       |
| --------------------- | -------------- | -------------------------- |
| `UNAUTHORIZED`        | 401            | 認証が必要です             |
| `FORBIDDEN`           | 403            | アクセス権限がありません   |
| `NOT_FOUND`           | 404            | リソースが見つかりません   |
| `VALIDATION_ERROR`    | 400            | 入力データが不正です       |
| `DUPLICATE_ERROR`     | 409            | 重複するデータが存在します |
| `RATE_LIMIT_EXCEEDED` | 429            | レート制限に達しました     |
| `INTERNAL_ERROR`      | 500            | 内部サーバーエラー         |

---

## 変更履歴

| 日付       | バージョン | 変更者   | 変更内容                            |
| ---------- | ---------- | -------- | ----------------------------------- |
| 2026-01-24 | 1.0        | システム | 外部設計書からAPI仕様を分離・独立化 |
