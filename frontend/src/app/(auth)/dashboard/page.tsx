"use client";

import { useApiClient } from "@/shared/lib/api/hooks";
import { useUser } from "@auth0/nextjs-auth0/client";
import {
  Api as ApiIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  PlayArrow as PlayIcon,
} from "@mui/icons-material";
import {
  Alert,
  AppBar,
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import { useState } from "react";

export default function Dashboard() {
  const { user, error, isLoading } = useUser();
  const { fetchWithAuth } = useApiClient();
  const [apiResult, setApiResult] = useState<{
    success: boolean;
    data?: unknown;
    error?: string;
  } | null>(null);
  const [apiLoading, setApiLoading] = useState(false);

  const testApiCall = async () => {
    setApiLoading(true);
    setApiResult(null);

    try {
      const response = await fetchWithAuth("/me");
      const data = await response.json();
      setApiResult({ success: true, data });
    } catch (error) {
      setApiResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setApiLoading(false);
    }
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
          <Card elevation={2}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                <PersonIcon color="primary" />
                <Typography variant="h6" component="h2">
                  ユーザー情報
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" mb={2}>
                ログインが成功しました。以下はAuth0から取得したユーザー情報です。
              </Typography>
              <Paper
                sx={{
                  backgroundColor: "grey.100",
                  p: 2,
                  borderRadius: 1,
                  fontFamily: "monospace",
                  fontSize: "0.75rem",
                  overflow: "auto",
                  maxHeight: 300,
                }}
              >
                <pre>{JSON.stringify(user, null, 2)}</pre>
              </Paper>
            </CardContent>
          </Card>

          <Card elevation={2}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                <ApiIcon color="primary" />
                <Typography variant="h6" component="h2">
                  API テスト
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" mb={2}>
                認証付きでAPIエンドポイント /me を呼び出します。
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                onClick={testApiCall}
                disabled={apiLoading}
                startIcon={
                  apiLoading ? <CircularProgress size={16} /> : <PlayIcon />
                }
              >
                {apiLoading ? "APIテスト中..." : "APIテスト実行"}
              </Button>
            </CardActions>

            {apiResult && (
              <CardContent sx={{ pt: 0 }}>
                <Alert
                  severity={apiResult.success ? "success" : "error"}
                  icon={false}
                  sx={{ mb: 2 }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="subtitle2">
                      {apiResult.success
                        ? "✅ APIテスト成功"
                        : "❌ APIテスト失敗"}
                    </Typography>
                  </Stack>
                </Alert>
                <Paper
                  sx={{
                    backgroundColor: "grey.100",
                    p: 2,
                    borderRadius: 1,
                    fontFamily: "monospace",
                    fontSize: "0.75rem",
                    overflow: "auto",
                    maxHeight: 200,
                  }}
                >
                  <pre>{JSON.stringify(apiResult, null, 2)}</pre>
                </Paper>
              </CardContent>
            )}
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}
