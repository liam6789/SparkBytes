"use client";

import { Typography, Button, Input, Dropdown, Menu, DatePicker } from "antd";
import React, { useEffect, useState } from "react";
import { DownOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import { EventCreate, CreateFoodItem } from "@/types/types";
import type { DatePickerProps, GetProps } from "antd";

const  { RangePicker } = DatePicker;
type RangePickerProps = GetProps<typeof DatePicker.RangePicker>;


export default function EventCreationPage() {
    const [name, setName] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [foods, setFoods] = useState<CreateFoodItem[]>([]);

    const [startTime, setStartTime] = useState<Dayjs | null | undefined>(null);
    const[endTime, setEndTime] = useState<Dayjs | null | undefined>(null);

    const [foodName, setFoodName] = useState("");
    const [quantity, setQuantity] = useState(0);
    const [quantStr, setQuantStr] = useState("");
    const [validQuant, setValidQuant] = useState(true);

    const [isError, setIsError] = useState(false);

    const createevent = async () => {
        const token = localStorage.getItem("accessToken");
        console.log(token)
        const body = JSON.stringify({
            "name": name,
            "description": description,
            "start": startTime?.format(),
            "end": endTime?.format(),
            "food": foods
        })

        const res = await fetch(`http://localhost:5001/createevent`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body,
        });
        if (res.ok) {
            setIsError(false)
        } else {
            setIsError(true)
        }

        setName("")
        setDescription("")
        setFoods([])
        setStartTime(null)
        setEndTime(null)
        setFoodName("")
        setQuantity(0)
        setQuantStr("")
        setValidQuant(true)
    }
        


    return (
        <>
            <Typography.Title level={1}>
                Create Event
            </Typography.Title>

            <Typography.Title level={3}>
                Event Name
            </Typography.Title>
            <Input
                value={name}
                onChange={(e) => {
                    setName(e.target.value)
                }}
            >
            </Input>
            
            <Typography.Title level={3}>
                Event Description
            </Typography.Title>
            <Input
                value={description}
                onChange={(e) => {
                    setDescription(e.target.value)
                }}
            >
            </Input>

            <Typography.Title level={3}>
                Event Time
            </Typography.Title>
            <RangePicker
                showTime={{ format: 'HH:mm' }}
                format="YYYY-MM-DD HH:mm"
                minDate={dayjs()}
                onOk={(values: RangePickerProps['value']) => {
                    if (values) {
                        setStartTime(values[0])
                        setEndTime(values[1])
                    }
                }}
            />

            <Typography.Title level={2}>
                Add Food Items
            </Typography.Title>
            <Typography.Title level={3}>
                Food Name
            </Typography.Title>
            <Input
                value={foodName}
                onChange={(e) => {
                    setFoodName(e.target.value)
                }}
            >
            </Input>

            <Typography.Title level={3}>
                Quantity of Aforementioned Food Item
            </Typography.Title>
            <Input
                value={quantStr}
                onChange={(e) => {
                    setQuantStr(e.target.value)
                    setQuantity(parseInt(e.target.value))
                    setValidQuant(true)
                }}
            >
            </Input>
            {validQuant ? null : <Typography.Paragraph style={{color:"red"}}>Enter a valid number</Typography.Paragraph>}
            <div>
                <Button
                    onClick={(e) => {
                        if (isNaN(quantity)) {
                            setValidQuant(false)
                        } else {
                            const item: CreateFoodItem = {
                                name: foodName,
                                quantity: quantity
                            }
                            setFoods([...foods, item])
                        }
                        setFoodName("")
                        setQuantStr("")
                        setQuantity(0)
                    }}
                    style={{marginTop:"4px"}}
                >
                    Add Item
                </Button>
            </div>
            {isError ? <Typography.Paragraph style={{color:"red"}}>Failed to Create Event. Try again!</Typography.Paragraph> : null}
            <div>   
                <Button
                    onClick={(e) => {
                        createevent()
                    }}
                    style={{marginTop:"12px"}}
                >
                    Create Event
                </Button>
            </div>
        </>
    );
}