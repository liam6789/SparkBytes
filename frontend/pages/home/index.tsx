import { Inter } from "next/font/google";
import { Typography, Button, Card } from "antd";
import { useEffect, useState } from "react";
import React from "react";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <div style={{ maxWidth: "900px", margin: "auto", padding: "20px" }}>
      <Typography.Title>Welcome to Spark!Bytes</Typography.Title>
      <Typography.Paragraph>
      Spark! Bytes was conceived with a simple idea in mind - to minimize food waste and maximize food sharing within the Boston University community. We recognized the potential of connecting those who have excess food with those who could benefit from it.
      </Typography.Paragraph>
    </div>
  );
}