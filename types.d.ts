export interface ClubType {
    id: string;
    name: string;
    email: string;
    photoUrl?: string;
    Events?: EventType[]
    Students?: StudentType[]
  }

export interface EventType {
  id: string,
  name: string,
  startDate: Date,
  endDate: Date,
  attendance: Set<string>
}

export interface ClubStudentType {
  id: string,
  events: Set<string>
}

export interface StudentType {
  id: string,
  clubs: Set<string>
}