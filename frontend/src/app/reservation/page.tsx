"use client";

import { Typography, Button, Input, Dropdown, Menu } from "antd";
import React, { useEffect, useState } from "react";
import { DownOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
<<<<<<< HEAD
<<<<<<< HEAD
import { ReservationCreate, ReservationData, FoodData, EventData } from "@/types/types";

export default function ReservationPage() {
    const [eventOpts, setEventOpts] = useState<EventData[]>([]);
    const [foodOpts, setFoodOpts] = useState<FoodData[]>([]);
    const [timeOpts, setTimeOpts] = useState<dayjs.Dayjs[]>([]);

    const [event, setEvent] = useState<EventData | null>(null);
    const [food, setFood] = useState<FoodData | null>(null);
    const [quantity, setQuantity] = useState(0);
=======
=======
import { ReservationCreate, ReservationData, FoodData, EventData } from "@/types/types";
>>>>>>> 5a0fee8 (Created interfaces in the types.ts file based on the columns in the database tables and changed a lot of the state variables in the reservation page to revolve around said types. Also added some conditional rendering so that people can't select food options until they've selected an event they want to make a reservation for and so on and so forth such that the form has an incremental nature)

export default function ReservationPage() {
    const [eventOpts, setEventOpts] = useState<EventData[]>([]);
    const [foodOpts, setFoodOpts] = useState<FoodData[]>([]);
    const [timeOpts, setTimeOpts] = useState<dayjs.Dayjs[]>([]);

<<<<<<< HEAD
    const [event, setEvent] = useState(-1);
    const [foodID, setFoodID] = useState(-1);
    const [quantity, setQuanity] = useState(0);
>>>>>>> 9f8a037 (Created a reservation page that currently allows the user to sets up the ability to select an event, the food they want, the quantity of said food, the pickup time, and any notes they want to provide. Now I need to create some types to prep for actually implementing the backend routes)
=======
    const [event, setEvent] = useState<EventData | null>(null);
    const [food, setFood] = useState<FoodData | null>(null);
    const [quantity, setQuantity] = useState(0);
>>>>>>> 5a0fee8 (Created interfaces in the types.ts file based on the columns in the database tables and changed a lot of the state variables in the reservation page to revolve around said types. Also added some conditional rendering so that people can't select food options until they've selected an event they want to make a reservation for and so on and so forth such that the form has an incremental nature)
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
<<<<<<< HEAD
<<<<<<< HEAD
        generateTimeSlots();
=======
>>>>>>> 9f8a037 (Created a reservation page that currently allows the user to sets up the ability to select an event, the food they want, the quantity of said food, the pickup time, and any notes they want to provide. Now I need to create some types to prep for actually implementing the backend routes)
=======
        generateTimeSlots();
>>>>>>> 5a0fee8 (Created interfaces in the types.ts file based on the columns in the database tables and changed a lot of the state variables in the reservation page to revolve around said types. Also added some conditional rendering so that people can't select food options until they've selected an event they want to make a reservation for and so on and so forth such that the form has an incremental nature)
    }, [event])

    useEffect(() => {
        // TODO: Implement backend functionality that will load the max quantity of the selected food option that is available for the 
        // selected event so that they don't enter a value greater than the max.
<<<<<<< HEAD
<<<<<<< HEAD
    }, [food])
=======
    }, [foodID])

    useEffect(() => {
        generateTimeSlots()
    }, [latestTime])
>>>>>>> 9f8a037 (Created a reservation page that currently allows the user to sets up the ability to select an event, the food they want, the quantity of said food, the pickup time, and any notes they want to provide. Now I need to create some types to prep for actually implementing the backend routes)
=======
    }, [food])
