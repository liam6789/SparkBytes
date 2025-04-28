'use client';

import { Typography } from "antd";


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
            backgroundColor: "white",
            color: "black",
            margin: "20px",
            borderRadius: "8px",
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
          
          {/* Patty Huang */}
          <div>
            <ul style={{ listStyleType: "none", padding: 0 }}>
              <li style={{ marginBottom: "10px" }}>
                <strong>Bio:</strong> Patty Huang is a current junior at Boston University. She loves to collect Pokemon cards and puzzle!
              </li>
              <li style={{ marginBottom: "10px" }}>
                <strong>Education:</strong> Boston University, B.A. in Computer Science, estimated to graduate in 2026 
              </li>
              <li style={{ marginBottom: "10px" }}>
                <strong>Profession:</strong> Student at Boston University
              </li>
            </ul>
          </div>

          {/* Louise Lee */}
          <div style={{ display: "flex", flexDirection: "row", gap: "20px", alignItems: "flex-start" }}>
          <img 
            src="/images/" // Add image
            alt="Louise Lee" 
            style={{ 
              width: "250px", 
              height: "auto", 
              borderRadius: "8px"
            }}
          />
          <div>
            <ul style={{ listStyleType: "none", padding: 0 }}>
              <li style={{ marginBottom: "10px" }}>
                <strong>Bio:</strong> Louise Lee is a junior studying Computer Science and Psychology 
                at Boston University. She has a passion for the arts, outdoors, and travel.
              </li>
              <li style={{ marginBottom: "10px" }}>
                <strong>Education:</strong> Boston University, B.A. in Computer Science and Psychology, 
                estimated to graduate in 2026.
              </li>
              <li style={{ marginBottom: "10px" }}>
                <strong>Profession:</strong> Student at Boston University.
              </li>
            </ul>
          </div>
          </div>
        </div>
      </div>
    </>
  );
}