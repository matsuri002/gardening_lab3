import React from "react";
import { Card, CardContent, Stack, Typography } from "@mui/material";

type Props = {
  title: string;
  icon: React.ReactNode;
  action?: React.ReactNode;     // 右上（トグルなど）
  children: React.ReactNode;    // 中身は自由
  width?: number | string;      // Card幅
};

export default function ChartCardFrame({
  title,
  icon,
  action,
  children,
  width = 700,
}: Props) {
  return (
    <Card sx={{ width, borderRadius: 3, boxShadow: 3, p: 1 }}>
      <CardContent>
        <Stack spacing={1} sx={{ width: "100%" }}>
          {/* ヘッダー */}
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={0.5}>
              {icon}
              <Typography variant="subtitle1" color="text.primary">
                {title}
              </Typography>
            </Stack>
            {action}
          </Stack>

          {/* 中身 */}
          {children}
        </Stack>
      </CardContent>
    </Card>
  );
}
