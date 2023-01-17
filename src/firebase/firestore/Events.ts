import {
  addDoc,
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
  Timestamp,
  where,
  writeBatch,
} from "firebase/firestore";
import { EventType } from "../../../types";
import { firedb } from "../config";
import XLSX from "xlsx";
import { saveAs } from "file-saver";

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
        // console.log(eventsList);
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
  console.log({ clubId, eventId });
  const eventRef = doc(firedb, "clubs", clubId, "EVENTS", eventId);
  try {
    const newAttendance = await runTransaction(firedb, async (transacton) => {
      // clubs->event document - read
      const eventDoc = await transacton.get(eventRef);
      // console.log(eventDoc.data());
      const eventAttendance: Record<string, boolean> = {
        ...eventDoc.data().attendance,
      };
      // console.log({ eventDoc });
      const studentSnapshots: DocumentSnapshot<DocumentData>[] = [];
      // student document - read
      // const studentSnapshots =  await getDocs(query(collection(firedb, "STUDENTS"),
      // where("Document ID", "in", UIDs)))
      for (const studentId of UIDs) {
        const studentRef = doc(firedb, "STUDENTS", studentId);
        const studentDoc = await transacton.get(studentRef);
        // console.log({ studentDoc });
        studentSnapshots.push(studentDoc);
      }
      // console.log(studentSnapshots);
      // for (const studentDoc of studentSnapshots) {
      for (const studentId of UIDs) {
        // clubs->event->attendance - write
        eventAttendance[studentId] = true;
        const studentDoc = studentSnapshots.find((s) => s.id === studentId);
        // student document - write
        let studentAttendance = {};
        // console.log(studentDoc);
        console.log("student attendance: ", studentDoc.data().attendance)
        console.log("student club attendance: ", studentDoc.data().attendance[clubId])
        if (studentDoc.exists()) {
          console.log("student exists")
          studentAttendance = {
            [clubId]: {
              ...studentDoc.data().attendance[clubId],
            },
            ...studentDoc.data().attendance,
          };
          studentAttendance[clubId][eventId] = true

          // studentAttendance[clubId] = {
          //   [eventId]: true,
          //   ...studentAttendance[clubId],
          // };
          transacton.update(studentDoc.ref, {
            attendance: studentAttendance,
          });
        } else {
          console.log("student doesn't exists")
          studentAttendance = {
            [clubId]: {
              [eventId]: true,
            },
          };
          const newStudentRef = doc(firedb, "STUDENTS", studentId);
          transacton.set(newStudentRef, {
            attendance: studentAttendance,
          });
        }
        console.log( "after adding new", studentAttendance)
      }
      // console.log(eventDoc.data());
      // console.log({ eventAttendance });
      transacton.update(eventRef, {
        attendance: eventAttendance as Record<string, boolean>,
      });
      return eventAttendance;
    });
    // const newAttendance = {}
    // const eventData = getDoc(firedb, eventRef)
    // await setDoc(collection(firedb,eventRef) ,{

    // })
    // console.log({ newAttendance });
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

export interface displayAttendanceType {
  club: string;
  event: string;
  from: string;
  to: string;
  activityHours: number;
  email: string;
}

export const getStudentEvents = async (studentId: string) => {
  try {
    const studentRef = doc(firedb, "STUDENTS", studentId);
    console.log("studentId in firestore query: ", studentId)
    const studentDoc = await getDoc(doc(firedb, "STUDENTS", studentId));
    const attendance = studentDoc.data().attendance;
    const displayAttendance: displayAttendanceType[] = [];
    const ObjectAttendance = Object.entries(attendance);
    console.log(ObjectAttendance);
    for (const [clubId, value] of Object.entries(attendance)) {
      for (const eventId of Object.keys(value)) {
        const clubRef = doc(firedb, "clubs", clubId);
        const clubDetails = (await getDoc(clubRef)).data();
        const eventRef = doc(firedb, "clubs", clubId, "EVENTS", eventId);
        // @ts-ignore
        const eventDetails: EventType = (await getDoc(eventRef)).data();
        displayAttendance.push({
          club: clubDetails.name,
          email: clubDetails.email,
          event: eventDetails.name,
          activityHours: eventDetails.activityHours,
          from: eventDetails.startDate.toDate().toLocaleDateString(),
          to: eventDetails.endDate.toDate().toLocaleDateString(),
        });
      }
    }
    console.log(displayAttendance);
    return {displayAttendance};
  } catch (e) {
    return {
      error: e,
    };
  }
};

export const saveExcel = (
  studentId: string,
  displayAttendance: displayAttendanceType[]
) => {
  const EXCEL_TYPE =
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
  const EXCEL_EXTENSION = ".xlsx";
  const worksheet = XLSX.utils.json_to_sheet(displayAttendance);
  const workbook = {
    Sheets: {
      data: worksheet,
    },
    SheetNames: ["data"],
  };
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

  const data = new Blob([excelBuffer], { type: EXCEL_TYPE });
  console.log(data);
  saveAs(data, studentId + ".xlsx");
};

export const addEventToDBQuery = async (
  clubId: string,
  newEvent: EventType
) => {
  try {
    console.log("Im in firestore folder");
    console.log(newEvent);
    const newEventRef = await addDoc(
      collection(firedb, "clubs", clubId, "EVENTS"),
      newEvent
    );
    console.log(newEventRef.id);
    return {
      successful: true,
    };
  } catch (e) {
    error: e;
  }
};
