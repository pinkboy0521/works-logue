"use client";

import { useState, useEffect } from "react";

interface RelativeTimeProps {
  date: Date | string;
  className?: string;
}

export function RelativeTime({ date, className }: RelativeTimeProps) {
  const [timeText, setTimeText] = useState<string>("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const updateTime = () => {
      const now = new Date();
      const commentDate = new Date(date);
      const diffInSeconds = Math.floor(
        (now.getTime() - commentDate.getTime()) / 1000,
      );

      if (diffInSeconds < 60) {
        setTimeText("たった今");
      } else if (diffInSeconds < 3600) {
        setTimeText(`${Math.floor(diffInSeconds / 60)}分前`);
      } else if (diffInSeconds < 86400) {
        setTimeText(`${Math.floor(diffInSeconds / 3600)}時間前`);
      } else if (diffInSeconds < 604800) {
        setTimeText(`${Math.floor(diffInSeconds / 86400)}日前`);
      } else {
        setTimeText(
          commentDate.toLocaleDateString("ja-JP", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
        );
      }
    };

    updateTime();

    // 1分ごとに更新
    const interval = setInterval(updateTime, 60000);

    return () => clearInterval(interval);
  }, [date]);

  // クライアントサイドでマウントされるまでは日付を表示
  if (!isClient) {
    const fallbackDate = new Date(date);
    return (
      <span className={className}>
        {fallbackDate.toLocaleDateString("ja-JP", {
          month: "short",
          day: "numeric",
        })}
      </span>
    );
  }

  return <span className={className}>{timeText}</span>;
}
