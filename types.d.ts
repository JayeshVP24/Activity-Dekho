import { Timestamp } from "firebase/firestore";
import { Attendee, EventScope } from "./enums";

export interface ClubType {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
  Events?: EventType[];
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
  id?: string;
  attendance: Record<Record<string, Attendee>>
}

export interface AttendanceViewType {
  id: string,
  attendee: Attendee
}