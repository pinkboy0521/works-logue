"use client";

import { createTheme } from "@mui/material/styles";
import { Noto_Sans_JP } from "next/font/google";

const notoSansJP = Noto_Sans_JP({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  fallback: ["Helvetica", "Arial", "sans-serif"],
});

const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: "light",
    primary: {
      main: "#948BDB",
    },
    secondary: {
      main: "#dc004e",
    },
  },
  typography: {
    fontFamily: notoSansJP.style.fontFamily,
  },
});

export default theme;
