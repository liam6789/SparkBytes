'use client';

import { Inter } from "next/font/google";
import { Typography } from "antd";

const inter = Inter({ subsets: ["latin"] });

export default function AboutPage() {
    return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "flex-start",
            padding: "20px",
            width: "100%", 
            color: "black",
            margin: "0",
            borderRadius: "0"
          }}
        >
            <Typography.Title>About SparkBytes</Typography.Title>
            <Typography.Paragraph>
                SparkBytes is a web application designed to help students and campus community members discover events with leftover food. By connecting hungry individuals with surplus food from campus events, SparkBytes reduces food waste while helping students save money and enjoy free meals.
            </Typography.Paragraph>

            <Typography.Title>About the Creators</Typography.Title>
            <div style={{ display: "flex", flexDirection: "row", gap: "20px", alignItems: "flex-start" }}>
                <img 
                    src="/images/mfa.jpeg" 
                    alt="Patty Huang" 
                    style={{ 
                        width: "250px", 
                        height: "auto", 
                        borderRadius: "8px"
                    }}
                />
                <div>
                    <p><strong>Bio:</strong> Patty Huang is a current junior at Boston University. She loves to collect Pokemon cards and puzzle!</p>
                    <p><strong>Education:</strong> Boston University, B.A. in Computer Science, estimated to graduate in 2026</p>
                    <p><strong>Profession:</strong> Student at Boston University</p>
                </div>      
            </div>
        </div>
    );
}