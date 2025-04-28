'use client';

import { Typography } from "antd";


export default function AboutPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', content: '' });

  // Handle clicking on a creator
  const showModal = (creator: { name: string, bio: string }) => {
    setModalContent({
      title: creator.name,
      content: creator.bio,
    });
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
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
<Title >About SparkBytes and The Developers!</Title>

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

  {/* === Paragraph Text === */}
  <Paragraph 
    className={styles.homePara} 
    style={{ 
      fontSize: "20px", 
      maxWidth: "600px", 
      lineHeight: "1.8",
      textAlign: "left",
    }}
  >
    We’re the Three Stooges! A team of (you guessed it) three beginner web developers driven by a shared passion for sustainability, accessibility, and community impact. 
    SparkBytes began as a simple idea to tackle food waste on campus, and it's grown into a project we’re proud of — bringing people together over good food while making a real difference.
  </Paragraph>

</div>

        <Title>About the Creators</Title>

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

      {/* Modal Popup */}
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