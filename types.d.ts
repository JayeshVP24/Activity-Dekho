import { Timestamp } from "firebase/firestore";

export interface ClubType {
    id: string;
    name: string;
    email: string;
    photoUrl?: string;
    Events?: EventType[]
    Students?: StudentType[]
  }

export interface EventType {
  id?: string,
  name: string,
  startDate: Timestamp,
  endDate: Timestamp,
  attendance?: Record<string, string>,
  activityHours: number
}

export interface ClubStudentType {
  id: string,
  events: string[]
}

export interface StudentType {
  id: string,
  clubs: string[]
}