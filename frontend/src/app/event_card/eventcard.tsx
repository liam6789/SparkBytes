"use client";

import React from "react";
import { Card, Typography, Tag, List, Divider } from "antd";
import { CalendarOutlined, ClockCircleOutlined, CoffeeOutlined } from "@ant-design/icons";
import { useRouter } from 'next/navigation';
import dayjs from "dayjs";

const { Title, Paragraph, Text } = Typography;

// food interface to match our database schema
interface Food {
  food_id: number;
  food_name: string;
  quantity: number;
  event_id: number;
}

// event interface to match our database schema
interface Event {
  event_id: number;
  event_name: string;
  description: string | null;
  date: string; // ISO date string
  creator_id: number | null;
  created_at: string; // ISO date string
  last_res_time: string; // ISO date string
  foods?: Food[]; // Associated food items
}

interface EventCardsProps {
  events: Event[];
}

// function that renders event cards 
export default function EventCards({ events }: EventCardsProps) {
  const router = useRouter();
    // no events are available 
  if (!events || events.length === 0) {
    return (
      <div style={{ textAlign: "center", margin: "40px 0" }}>
        <Title level={4}>No events available</Title>
        <Paragraph>Create a new event to get started!</Paragraph>
      </div>
    );
  }

// render available events as cards in a grid
  return (
    <div className="event-cards-container" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
      {events.map((event) => (
        <Card
          key={event.event_id}
          onClick={()=>{router.push(`/events/${event.event_id}`)}}
          hoverable
          style={{ height: "100%" }}
          cover={
            // header for the cards
            <div style={{ 
              height: "80px", 
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <Title level={3} style={{ color: "white", margin: 0 }}>
                {event.event_name}
              </Title>
            </div>
          }
        >
          <Paragraph>{event.description || "No description provided"}</Paragraph>
          
          <div style={{ marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
              <CalendarOutlined style={{ marginRight: "8px" }} />
              <Text>{dayjs(event.date).format("MMM D, YYYY")}</Text>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <ClockCircleOutlined style={{ marginRight: "8px" }} />
              <Text>{dayjs(event.date).format("h:mm A")}</Text>
            </div>
          </div>
          
          {event.foods && event.foods.length > 0 && (
            <>
              <Divider orientation="left">
                <CoffeeOutlined /> Food Items
              </Divider>
              <List
                size="small"
                dataSource={event.foods}
                renderItem={(item) => (
                  <List.Item>
                    <Text>{item.food_name}</Text>
                    <Tag color="green">{item.quantity}</Tag>
                  </List.Item>
                )}
              />
            </>
          )}
        </Card>
      ))}
    </div>
  );
}