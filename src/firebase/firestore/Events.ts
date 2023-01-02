import {
  collection,
  doc,
  DocumentData,
  DocumentSnapshot,
  getDoc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { EventType } from "../../../types";
import { firedb } from "../config";

export const retrieveClubEventsQuery = async (clubId: string) => {
  //   console.log("i came in firebase folder too");
  const q = query(
    collection(firedb, "clubs/" + clubId + "/EVENTS"),
    orderBy("startDate", "desc")
  );
  return await getDocs(q)
    .then((snap) => {
      const eventsList: EventType[] = [];
      snap.forEach((s) => {
        eventsList.push({
          id: s.id,
          startDate: s.data().startDate.toDate(),
          endDate: s.data().endDate.toDate(),
          ...s.data(),
        } as EventType);
        console.log(eventsList);
      });
      return eventsList;
    })
    .catch((err) => {
      //   console.log(err);
      return err.message as string;
    });
};

export const addAttendanceQuery = async (
  clubId: string,
  eventId: string,
  UIDs: string[]
) => {
  // const batch = writeBatch(firedb);
  // const studentRef = doc(firedb, "STUDENTS", studentID)
  console.log({ clubId, UIDs, eventId });
  const eventRef = doc(firedb, "clubs", clubId, "EVENTS", eventId);
  try {
    const newAttendance = await runTransaction(firedb, async (transacton) => {
      // clubs->event document - read
      const eventDoc = await transacton.get(eventRef);
      console.log(eventDoc.data());
      const eventAttendance: Record<string, boolean> = {
        ...eventDoc.data().attendance,
      };
      console.log({ eventDoc });
      const studentSnapshots: DocumentSnapshot<DocumentData>[] = [];
      // student document - read
      for (const studentId of UIDs) {
        const studentRef = doc(firedb, "STUDENTS", studentId);
        const studentDoc = await transacton.get(studentRef);
        console.log({ studentDoc });
        studentSnapshots.push(studentDoc);
      }
      for (const studentDoc of studentSnapshots) {
        // clubs->event->attendance - write
        eventAttendance[studentDoc.id] = true;

        // student document - write
        let studentAttendance = {};
        if (studentDoc.exists()) {
          studentAttendance = {
            ...studentDoc.data().attendance,
          };
          studentAttendance[clubId] = {
            [eventId]: true,
            ...studentAttendance[clubId],
          };
        } else {
          studentAttendance[clubId] = {
            [eventId]: true,
          };
        }
        transacton.set(studentDoc.ref, {
          attendance: studentAttendance,
          ...studentDoc.data(),
        });
      }
      console.log(eventDoc.data());
      console.log({ eventAttendance });
      transacton.update(eventRef, {
        attendance: eventAttendance as Record<string, boolean>,
      });
      return eventAttendance;
    });
    // const newAttendance = {}
    // const eventData = getDoc(firedb, eventRef)
    // await setDoc(collection(firedb,eventRef) ,{

    // })
    console.log({ newAttendance });
    return {
      newAttendance,
    };
  } catch (e) {
    console.log(e);
    return {
      error: e,
    };
  }
};

interface displayAttendanceType {
  club: string;
  event: string;
  from: Date;
  to: Date;
  activityHours: number;
  email: string;
}

export const getStudentEvents = async (studentId: string) => {
  const studentRef = doc(firedb, "STUDENTS/" + studentId);
  const studentDoc = await getDoc(studentRef);
  const attendance = studentDoc.data().attendance;
  const displayAttendance: displayAttendanceType[] = [];
  const ObjectAttendance = Object.entries(attendance);
  console.log(ObjectAttendance);
  for (const [clubId, value] of Object.entries(attendance)) {
    for (const eventId of Object.keys(value)) {
      const clubRef = doc(firedb, "clubs", clubId);
      const clubDetails = (await getDoc(clubRef)).data();
      const eventRef = doc(firedb, "clubs", clubId, "EVENTS", eventId);
      const eventDetails = (await getDoc(eventRef)).data();
      displayAttendance.push({
        club: clubDetails.name,
        email: clubDetails.email,
        event: eventDetails.name,
        activityHours: eventDetails.activityHours,
        from: eventDetails.startDate,
        to: eventDetails.endDate,
      });
    }
  }
  console.log(displayAttendance);
};
