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

        <Title className={styles.homeTitle}>About the Creators</Title>

        {/* Popup Creator */}
        <div style={{width: "100%", display: "flex", gap: "40px", flexWrap: "wrap", marginTop: "20px", justifyContent: "center", alignItems: "center"}}>
          {creators.map((creator, index) => (
            <div key={index} style={{ textAlign: "center" }}>
              <img
                src={creator.image}
                alt={creator.name}
                onClick={() => showModal(creator)}
                className={styles.profileImage}
                style={{ cursor: 'pointer' }}
              />
              <Paragraph><strong>{creator.name}</strong></Paragraph>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}