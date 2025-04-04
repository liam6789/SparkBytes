"use client";

import { Typography, Button, Input, Dropdown, Menu, TimePicker } from "antd";
import React, { useEffect, useState } from "react";
import { DownOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import ReservationTimePicker from "../components/picktime";
import { ReservationCreate, ReservationData, FoodData, EventData } from "@/types/types";

export default function ReservationPage() {
    const [eventOpts, setEventOpts] = useState<EventData[]>([]);
    const [foodOpts, setFoodOpts] = useState<FoodData[]>([]);
    const [quantityOpts, setQuantityOpts] = useState<number[]>([]);
    const [lastTime, setLastTime] = useState<dayjs.Dayjs>(dayjs());
    
    const [noEvents, setNoEvents] = useState("");
    const [noFood, setNoFood] = useState("");

    const [event, setEvent] = useState<EventData | null>(null);
    const [food, setFood] = useState<FoodData | null>(null);
    const [quantity, setQuantity] = useState(0);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [note, setNote] = useState("");
    const [onStart, setOnStart] = useState(true);

    const [submit, setSubmit] = useState(false)

    useEffect(() => {
        // TODO: Implement backend functionality to insert data into the reservations table in the database
        setSubmit(false)
    }, [submit])

    useEffect(() => {
        // TODO: Implement backend functionality that will load the current events into the eventOpts state so that users can select
        // events they want to make a reservation for. This should be updated on load
        const fetchEvents = async () => {
            const res = await fetch(`http://localhost:5001/active-events`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
            })

            if (res.ok) {
                const data = await res.json();
                console.log(data)
                if (data.events.length > 0) {
                    setEventOpts(data.events);
                    setNoEvents("");
                } else {
                    setNoEvents("No events available. Please check back later or refresh the page.");
                }
            }
        }

        fetchEvents();
    }, [])

    useEffect(() => {
        // TODO: Implement backend functionality that will load the food options for the selected event. Updated whenever the selected event changes
        const fetchFood = async () => {
            const res = await fetch(`http://localhost:5001/get-food/${event?.event_id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
            })

            if (res.ok) {
                const data = await res.json();
                console.log(data.foods)
                if (data.foods.length > 0) {
                    setFoodOpts(data.foods);
                    setNoFood("");
                } else {
                    setNoFood("No food options available. Please check back later or refresh the page.");
                }
            }
        }
        if (onStart) {
            setOnStart(false);
        } else if (event != null) {
            fetchFood();
            setLastTime(dayjs(event.last_res_time));
            setFood(null);
            setQuantity(0);
            setQuantityOpts([]);
            setSelectedTime(null);
        }
    }, [event])

    useEffect(() => {
        // TODO: Implement backend functionality that will load the max quantity of the selected food option that is available for the 
        // selected event so that they don't enter a value greater than the max.
        const setOpts = (foodItem: FoodData) => {
            let opts = [];
            for (let i = 1; i <= foodItem.quantity; i++) {
                opts.push(i);
            }
            setQuantityOpts(opts);
        }

        if (onStart) {
            setOnStart(false);
        } else if (food != null) {
            setOpts(food);
        }
    }, [food])

    return (
        <>
            <Typography.Title level={1}>
                Create Reservation
            </Typography.Title>
            {noEvents && <Typography.Title level={3} type="danger">{noEvents}</Typography.Title>}
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
            
            {noFood && <Typography.Title level={3} type="danger">{noFood}</Typography.Title>}
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
            <Dropdown 
                menu={{
                    items: quantityOpts.map((num) => ({
                        key: num,
                        label: num,
                        onClick: () => setQuantity(num),
                    })),
                }}
            >
                <Button>
                    {quantity != 0 ? quantity : "Select a Quantity"} <DownOutlined />
                </Button>
            </Dropdown> </>: null   
            }

            {event != null && food != null ? 
            <><Typography.Title level={3}>
                Pickup Time
            </Typography.Title>
            <ReservationTimePicker
                lastRes={dayjs(event.last_res_time)}
                onChange={(time) => {
                    if (time != null) {
                        setSelectedTime(time.format("HH:mm"));
                    } else {
                        setSelectedTime(null);
                    }
                }}
            >
            </ReservationTimePicker></> : null}

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