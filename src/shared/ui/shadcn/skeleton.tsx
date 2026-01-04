import * as React from "react";
import { cn } from "@/shared";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded bg-muted", className)}
      {...props}
    />
  );
}
