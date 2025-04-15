'use client';

import React, { useEffect, useState } from "react";
import { Typography, Input, Button, Rate, Dropdown, message } from "antd";
import { DownOutlined } from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;

interface AttendedEvent {
  event_id: number;
  event_name: string;
  description: string;
}

export default function RateEventPage() {
    // State for attended events to rate on
    const [events, setEvents] = useState<AttendedEvent[]>([]);
    // Selected event for ratinvg
    const [selectedEvent, setSelectedEvent] = useState<AttendedEvent | null>(null);
    // Allow rating from 1-5 with half star increments
    const [rating, setRating] = useState<number>(0);
    // Optional comment
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [noEvents, setNoEvents] = useState('');

    // Fetch user's past events from reservations db
    useEffect(() => {
        const fetchEvents = async () => {
        const token = localStorage.getItem("accessToken");
        const res = await fetch("http://localhost:5001/user/reservations", {
            method: "GET",
            headers: {
            Authorization: `Bearer ${token}`,
            },
        });

        const data = await res.json();
        const attended = data.reservations?.map((r: any) => r.events);

        // Unique events ID
        const uniqueEvents = attended.filter(
            (event: AttendedEvent, index: number, self: AttendedEvent[]) =>
            index === self.findIndex((e) => e.event_id === event.event_id)
        );

        // Check if event exists
        if (!uniqueEvents || uniqueEvents.length === 0) {
            setNoEvents("You haven't attended any events yet.");
        } else {
            setEvents(uniqueEvents);
        }
        };

        fetchEvents();
    }, []);

    // Submit rating form
    const handleSubmit = async () => {
        if (!selectedEvent || rating === 0) {
        message.error("Please select an event and a star rating.");
        return;
        }

        setLoading(true);
        const token = localStorage.getItem("accessToken");

        const res = await fetch("http://localhost:5001/rate-event", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            event_id: selectedEvent.event_id,
            rating,
            description: comment
        }),
        });

        const data = await res.json();
        setLoading(false);

        if (res.ok) {
        message.success("Thanks for your feedback!");
        setSelectedEvent(null);
        setRating(0);
        setComment('');
        } else {
        message.error(data.detail || "Failed to submit rating.");
        }
    };

    return (
        <div style={{ padding: "40px 24px", maxWidth: 600, margin: "auto" }}>
        <Title level={2}>Rate an Event</Title>
        <Paragraph>
            Share your thoughts! Rate events you've attended and leave optional feedback.
        </Paragraph>

        {noEvents && (
            <Paragraph type="secondary" style={{ color: "#999" }}>
            {noEvents}
            </Paragraph>
        )}

        {events.length > 0 && (
            <>
          {/* Event Selection Dropdown - based off reservation */}
            <Title level={4}>Select an Event</Title>
            <Dropdown
                menu={{
                items: events.map((e) => ({
                    key: e.event_id,
                    label: e.event_name,
                    onClick: () => setSelectedEvent(e),
                })),
                }}
            >
                <Button>
                {selectedEvent?.event_name || "Choose an event"} <DownOutlined />
                </Button>
            </Dropdown>

          {/* Rating value */}
            <div style={{ marginTop: 24 }}>
                <Title level={4}>Star Rating</Title>
                <Rate
                allowHalf
                value={rating}
                onChange={(value) => setRating(value)}
                />
            </div>

          {/* Comment box */}
            <div style={{ marginTop: 24 }}>
                <Title level={4}>Comment (Optional)</Title>
                <Input.TextArea
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Let us know how the event went..."
                />
            </div>

            <Button
                type="primary"
                style={{ marginTop: 24 }}
                onClick={handleSubmit}
                loading={loading}
            >
                Submit Rating
            </Button>
            </>
        )}
        </div>
    );
}