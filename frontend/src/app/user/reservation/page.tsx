"use client";

import { Typography, Button, Input, Dropdown } from "antd";
import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { DownOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import ReservationTimePicker from "../../components/picktime";
import { FoodData, EventData } from "@/types/types";

export default function ReservationPage() {
    const router = useRouter()
    const [eventOpts, setEventOpts] = useState<EventData[]>([]);
    const [foodOpts, setFoodOpts] = useState<FoodData[]>([]);
    const [quantityOpts, setQuantityOpts] = useState<number[]>([]);
    
    const [noEvents, setNoEvents] = useState("");
    const [noFood, setNoFood] = useState("");

    const [event, setEvent] = useState<EventData | null>(null);
    const [food, setFood] = useState<FoodData | null>(null);
    const [quantity, setQuantity] = useState(0);
    const [selectedTime, setSelectedTime] = useState<Dayjs | null | undefined>(null);
    const [note, setNote] = useState("");
    const [onStart, setOnStart] = useState(true);

    const createReservation = async () => {
        const token = localStorage.getItem("accessToken");
        const body = JSON.stringify({
            "food_id": food?.food_id,
            "food_name":food?.food_name,
            "event_id": event?.event_id,
            "quantity": quantity,
            "pickup_time": selectedTime,
            "note": note,
        })

        const res = await fetch(`https://sparkbytes.onrender.com/createreservation`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body,
        });

        if (res.ok) {
            alert("Reservation created successfully!");
            router.push('/');
            setEvent(null);
            setFood(null);
            setQuantity(0);
            setSelectedTime(null);
            setNote("");
            setFoodOpts([]);
            setQuantityOpts([]);
            setNoEvents("");
            setNoFood("");
        } else {
            alert("Failed to create reservation. Please try again.");
        }
    }

    useEffect(() => {
        // TODO: Implement backend functionality that will load the current events into the eventOpts state so that users can select
        // events they want to make a reservation for. This should be updated on load
        const fetchEvents = async () => {
            const res = await fetch(`https://sparkbytes.onrender.com/active-events`, {
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
            const res = await fetch(`https://sparkbytes.onrender.com/get-food/${event?.event_id}`, {
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
            const opts = [];
            for (let i = 1; i <= foodItem.quantity && i <= 5; i++) {
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
                value={selectedTime}
                onChange={(time) => {
                    setSelectedTime(time);
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
                onClick={() => {
                    if (selectedTime == null || food == null || event == null || quantity == 0) {
                        alert("Please fill out all fields");
                        return;
                    }
                    createReservation();
                }}
            >Submit</Button></> : null
            }
        </>
    );
}