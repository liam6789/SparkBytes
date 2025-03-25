"use client";

import { Typography, Button, Input, Dropdown, Menu } from "antd";
import React, { useEffect, useState } from "react";
import { DownOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

export default function ReservationPage() {
    const [eventOpts, setEventOpts] = useState([]);
    const [foodOpts, setFoodOpts] = useState([]);
    const [quantityMax, setQuantity] = useState(0);
    const [latestTime, setLatestTime] = useState(dayjs().hour(23).minute(59));
    const [timeOpts, setTimeOpts] = useState<dayjs.Dayjs[]>([]);

    const [event, setEvent] = useState(-1);
    const [foodID, setFoodID] = useState(-1);
    const [quantity, setQuanity] = useState(0);
    const [quantityStr, setQuantityStr] = useState("");
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [note, setNote] = useState("");
    
    const [submit, setSubmit] = useState(false)

    useEffect(() => {
        // TODO: Implement backend functionality to insert data into the reservations table in the database
        setSubmit(false)
    }, [submit])

    useEffect(() => {
        // TODO: Implement backend functionality that will load the current events into the eventOpts state so that users can select
        // events they want to make a reservation for. This should be updated on load
    }, [])

    useEffect(() => {
        // TODO: Implement backend functionality that will load the food options for the selected event. Updated whenever the selected event changes
    }, [event])

    useEffect(() => {
        // TODO: Implement backend functionality that will load the max quantity of the selected food option that is available for the 
        // selected event so that they don't enter a value greater than the max.
    }, [foodID])

    useEffect(() => {
        generateTimeSlots()
    }, [latestTime])


    const generateTimeSlots = () => {
        let now = dayjs();
        let roundedNow = now.subtract(now.minute() % 5, "minute");
        let times = [];

        while (roundedNow.isBefore(latestTime)) {
            times.push(roundedNow);
            roundedNow = roundedNow.add(5, "minute");
        }

        setTimeOpts(times);
    }

    return (
        <>
            <Typography.Title level={1}>
                Create Reservation
            </Typography.Title>

            <Typography.Title level={3}>
                Select Event
            </Typography.Title>
            <Dropdown 
                menu={{
                    items: eventOpts.map((events) => ({
                        key: events,
                        label: events,
                        onClick: () => setEvent(events),
                    })),
                }}
            >
                <Button>
                    {event ? event : "Choose an event"} <DownOutlined />
                </Button>
            </Dropdown>

            <Typography.Title level={3}>
                Select Food Item
            </Typography.Title>
            <Dropdown 
                menu={{
                    items: foodOpts.map((foods) => ({
                        key: foods,
                        label: foods,
                        onClick: () => setEvent(foods),
                    })),
                }}
            >
                <Button>
                    {foodID ? foodID : "Choose a food item"} <DownOutlined />
                </Button>
            </Dropdown>

            <Typography.Title level={3}>
                Input Quantity
            </Typography.Title>
            <Input
                value={quantityStr}
                onChange={(e) => {
                    setQuantity(parseInt(e.target.value))
                    setQuantityStr(e.target.value)
                }}
            >
            </Input>

            <Typography.Title level={3}>
                Pickup Time
            </Typography.Title>
            <Dropdown
                menu={{
                items: timeOpts.map((time) => ({
                    key: time.format("HH:mm"),
                    label: time.format("hh:mm A"),
                    onClick: () => setSelectedTime(time.format("hh:mm A")),
                })),
                }}
            >
                <Button>
                    {selectedTime || "Choose a time"} <DownOutlined />
                </Button>
            </Dropdown>

            <Typography.Title level={3}>
                Notes
            </Typography.Title>
            <Input
                value={note}
                onChange={(e) => {
                    setNote(e.target.value)
                }}
            >
            </Input>

            <Button
                style={{marginTop:"16px"}}
                onClick={(e) => {
                    setSubmit(true)
                }}
            >Submit</Button>
        </>
    );
}