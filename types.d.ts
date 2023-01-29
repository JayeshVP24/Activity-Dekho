import { Timestamp } from "firebase/firestore";
import { Attendee, EventScope } from "./enums";

export interface ClubType {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
  Events?: EventType[];
  Students?: StudentType[];
}

export interface EventType {
  id?: string;
  name: string;
  startDate: Timestamp;
  endDate: Timestamp;
  attendance?: Record<string, Attendee>;
  activityHours: number;
  scope?: EventScope
}

export interface ClubStudentType {
  id: string;
  events: string[];
}

export interface StudentType {
  id: string;
  clubs: string[];
}

export interface AttendanceViewType {
  id: string,
  attendee: Attendee
}