>>>>>>> 5a0fee8 (Created interfaces in the types.ts file based on the columns in the database tables and changed a lot of the state variables in the reservation page to revolve around said types. Also added some conditional rendering so that people can't select food options until they've selected an event they want to make a reservation for and so on and so forth such that the form has an incremental nature)


    const generateTimeSlots = () => {
        let now = dayjs();
        let roundedNow = now.subtract(now.minute() % 5, "minute");
        let times = [];

<<<<<<< HEAD
<<<<<<< HEAD
        while (roundedNow.isBefore(event?.last_res_time)) {
=======
        while (roundedNow.isBefore(latestTime)) {
>>>>>>> 9f8a037 (Created a reservation page that currently allows the user to sets up the ability to select an event, the food they want, the quantity of said food, the pickup time, and any notes they want to provide. Now I need to create some types to prep for actually implementing the backend routes)
=======
        while (roundedNow.isBefore(event?.last_res_time)) {
>>>>>>> 5a0fee8 (Created interfaces in the types.ts file based on the columns in the database tables and changed a lot of the state variables in the reservation page to revolve around said types. Also added some conditional rendering so that people can't select food options until they've selected an event they want to make a reservation for and so on and so forth such that the form has an incremental nature)
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
<<<<<<< HEAD
<<<<<<< HEAD
                        key: events.event_name,
                        label: events.event_name,
=======
                        key: events,
                        label: events,
>>>>>>> 9f8a037 (Created a reservation page that currently allows the user to sets up the ability to select an event, the food they want, the quantity of said food, the pickup time, and any notes they want to provide. Now I need to create some types to prep for actually implementing the backend routes)
=======
                        key: events.event_name,
                        label: events.event_name,
>>>>>>> 5a0fee8 (Created interfaces in the types.ts file based on the columns in the database tables and changed a lot of the state variables in the reservation page to revolve around said types. Also added some conditional rendering so that people can't select food options until they've selected an event they want to make a reservation for and so on and so forth such that the form has an incremental nature)
                        onClick: () => setEvent(events),
                    })),
                }}
            >
                <Button>
