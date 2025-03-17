'use client';

import { Inter } from "next/font/google";
import { Typography } from "antd";

const inter = Inter({ subsets: ["latin"]});

export default function AboutPage() {
    return (
    <>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "flex-start",
            padding: "20px",
            backgroundColor: "white", // Add explicit background color
            color: "black", // Add explicit text color
            margin: "20px", // Add margin for separation
            borderRadius: "8px", // Optional: rounded corners
          }}
        >
    
    <Typography.Title>About SparkBytes</Typography.Title>
    <Typography.Paragraph>
      SparkBytes is a web application designed to help students and campus community members discover events with leftover food. By connecting hungry individuals with surplus food from campus events, SparkBytes reduces food waste while helping students save money and enjoy free meals.
    </Typography.Paragraph>

    <Typography.Title>About the Creators</Typography.Title>
    <Typography.Paragraph>
        So whether you are a space enthusiast or just someone who loves to learn new things,
        Space! News has something for you. Be sure to check back often for the latest updates and stories!
    </Typography.Paragraph>
    </div>
    </>
    );
}