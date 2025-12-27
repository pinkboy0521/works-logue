# works-logue 記事 API 使用ガイド

BASE_URL="https://works-logue-api-dev-mqqnz6lvza-an.a.run.app"
AUTH_HEADER="Authorization: Bearer YOUR_JWT_TOKEN"

## 1. 記事を書いて保存（下書き作成）

curl -X POST \
 -H "$AUTH_HEADER" \
 -H "Content-Type: application/json" \
 -d '{"title":"記事のタイトル","content":"記事の内容..."}' \
 $BASE_URL/articles

## 2. 記事を更新

curl -X PUT \
 -H "$AUTH_HEADER" \
 -H "Content-Type: application/json" \
 -d '{"title":"更新されたタイトル","content":"更新された内容..."}' \
 $BASE_URL/articles/{記事 ID}

## 3. 記事を公開

curl -X POST \
 -H "$AUTH_HEADER" \
 $BASE_URL/articles/{記事 ID}/publish

## 4. 記事を取得（一覧）

curl -H "$AUTH_HEADER" \
 $BASE_URL/articles

## レスポンス例：

# 作成時: {"id":"uuid","title":"...","status":"draft","created_at":"..."}

# 一覧時: [{"id":"uuid","title":"...","status":"draft|published",...}]
