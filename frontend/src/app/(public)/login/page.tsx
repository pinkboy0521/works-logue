"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { Login as LoginIcon } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { user, error, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

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
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "grey.50",
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ padding: 4 }}>
          <Stack spacing={3} alignItems="center">
            <Typography
              variant="h3"
              component="h1"
              textAlign="center"
              fontWeight="bold"
            >
              Works Logue
            </Typography>
            <Typography
              variant="body1"
              textAlign="center"
              color="text.secondary"
            >
              技術ブログプラットフォーム
            </Typography>
            <Button
              href="/auth/login?audience=https://api.works-logue.dev"
              variant="contained"
              size="large"
              fullWidth
              startIcon={<LoginIcon />}
              sx={{ py: 1.5 }}
            >
              ログイン
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
