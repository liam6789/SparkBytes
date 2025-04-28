"use client"; // Ensures this runs in the client

// Imports
import { Typography, Button } from "antd";
import { useRouter } from "next/navigation"; // for navigation
import { Inter } from "next/font/google";
import Image from "next/image"; 
import styles from "./page.module.css";

// Load Google Font properly
const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const router = useRouter(); // Initialize router

  return (
    <div
      className={styles.page}
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #FF7F50, #f5f5f5)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px 24px",
        textAlign: "center",
      }}
    >
      {/* Hero Section - introductory of homepage*/}
      <main className={styles.homeSection}>
        {/* Display main title */}
        <img 
            src="/images/logo.png" // Add image
            alt="SparkBytes Logo" 
            style={{ 
              width: "400px", 
              height: "auto",
              marginBottom: "0px"
            }}
          />
        <Typography.Title className={styles.homeTitle} style={{ fontSize: "100px", marginTop: "-50px"}}>
          Welcome to <span style={{ color: "#f55436" }}>Spark!Bytes</span>
        </Typography.Title>
        {/* Display paragraph */}
        <Typography.Paragraph className={styles.homePara}>
          Spark! Bytes was conceived with a simple idea in mind – to minimize food waste 
          and maximize food sharing within the Boston University community. We recognized 
          the potential of connecting those who have excess food with those who could benefit from it.
        </Typography.Paragraph>

        {/* Sign in Button */}
        <Button 
          className={styles.homeButton}
          size="large"
          onClick={() => router.push("/login")}
        >
          Sign In to Get Started
        </Button>
      </main>
    </div>
  );
}