<<<<<<< HEAD
<<<<<<< HEAD
                    {event?.event_name ? event.event_name : "Choose an event"} <DownOutlined />
                </Button>
            </Dropdown>
            
            {event != null ?
            <><Typography.Title level={3}>
=======
                    {event ? event : "Choose an event"} <DownOutlined />
                </Button>
            </Dropdown>

            <Typography.Title level={3}>
>>>>>>> 9f8a037 (Created a reservation page that currently allows the user to sets up the ability to select an event, the food they want, the quantity of said food, the pickup time, and any notes they want to provide. Now I need to create some types to prep for actually implementing the backend routes)
=======
                    {event?.event_name ? event.event_name : "Choose an event"} <DownOutlined />
                </Button>
            </Dropdown>
            
            {event != null ?
            <><Typography.Title level={3}>
>>>>>>> 5a0fee8 (Created interfaces in the types.ts file based on the columns in the database tables and changed a lot of the state variables in the reservation page to revolve around said types. Also added some conditional rendering so that people can't select food options until they've selected an event they want to make a reservation for and so on and so forth such that the form has an incremental nature)
                Select Food Item
            </Typography.Title>
            <Dropdown 
                menu={{
                    items: foodOpts.map((foods) => ({
<<<<<<< HEAD
<<<<<<< HEAD
                        key: foods.food_name,
                        label: foods.food_name,
                        onClick: () => setFood(foods),
=======
                        key: foods,
                        label: foods,
                        onClick: () => setEvent(foods),
>>>>>>> 9f8a037 (Created a reservation page that currently allows the user to sets up the ability to select an event, the food they want, the quantity of said food, the pickup time, and any notes they want to provide. Now I need to create some types to prep for actually implementing the backend routes)
=======
                        key: foods.food_name,
                        label: foods.food_name,
                        onClick: () => setFood(foods),
>>>>>>> 5a0fee8 (Created interfaces in the types.ts file based on the columns in the database tables and changed a lot of the state variables in the reservation page to revolve around said types. Also added some conditional rendering so that people can't select food options until they've selected an event they want to make a reservation for and so on and so forth such that the form has an incremental nature)
                    })),
                }}
            >
                <Button>
<<<<<<< HEAD
<<<<<<< HEAD
                    {food?.food_name ? food.food_name : "Choose a food item"} <DownOutlined />
                </Button>
            </Dropdown> </>: null
            }

            {food != null ?
            <><Typography.Title level={3}>
=======
                    {foodID ? foodID : "Choose a food item"} <DownOutlined />
=======
                    {food?.food_name ? food.food_name : "Choose a food item"} <DownOutlined />
>>>>>>> 5a0fee8 (Created interfaces in the types.ts file based on the columns in the database tables and changed a lot of the state variables in the reservation page to revolve around said types. Also added some conditional rendering so that people can't select food options until they've selected an event they want to make a reservation for and so on and so forth such that the form has an incremental nature)
                </Button>
            </Dropdown> </>: null
            }

<<<<<<< HEAD
            <Typography.Title level={3}>
>>>>>>> 9f8a037 (Created a reservation page that currently allows the user to sets up the ability to select an event, the food they want, the quantity of said food, the pickup time, and any notes they want to provide. Now I need to create some types to prep for actually implementing the backend routes)
=======
            {food != null ?
            <><Typography.Title level={3}>
>>>>>>> 5a0fee8 (Created interfaces in the types.ts file based on the columns in the database tables and changed a lot of the state variables in the reservation page to revolve around said types. Also added some conditional rendering so that people can't select food options until they've selected an event they want to make a reservation for and so on and so forth such that the form has an incremental nature)
                Input Quantity
            </Typography.Title>
            <Input
                value={quantityStr}
                onChange={(e) => {
                    setQuantity(parseInt(e.target.value))
                    setQuantityStr(e.target.value)
                }}
            >
<<<<<<< HEAD
<<<<<<< HEAD
            </Input> </>: null   
            }

            {event != null && food != null ? 
            <><Typography.Title level={3}>
=======
            </Input>

            <Typography.Title level={3}>
>>>>>>> 9f8a037 (Created a reservation page that currently allows the user to sets up the ability to select an event, the food they want, the quantity of said food, the pickup time, and any notes they want to provide. Now I need to create some types to prep for actually implementing the backend routes)
=======
            </Input> </>: null   
            }

            {event != null && food != null ? 
            <><Typography.Title level={3}>
>>>>>>> 5a0fee8 (Created interfaces in the types.ts file based on the columns in the database tables and changed a lot of the state variables in the reservation page to revolve around said types. Also added some conditional rendering so that people can't select food options until they've selected an event they want to make a reservation for and so on and so forth such that the form has an incremental nature)
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
<<<<<<< HEAD
<<<<<<< HEAD
            </Dropdown></> : null
            }

            {selectedTime != null ? 
            <><Typography.Title level={3}>
=======
            </Dropdown>

            <Typography.Title level={3}>
>>>>>>> 9f8a037 (Created a reservation page that currently allows the user to sets up the ability to select an event, the food they want, the quantity of said food, the pickup time, and any notes they want to provide. Now I need to create some types to prep for actually implementing the backend routes)
=======
            </Dropdown></> : null
            }

            {selectedTime != null ? 
            <><Typography.Title level={3}>
>>>>>>> 5a0fee8 (Created interfaces in the types.ts file based on the columns in the database tables and changed a lot of the state variables in the reservation page to revolve around said types. Also added some conditional rendering so that people can't select food options until they've selected an event they want to make a reservation for and so on and so forth such that the form has an incremental nature)
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
<<<<<<< HEAD
<<<<<<< HEAD
            >Submit</Button></> : null
            }
=======
            >Submit</Button>
>>>>>>> 9f8a037 (Created a reservation page that currently allows the user to sets up the ability to select an event, the food they want, the quantity of said food, the pickup time, and any notes they want to provide. Now I need to create some types to prep for actually implementing the backend routes)
=======
            >Submit</Button></> : null
            }
>>>>>>> 5a0fee8 (Created interfaces in the types.ts file based on the columns in the database tables and changed a lot of the state variables in the reservation page to revolve around said types. Also added some conditional rendering so that people can't select food options until they've selected an event they want to make a reservation for and so on and so forth such that the form has an incremental nature)
        </>
    );
}