import React from "react";
import { TimePicker } from "antd";
import dayjs, { Dayjs } from "dayjs";

interface Props {
    lastRes: Dayjs;
    onChange: (time: Dayjs | null) => void;
}

const ReservationTimePicker : React.FC<Props> = ({ lastRes, onChange }) => {
    const now = dayjs();
    const disabledTime = () => {
        const currentHour = now.hour();
        const currentMinute = now.minute();

        return {
            disabledHours: () => {
                const hours = [];
                for (let i = 0; i < currentHour; i++) {
                    hours.push(i);
                }
                for (let i = 24; i > lastRes.hour(); i--) {
                    hours.push(i);
                }
                return hours;
            },
            disabledMinutes: (hour : number) => {
                const minutes = [];
                if (hour === currentHour) {
                    for (let i = 0; i < currentMinute; i++) {
                        minutes.push(i);
                    }
                }
                if (hour === lastRes.hour()) {
                    for (let i = 60; i > lastRes.minute(); i--) {
                        minutes.push(i);
                    }
                }
                return minutes;
            },
            disabledSeconds: () => [],
        };
    }

    return (
        <TimePicker
            disabledTime={disabledTime}
            format={"HH:mm"}
            hideDisabledOptions
            onChange={onChange}
        ></TimePicker>
    )
}

export default ReservationTimePicker;