"use client";

import { Typography, Button, Input, Dropdown, Menu } from "antd";
import React, { useEffect, useState } from "react";
import { DownOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { ReservationCreate, ReservationData, FoodData, EventData } from "@/types/types";

export default function ReservationPage() {
    const [eventOpts, setEventOpts] = useState<EventData[]>([]);
    const [foodOpts, setFoodOpts] = useState<FoodData[]>([]);
    const [timeOpts, setTimeOpts] = useState<dayjs.Dayjs[]>([]);

    const [event, setEvent] = useState<EventData | null>(null);
    const [food, setFood] = useState<FoodData | null>(null);
    const [quantity, setQuantity] = useState(0);
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
        generateTimeSlots();
    }, [event])

    useEffect(() => {
        // TODO: Implement backend functionality that will load the max quantity of the selected food option that is available for the 
        // selected event so that they don't enter a value greater than the max.
    }, [food])


    const generateTimeSlots = () => {
        let now = dayjs();
        let roundedNow = now.subtract(now.minute() % 5, "minute");
        let times = [];

        while (roundedNow.isBefore(event?.last_res_time)) {
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
                        key: events.event_name,
                        label: events.event_name,
                        onClick: () => setEvent(events),
                    })),
                }}
            >
                <Button>
                    {event?.event_name ? event.event_name : "Choose an event"} <DownOutlined />
                </Button>
            </Dropdown>

            {event != null ?
            <><Typography.Title level={3}>
                Select Food Item
            </Typography.Title>
            <Dropdown 
                menu={{
                    items: foodOpts.map((foods) => ({
                        key: foods.food_name,
                        label: foods.food_name,
                        onClick: () => setFood(foods),
                    })),
                }}
            >
                <Button>
                    {food?.food_name ? food.food_name : "Choose a food item"} <DownOutlined />
                </Button>
            </Dropdown> </>: null
            }

            {food != null ?
            <><Typography.Title level={3}>
                Input Quantity
            </Typography.Title>
            <Input
                value={quantityStr}
                onChange={(e) => {
                    setQuantity(parseInt(e.target.value))
                    setQuantityStr(e.target.value)
                }}
            >
            </Input> </>: null   
            }

            {event != null && food != null ? 
            <><Typography.Title level={3}>
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
            </Dropdown></> : null
            }

            {selectedTime != null ? 
            <><Typography.Title level={3}>
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
            >Submit</Button></> : null
            }
        </>
    );
}