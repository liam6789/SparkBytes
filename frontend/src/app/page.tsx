"use client"; // Ensures this runs in the client

// Imports
import { Typography, Button } from "antd";
import styles from "./page.module.css";
import { useRouter} from "next/navigation";

export default function Home() {
  const router = useRouter();

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
              marginBottom: "10px"
            }}
          />
        <Typography.Title className={styles.homeTitle} style={{ fontSize: "60px", marginTop: "-50px"}}>
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