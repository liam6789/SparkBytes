'use client';

import { Typography, Modal } from "antd";
import React, { useState } from "react";
import styles from "../page.module.css";

const { Title, Paragraph } = Typography;

// List of creators, add bio
const creators = [
  {
    name: "Patty Huang",
    image: "/images/mfa.jpeg",
    bio: `Patty is a junior at Boston University studying Computer Science.
          She loves collecting Pokemon cards and solving puzzles!`
  },
  {
    name: "Louise Lee",
    image: "/images/louise.PNG",
    bio: `Louise is a junior double majoring in Computer Science and Psychology
          at Boston University. She enjoys arts, outdoors, and travel!`
  },
  {
    name: "Liam McDonald",
    image: "/images/", //edit
    bio: `Liam is a sophomore ...
    at Boston University. He...!`
  }
];

export default function AboutPage() {
  // Use states for modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Display inside modal
  const [modalContent, setModalContent] = useState({ title: '', content: '' });

  // Handle clicking on a creator
  // When image is clicked open up person's info
  const showModal = (creator: { name: string, bio: string }) => {
    setModalContent({
      title: creator.name,
      content: creator.bio,
    });
    setIsModalOpen(true);
  };

  // Open and closing modal
  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      {/* === Container === */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        padding: "20px",
        backgroundColor: "white",
        color: "black",
        margin: "20px",
        borderRadius: "8px",
      }}>

{/* === About Section Title === */}
<Title>SparkBytes and The Developers!</Title>

{/* === Image left, text right === */}
<div style={{
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "40px"
}}>

  {/* === Team Logo Image === */}
  <img
    src="/images/3heads.jpg"
    alt="SparkBytes Logo"
    style={{
      width: "250px",
      height: "auto",
      borderRadius: "12px"
    }}
  />

  {/* === Paragraph text and style === */}
  <Paragraph 
    className={styles.homePara} 
    style={{ 
      fontSize: "18px", 
      maxWidth: "600px", 
      lineHeight: "1.8",
      textAlign: "left",
    }}
  >
    We&apos;re the Three Stooges! A team of (you guessed it) three beginner web developers driven by a shared passion for sustainability, accessibility, and community impact. 
    SparkBytes began as a simple idea to tackle food waste on campus, and it&apos;s grown into a project we&apos;re proud of — bringing people together over good food while making a real difference.
  </Paragraph>

</div>

        {/* === Creators section === */}
        <Title>About the Creators</Title>

        {/* Popup Creator */}
        <div style={{width: "100%", display: "flex", gap: "40px", flexWrap: "wrap", marginTop: "20px", justifyContent: "center", alignItems: "center"}}>
          {creators.map((creator, index) => (
            <div key={index} style={{ textAlign: "center" }}>
              {/* Creator image to click on */}
              <img
                src={creator.image}
                alt={creator.name}
                onClick={() => showModal(creator)}
                className={styles.profileImage}
                style={{ cursor: 'pointer' }}
              />
              {/* Creator name */}
              <Paragraph><strong>{creator.name}</strong></Paragraph>
            </div>
          ))}
        </div>
      </div>

      {/* Modal popup with the bio details */}
      <Modal
        title={modalContent.title}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        width={700}
        bodyStyle={{ padding: "20px", fontSize: "20px" }}
      >
        <p>{modalContent.content}</p>
      </Modal>
    </>
  );
}