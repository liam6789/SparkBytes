export interface ReservationCreate {
    food_id: number,
    event_id: number,
    quantity: number,
    res_time: Date,
    notes: Text
}

export interface EventCreate {
    name: string,
    description: string,
    start: Date | null | undefined,
    end: Date | null | undefined, 
    food: CreateFoodItem[]
}

export interface CreateFoodItem {
    name: string,
    quantity: number
    dietary_tags?: string;
}

export interface ReservationData {
    res_id: number,
    food_id: number,
    food_name: string,
    user_id: number,
    event_id: number,
    quantity: number,
    res_time: number,
    notes: Text
}

export interface FoodData {
    food_id: number,
    food_name: string,
    quantity: number,
    event_id: number
}

export interface EventData {
    event_id: number,
    event_name: string,
    description: string,
    date: Date,
    creator_id: number,
    start_time: Date,
    last_res_time: Date
    foods?: FoodData[]
}