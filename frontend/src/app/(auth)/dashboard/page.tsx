"use client";

import { useApiClient } from "@/shared/lib/api/hooks";
import { useUser } from "@auth0/nextjs-auth0/client";
import {
  Add as AddIcon,
  Article as ArticleIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import {
  Alert,
  AppBar,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// 記事の型定義
interface Article {
  id: string;
  title: string;
  content: string;
  status: "draft" | "published";
  author_id: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export default function Dashboard() {
  const { user, error, isLoading } = useUser();
  const { fetchWithAuth } = useApiClient();
  const router = useRouter();

  const [articles, setArticles] = useState<Article[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(true);
  const [articlesError, setArticlesError] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState(false);

  // 記事一覧を取得
  const fetchArticles = async () => {
    try {
      setArticlesLoading(true);
      setArticlesError(null);

      const response = await fetchWithAuth("/articles");
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      setArticles(data);
    } catch (error) {
      setArticlesError(
        error instanceof Error ? error.message : "記事一覧の取得に失敗しました"
      );
    } finally {
      setArticlesLoading(false);
    }
  };

  // 新規記事作成
  const createNewArticle = async () => {
    try {
      setCreateLoading(true);

      const response = await fetchWithAuth("/articles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "新しい記事",
          content: "",
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const article = await response.json();

      // 新規作成された記事のエディタに遷移
      router.push(`/editor?id=${article.id}`);
    } catch (error) {
      console.error("記事作成エラー:", error);
      alert("記事の作成に失敗しました");
    } finally {
      setCreateLoading(false);
    }
  };

  // 記事一覧を初回ロード時に取得
  useEffect(() => {
    if (user) {
      fetchArticles();
    }
  }, [user]);

  // 日付フォーマット関数
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <Alert severity="error">Error: {error.message}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, minHeight: "100vh", backgroundColor: "grey.50" }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Works Logue - ダッシュボード
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ width: 32, height: 32 }}>
              {user?.picture ? (
                <img
                  src={user.picture}
                  alt={user.name}
                  style={{ width: "100%", height: "100%" }}
                />
              ) : (
                <PersonIcon />
              )}
            </Avatar>
            <Typography variant="body2">
              こんにちは、{user?.name}さん
            </Typography>
            <Button
              href="/auth/logout"
              color="inherit"
              startIcon={<LogoutIcon />}
              variant="outlined"
            >
              ログアウト
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={3}>
          {/* ヘッダー */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h4" component="h1">
              自分の記事
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={createNewArticle}
              disabled={createLoading}
              size="large"
            >
              {createLoading ? "作成中..." : "新規作成"}
            </Button>
          </Stack>

          {/* 記事一覧 */}
          {articlesLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : articlesError ? (
            <Alert severity="error">
              記事一覧の取得に失敗しました: {articlesError}
            </Alert>
          ) : articles.length === 0 ? (
            <Card elevation={1}>
              <CardContent sx={{ textAlign: "center", py: 6 }}>
                <ArticleIcon sx={{ fontSize: 64, color: "grey.400", mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  記事がまだありません
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  新規作成ボタンから最初の記事を書いてみましょう
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={createNewArticle}
                  disabled={createLoading}
                >
                  最初の記事を作成
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Stack spacing={2}>
              {articles.map((article) => (
                <Card
                  key={article.id}
                  elevation={1}
                  sx={{
                    cursor: "pointer",
                    transition: "elevation 0.2s",
                    "&:hover": {
                      elevation: 3,
                    },
                  }}
                  onClick={() => router.push(`/editor?id=${article.id}`)}
                >
                  <CardContent>
                    <Stack spacing={2}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="start"
                      >
                        <Typography
                          variant="h6"
                          component="h2"
                          sx={{
                            fontWeight: 600,
                            lineHeight: 1.3,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {article.title}
                        </Typography>
                        <Chip
                          label={
                            article.status === "published"
                              ? "公開済み"
                              : "下書き"
                          }
                          color={
                            article.status === "published"
                              ? "success"
                              : "default"
                          }
                          size="small"
                          sx={{ ml: 2, flexShrink: 0 }}
                        />
                      </Stack>

                      <Typography variant="body2" color="text.secondary">
                        更新日: {formatDate(article.updated_at)}
                        {article.published_at && (
                          <>
                            {" | "}
                            公開日: {formatDate(article.published_at)}
                          </>
                        )}
                      </Typography>

                      {article.content && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {article.content.replace(/[#*`\n]/g, " ").trim()}
                        </Typography>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
