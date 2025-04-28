"use client"; // Ensures this runs in the client

// Imports
import { Typography} from "antd";
import styles from "./page.module.css";


export default function Home() {
  return (
    <div className={styles.page}>
      {/* Hero Section - introductory of homepage*/}
      <main className={styles.main}>
        {/* Display main title */}
        <img
            src="/images/logo.png" // Add image
            alt="SparkBytes" 
            style={{ 
              width: "250px", 
              height: "auto"
            }}
          />
        <Typography.Title level={1} className={styles.title}>
          Welcome to <span style={{ color: "#f55436" }}>Spark!Bytes</span>
        </Typography.Title>
        {/* Display paragraph */}
        <Typography.Paragraph className={styles.description}>
          Spark! Bytes was conceived with a simple idea in mind – to minimize food waste 
          and maximize food sharing within the Boston University community. We recognized 
          the potential of connecting those who have excess food with those who could benefit from it.
        </Typography.Paragraph>
      </main>
    </div>
  );
}