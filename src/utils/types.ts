import { Timestamp } from "firebase/firestore";
import { Attendee, EventScope } from "./enums";
import {z} from "zod"
export interface ClubType {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
  Events?: EventType[];
}

// export interface EventType {
//   id?: string;
//   name: string;
//   startDate: Timestamp;
//   endDate: Timestamp;
//   attendance?: Record<string, Attendee>;
//   activityHours: number;
//   scope?: EventScope
// }

const AttendeeSchema = z.enum(["PARTICIPANT", "ORGANIZER", "VOLUNTEER"])
export type AttendeeZod = z.infer<typeof AttendeeSchema>

const EventScopeSchema = z.enum(["INSTITUTE", "DEPARTMENT"])
export type EventScopeZod = z.infer<typeof EventScopeSchema>

export const EventSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  startDate: z.custom<Timestamp>(),
  endDate: z.custom<Timestamp>(),
  attendance: z.record(AttendeeSchema).optional(),
  activityHours: z.number().min(0, {message: "Activity hours cannot be negative."}),
  scope: EventScopeSchema.optional()
}).refine(data => data.startDate.toDate() < data.endDate.toDate(), {message: "Event can't end before it is started! Please Check dates."})

export type EventType = z.infer<typeof EventSchema>

export interface ClubStudentType {
  id: string;
  events: string[];
}

export interface StudentType {
  id?: string;
  attendance: Record<string, Record<string, AttendeeZod>>
}

export interface AttendanceViewType {
  id: string,
  attendee: AttendeeZod
}

