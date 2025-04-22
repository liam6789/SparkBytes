"use client";

import { Typography, Button, Input, Dropdown, Menu, DatePicker, Select, Space, Tag } from "antd";
import React, { useEffect, useState, useRef } from "react";
import { DownOutlined } from "@ant-design/icons";
import { useRouter } from 'next/navigation';
import dayjs, { Dayjs } from "dayjs";
import { CreateFoodItem } from "@/types/types";
import type { DatePickerProps, GetProps } from "antd";
import Script from 'next/script';

const { RangePicker } = DatePicker;
const { Option } = Select;
type RangePickerProps = GetProps<typeof DatePicker.RangePicker>;

const dietaryOptions = [
    { label: 'Vegetarian', value: 'vegetarian' },
    { label: 'Vegan', value: 'vegan' },
    { label: 'Gluten-Free', value: 'gluten-free' },
    { label: 'Dairy-Free', value: 'dairy-free' },
    { label: 'Nut-Free', value: 'nut-free' },
    { label: 'Kosher', value: 'kosher' },
    { label: 'Halal', value: 'halal' },
];

const mapStyle = {
    height: "300px",
    width: "500px",
}

const defaultCenter = {
    lat: 42.35005952363728, 
    lng: -71.10318646684273
}

// API key 
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// Google globals 
declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export default function EventCreationPage() {
    const router = useRouter();
    const [name, setName] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [foods, setFoods] = useState<CreateFoodItem[]>([]);

    const [startTime, setStartTime] = useState<Dayjs | null | undefined>(null);
    const[endTime, setEndTime] = useState<Dayjs | null | undefined>(null);

    const [foodName, setFoodName] = useState("");
    const [quantity, setQuantity] = useState(0);
    const [quantStr, setQuantStr] = useState("");
    const [validQuant, setValidQuant] = useState(true);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    // Google Maps states
    const [googleMapsReady, setGoogleMapsReady] = useState(false);
    const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
    const [locationStr, setLocationStr] = useState<string>("");
    
    // initialize 
    useEffect(() => {
        if (!googleMapsReady || !window.google) return;
        
        // map container and input elements 
        const mapContainer = document.getElementById('google-map-container');
        const searchInput = document.getElementById('location-search-input') as HTMLInputElement;
        
        if (!mapContainer || !searchInput) return;
        
        try {
            // initialize the map
            const map = new window.google.maps.Map(mapContainer, {
                center: defaultCenter,
                zoom: 15,
            });
            
            // initialize autocomplete
            const autocomplete = new window.google.maps.places.Autocomplete(searchInput);
            let marker: google.maps.Marker | null = null;
            
            // add place_changed event listener
            autocomplete.addListener('place_changed', () => {
                const place = autocomplete.getPlace();
                
                if (place && place.geometry && place.geometry.location) {
                    const lat = place.geometry.location.lat();
                    const lng = place.geometry.location.lng();
                    
                    // update location state
                    setLocation({
                        lat,
                        lng,
                        address: place.formatted_address || "Selected location"
                    });
                    setLocationStr(place.formatted_address || "Selected location");
                    
                    // center map on location 
                    map.setCenter({ lat, lng });
                    
                    // add or update marker 
                    if (marker) {
                        marker.setPosition({ lat, lng });
                    } else {
                        marker = new window.google.maps.Marker({
                            position: { lat, lng },
                            map
                        });
                    }
                }
            });
        } catch (error) {
            console.error("Error initializing Google Maps:", error);
        }
    }, [googleMapsReady]);

    const handleGoogleMapsLoaded = () => {
        setGoogleMapsReady(true);
    };

    const createevent = async () => {
        const token = localStorage.getItem("accessToken");
        const body = JSON.stringify({
            "name": name,
            "description": description,
            "start": startTime?.format(),
            "end": endTime?.format(),
            "food": foods,
            "location_lat": location?.lat,
            "location_lng": location?.lng,
            "location_address": location?.address,
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
            alert("Event created successfully!");
            router.push('/host/events')
            setName("")
            setDescription("")
            setFoods([])
            setStartTime(null)
            setEndTime(null)
            setFoodName("")
            setQuantity(0)
            setQuantStr("")
            setValidQuant(true)
        } else {
            alert("Failed to create event. Please try again.");
        }
    }
        
    return (
        <>
            {/* Load Google Maps API */}
            <Script
                src={`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`}
                onLoad={handleGoogleMapsLoaded}
                strategy="afterInteractive"
            />
            
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
            />
            
            <Typography.Title level={3}>
                Event Description
            </Typography.Title>
            <Input
                value={description}
                onChange={(e) => {
                    setDescription(e.target.value)
                }}
            />

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
            <Typography.Title level={3}>
                Event Location
            </Typography.Title>
            
            {/* Location search input with specific ID */}
            <Input
                id="location-search-input"
                placeholder="Search for a location"
                value={locationStr}
                onChange={(e) => setLocationStr(e.target.value)}
                style={{ marginBottom: "16px" }}
            />
            
            {location && (
                <div style={{ marginTop: "16px", marginBottom: "16px" }}>
                    <strong>Selected Location:</strong> {location.address}
                </div>
            )}
            
            {/* Map container with specific ID */}
            <div 
                id="google-map-container" 
                style={mapStyle}
            >
                {!googleMapsReady && <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading map...</div>}
            </div>

            <Typography.Title level={2} style={{ marginTop: "24px" }}>
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
            />

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
            />
            {validQuant ? null : <Typography.Paragraph style={{color:"red"}}>Enter a valid number</Typography.Paragraph>}

            <Typography.Title level={3}>
                Dietary Tags
            </Typography.Title>
            <Select
                mode="multiple"
                allowClear
                style={{ width: '100%', marginBottom: "16px" }}
                placeholder="Select dietary tags for this food"
                value={selectedTags}
                onChange={(value) => setSelectedTags(value)}
            >
                {dietaryOptions.map(option => (
                    <Option key={option.value} value={option.value}>{option.label}</Option>
                ))}
            </Select>        

            <div>
                <Button
                    onClick={(e) => {
                        if (isNaN(quantity)) {
                            setValidQuant(false)
                        } else {
                            const item: CreateFoodItem = {
                                name: foodName,
                                quantity: quantity,
                                dietary_tags: selectedTags.join(',')
                            }
                            setFoods([...foods, item])
                        }
                        setFoodName("")
                        setQuantStr("")
                        setQuantity(0)
                        setSelectedTags([]);
                    }}
                    style={{marginTop:"4px"}}
                >
                    Add Item
                </Button>
            </div>

            {/* added food items with tags */}
            {foods.length > 0 && (
                <div style={{ marginTop: "16px", marginBottom: "16px" }}>
                    <Typography.Title level={4}>Added Food Items:</Typography.Title>
                    <ul>
                        {foods.map((food, index) => (
                            <li key={index}>
                                <Space>
                                    <strong>{food.name}</strong>
                                    <span>(Qty: {food.quantity})</span>
                                    {food.dietary_tags && food.dietary_tags.split(',').map(tag => (
                                        <Tag key={tag} color="blue">{tag}</Tag>
                                    ))}
                                </Space>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            
            <div>   
                <Button
                    onClick={(e) => {
                        createevent();
                    }}
                    style={{ marginTop: "12px" }}
                    type="primary"
                >
                    Create Event
                </Button>
            </div>
        </>
    );
}