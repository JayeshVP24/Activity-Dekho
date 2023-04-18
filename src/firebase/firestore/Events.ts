import {
  addDoc,
  collection,
  deleteDoc,
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
import {
  AttendanceViewType,
  AttendeeZod,
  EventScopeZod,
  EventType,
  StudentType,
  EventSchema,
} from "../../utils/types";
import { firedb } from "../config";
import XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Attendee, DateFilters, EventScope } from "../../utils/enums";
import { getFilteredDates } from "../../utils/utils";
import jsPDF from "jspdf";
// import html2pdf from "html2pdf"

export const retrieveClubEventsQuery = async (
  clubId: string,
  dateFilter: {
    fromDate?: Timestamp;
    toDate?: Timestamp;
  }
) => {
  // console.log("i came in firebase folder too");
  // // console.log("retreiving events of club: ", clubId)
  // console.log({ dateFilter });
  // // console.log({fromDate, toDate})
  // const { fromDate, toDate } = getFilteredDates(dateFilter);
  // // console.log({fromDate, toDate})
  if (!dateFilter.fromDate || !dateFilter.toDate) {
    dateFilter = getFilteredDates(DateFilters.currentYear);
    // fromDate = dates.fromDate;
    // toDate = dates.toDate;
  }
  const q = query(
    collection(firedb, "clubs/" + clubId + "/EVENTS"),
    where("startDate", ">=", dateFilter.fromDate),
    where("startDate", "<=", dateFilter.toDate),
    orderBy("startDate", "desc")
  );
  return await getDocs(q)
    .then((snap) => {
      // console.log("in the query");

      const eventsList: EventType[] = [];
      snap.forEach((s) => {
        eventsList.push({
          id: s.id,
          startDate: s.data().startDate.toDate(),
          endDate: s.data().endDate.toDate(),
          ...s.data(),
        } as EventType);
      });
      // console.log("events list: ", eventsList);
      return eventsList;
    })
    .catch((err) => {
      // console.log("some error occured");

      return err.message as string;
    });
};

export const addAttendanceQuery = async (
  clubId: string,
  eventId: string,
  data: {
    participants: string[];
    organizers: string[];
    volunteers: string[];
  }
) => {
  // const batch = writeBatch(firedb);
  // const studentRef = doc(firedb, "STUDENTS", studentID)
  // console.log({ clubId, eventId });
  const eventRef = doc(firedb, "clubs", clubId, "EVENTS", eventId);
  // try {
    const newAttendance = await runTransaction(firedb, async (transacton) => {
      // clubs->event document - read
      const eventDoc = await transacton.get(eventRef);
      // // console.log(eventDoc.data());
      const eventAttendance: Record<string, string> = {
        ...eventDoc.data().attendance,
      };
      // // console.log({ eventDoc });
      const studentSnapshots: DocumentSnapshot<DocumentData>[] = [];
      // student document - read
      // const studentSnapshots =  await getDocs(query(collection(firedb, "STUDENTS"),
      // where("Document ID", "in", UIDs)))
      for (const studentId of data.participants) {
        const studentRef = doc(firedb, "STUDENTS", studentId);
        const studentDoc = await transacton.get(studentRef);
        // // console.log({ studentDoc });
        studentSnapshots.push(studentDoc);
      }
      // // console.log(studentSnapshots);
      // for (const studentDoc of studentSnapshots) {
      for (const studentId of data.participants) {
        // clubs->event->attendance - write
        // eventAttendance[studentId] = data.coordinators.includes(studentId)
        //   ? Attendee.coordinator
        //   : data.volunteers.includes(studentId)
        //   ? Attendee.volunteer
        //   : Attendee.participant;
        if (data.organizers.includes(studentId)) {
          eventAttendance[studentId] = Attendee.organizer;
        } else if (data.volunteers.includes(studentId)) {
          eventAttendance[studentId] = Attendee.volunteer;
        } else {
          eventAttendance[studentId] = Attendee.participant;
        }
        // eventAttendance[studentId] = ;
        const studentDoc = studentSnapshots.find((s) => s.id === studentId);
        // student document - write
        let studentAttendance = {};
        // let coordinatorAttendance = {};
        // // console.log(studentDoc);
        // // console.log("student attendance: ", studentDoc.data().attendance);
        // // console.log(
        //   "student club attendance: ",
        //   studentDoc.data().attendance[clubId]
        // );

        if (studentDoc.exists()) {
          // console.log("student exists");
          studentAttendance = {
            [clubId]: {
              ...studentDoc.data().attendance[clubId],
            },
            ...studentDoc.data().attendance,
          };
          // studentAttendance[clubId][eventId] = data.coordinators.includes(studentId)
          // ? Attendee.coordinator
          // : data.volunteers.includes(studentId)
          // ? Attendee.volunteer
          // : Attendee.participant;
          if (data.organizers.includes(studentId)) {
            // console.log("student is coordinator");
            studentAttendance[clubId][eventId] = Attendee.organizer;
          } else if (data.volunteers.includes(studentId)) {
            // console.log("student is volunteer");
            studentAttendance[clubId][eventId] = Attendee.volunteer;
          } else {
            // console.log("student is participant");
            studentAttendance[clubId][eventId] = Attendee.participant;
          }
          // if(data.coordinators.includes(studentId)) {
          //   coordinatorAttendance = {
          //     ...studentDoc.data().coordinatorAttendance,
          //     [clubId]: {
          //       ...studentDoc.data().coordinatorAttendance[clubId],
          //       [eventId]: true,
          //     },
          //   }
          // }

          // studentAttendance[clubId] = {
          //   [eventId]: true,
          //   ...studentAttendance[clubId],
          // };
          transacton.update(studentDoc.ref, {
            attendance: studentAttendance,
          });
        } else {
          // console.log("student doesn't exists");
          studentAttendance = {
            [clubId]: {
              [eventId]: Attendee.participant,
            },
          };
          if (data.organizers.includes(studentId)) {
            studentAttendance[clubId][eventId] = Attendee.organizer;
          } else if (data.volunteers.includes(studentId)) {
            studentAttendance[clubId][eventId] = Attendee.volunteer;
          }
          const newStudentRef = doc(firedb, "STUDENTS", studentId);
          transacton.set(newStudentRef, {
            attendance: studentAttendance,
          });
        }
        // console.log("after adding new", studentAttendance);
      }
      // // console.log(eventDoc.data());
      // // console.log({ eventAttendance });
      transacton.update(eventRef, {
        attendance: eventAttendance as Record<string, string>,
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
  // } catch (e) {
  //   // console.log("firebase query error: ", e);
  //   return {
  //     error: e,
  //   };
  // }
};

export interface displayAttendanceType {
  club: string;
  event: string;
  from: string;
  to: string;
  "Activity Hours": number;
  email: string;
  title: AttendeeZod;
  scope: EventScopeZod;
  "Extra Hours": number;
  "Total Hours": number;
}

export const getStudentEvents = async (studentId: string) => {
  try {
    const studentRef = doc(firedb, "STUDENTS", studentId);
    // console.log("studentId in firestore query: ", studentId);
    const studentDoc = await getDoc(doc(firedb, "STUDENTS", studentId));
    const attendance: Record<
      string,
      Record<string, Attendee>
    > = studentDoc.data().attendance;
    const displayAttendance: displayAttendanceType[] = [];
    const ObjectAttendance = Object.entries(attendance);
    // console.log(ObjectAttendance);
    for (const [clubId, value] of Object.entries(attendance)) {
      for (const [eventId, attendeeType] of Object.entries(value)) {
        const clubRef = doc(firedb, "clubs", clubId);
        const clubDetails = (await getDoc(clubRef)).data();
        const eventRef = doc(firedb, "clubs", clubId, "EVENTS", eventId);
        // @ts-ignore
        const eventDetails: EventType = (await getDoc(eventRef)).data();
        let extraHours: number = 0;
        if (attendeeType === Attendee.organizer) {
          if (eventDetails.scope === EventScope.department) {
            extraHours = 6;
          } else if (eventDetails.scope === EventScope.institute) {
            extraHours = 8;
          }
        } else if (attendeeType === Attendee.volunteer) {
          if (eventDetails.scope === EventScope.department) {
            extraHours = 4;
          } else if (eventDetails.scope === EventScope.institute) {
            extraHours = 6;
          }
        }
        displayAttendance.push({
          club: clubDetails.name,
          email: clubDetails.email,
          event: eventDetails.name,
          "Activity Hours": eventDetails.activityHours,
          scope: eventDetails.scope,
          title: attendeeType,
          "Extra Hours": extraHours,
          "Total Hours":
            Number(eventDetails.activityHours) + Number(extraHours),
          from: eventDetails.startDate.toDate().toLocaleDateString(),
          to: eventDetails.endDate.toDate().toLocaleDateString(),
        });
      }
    }
    // console.log(displayAttendance);
    return { displayAttendance };
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
  let allTotal = 0
  displayAttendance.forEach((data) => {
    allTotal += data["Total Hours"]
  })
  // const workbook = {
  //   Sheets: {
  //     data: worksheet,
  //   },
  //   SheetNames: ["data"],
  // };
  /* calculate column width */
  // const max_width = displayAttendance.reduce((w, r) => Math.max(w, r["Activity Hours"].length), 10);
  // worksheet["!cols"] = [ { wch: max_width } ];
  const html = XLSX.utils.sheet_to_html(worksheet, { id: "myTable" });
  // console.log(html);
  const styles = `  
    <style>
      table {
        border-collapse: collapse;
      }
      td {
        border: 1px solid black;
        padding: 5px;
      }
      td[data-t="n"] {
        mso-number-format: "0.00";
      }
      td[data-t="s"] {
        mso-number-format: "@";
      } 
      h1 {
        font-size: 2rem;
        font-weight: 900;
      }
      h2 {
        font-size: 1.5rem;
        font-weight: 700;
        margin-bottom: 2rem;
      }
      h3 {
        font-size: 1.5rem;
        font-weight: 700;
      }
      tr:nth-child(1) {
        font-weight: bold;
      }
      #rule {
        font-size: 1.2rem;
        font-style: italic
      }
    </style>`;
  const header = `
    <div>
      <h1>Activity Attendance of ${studentId}</h1>
      <h2>Genearted by <a href="https://activitydekho.jayeshvp24.dev/" > Activity Dekho</a></h2>
    </div>
    `;
  const footer = `
    <div>
      <h3>Total Hours completed: ${allTotal} </h3>
      <h3>Total Activity Points Achieved: ${Math.round(allTotal/4)} </h3>
      <span id="rule" >4 Hours == 1 Activity Point</span>
    </div>
  `

  const doc = new jsPDF();
  doc.html(header + html + footer + styles, {
    callback: (d) => {
      d.save(studentId + ".pdf");
    },
    x: 10,
    y: 10,
    width: 170, //target width in the PDF document
    windowWidth: 800, //window width in CSS pixels
  });

  // doc.save("table.pdf")

  // html2pdf().from(html).save("table.pdf")

  // const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  // const data = new Blob([excelBuffer], { type: EXCEL_TYPE });
  // // const data = new Blob([excelBuffer], { type: "EXCEL_TYPE" });
  // // console.log(data);
  // saveAs(data, studentId + ".xlsx");
};

export const addEventToDBQuery = async (
  clubId: string,
  newEvent: EventType
) => {
  return new Promise<{ successfull: boolean }>(async (resolve, reject) => {
    try {
      // parse zod schema
      try {
        EventSchema.parse(newEvent);
      } catch (e) {
        // console.log(e);
        return reject({ error: e.issues[0].message as string });
      }
      // return reject({error: "error"})

      // console.log("Im in firestore folder");
      // console.log(newEvent);
      const newEventRef = await addDoc(
        collection(firedb, "clubs", clubId, "EVENTS"),
        newEvent
      );
      // console.log(newEventRef.id);
      return resolve({
        successfull: true,
      });
    } catch (e) {
      return reject({ error: e.message as string });
    }
  });
};
export const editEventOnDBQuery = async (
  clubId: string,
  editedEvent: EventType
) => {
  return new Promise<{ successfull: boolean }>(async (resolve, reject) => {
    try {
      // parse zod schema
      try {
        EventSchema.parse(editedEvent);
      } catch (e) {
        // console.log(e);
        return reject({ error: e.issues[0].message as string });
      }

      // console.log("Im in firestore folder");
      // console.log(editedEvent);
      const newEventRef = await setDoc(
        doc(firedb, "clubs", clubId, "EVENTS", editedEvent.id),
        editedEvent,
        {
          merge: true,
        }
      );
      // console.log(newEventRef);
      return resolve({
        successfull: true,
      });
    } catch (e) {
      reject({ error: e.message as string });
    }
  });
};
// export const deleteEventOnDBQuery1 = async (
//   clubId: string,
//   deleteEventId: string,
//   studentsList: AttendanceViewType[]
// ) => {
//   return new Promise<{ successfull: boolean }>(async (resolve, reject) => {
//     try {
//       // console.log("Im in firestore folder");
//       // console.log(deleteEventId);
//       await deleteDoc(doc(firedb, "clubs", clubId, "EVENTS", deleteEventId));
//       // // console.log(newEventRef);
//       return resolve({
//         successfull: true,
//       });
//     } catch (e) {
//       // console.log(e);
//       reject({ error: e.message as string });
//     }
//   });
// };

export const deleteEventOnDBQuery = async (
  clubId: string,
  deleteEventId: string,
  studentsList: AttendanceViewType[]
) => {
  return new Promise<{ successfull: boolean }>(async (resolve, reject) => {
    try {
      await runTransaction(firedb, async (transaction) => {
        const students: StudentType[] = [];
        // reject({ error: "error" });
        // console.log({ clubId, deleteEventId, studentsList });
        for (const student of studentsList) {
          const studentRef = doc(firedb, "STUDENTS", student.id);
          students.push({
            id: student.id,
            ...((await transaction.get(studentRef)).data() as StudentType),
          });
        }
        for (const student of students) {
          // console.log("student id: ", student.id);
          // console.log("student before delete: ", student.attendance[clubId]);
          delete student.attendance[clubId][deleteEventId];
          // console.log("student after delete: ", student.attendance[clubId]);
          transaction.set(doc(firedb, "STUDENTS", student.id), student);
        }
        const docRef = doc(firedb, "clubs", clubId, "EVENTS", deleteEventId);
        transaction.delete(docRef);
        // for (const student of studentsList) {
        //   const studentRef = doc(firedb, "STUDENTS", student.id);
        //   const currentStudent = (
        //     await transaction.get(studentRef)
        //   ).data() as EventType;
        //   delete currentStudent.attendance[clubId][deleteEventId];
        //   transaction.set(studentRef, currentStudent);
        // }
      });
      resolve({
        successfull: true,
      });
    } catch (e) {
      // console.log("firebase query error: ", e);
      // throw new Error(e.message)
      reject({
        error: e.message as string,
      });
    }
  });
};

export const deleteAttendeeOnDBQuery = async (
  clubId: string,
  deleteEvent: EventType,
  deleteAttendeeId: string
) => {
  return new Promise<{ deleteAttendeeId: string }>(async (resolve, reject) => {
    try {
      await runTransaction(firedb, async (transaction) => {
        const student = (
          await transaction.get(doc(firedb, "STUDENTS", deleteAttendeeId))
        ).data() as StudentType;
        delete student.attendance[clubId][deleteEvent.id];

        // const event = (await transaction.get(doc(firedb, "clubs", clubId, "EVENTS", deleteEventId))).data() as EventType;
        delete deleteEvent.attendance[deleteAttendeeId];

        transaction.set(doc(firedb, "STUDENTS", deleteAttendeeId), student);
        transaction.set(
          doc(firedb, "clubs", clubId, "EVENTS", deleteEvent.id),
          deleteEvent
        );

        // console.log("Im in firestore folder");
        // console.log(deleteEvent.id);
        // // console.log(newEventRef);
      });
      resolve({
        deleteAttendeeId,
      });
    } catch (e) {
      // console.log(e);
      reject({ error: e.message as string });
    }
  });
};
export const editAttendeeOnDBQuery = async (
  clubId: string,
  editEvent: EventType,
  attendeeId: string,
  attendeeType: Attendee
) => {
  return new Promise<{ attendeeId: string; attendeeType: Attendee }>(
    async (resolve, reject) => {
      try {
        await runTransaction(firedb, async (transaction) => {
          // console.log({ attendeeId });
          const student = (
            await transaction.get(doc(firedb, "STUDENTS", attendeeId))
          ).data() as StudentType;
          student.attendance[clubId][editEvent.id] = attendeeType;

          // const event = (await transaction.get(doc(firedb, "clubs", clubId, "EVENTS", deleteEventId))).data() as EventType;
          // delete editEvent.attendance[attendeeId];
          editEvent.attendance[attendeeId] = attendeeType;
          // console.log({ clubId, editEvent });
          transaction.set(doc(firedb, "STUDENTS", attendeeId), student);
          transaction.set(
            doc(firedb, "clubs", clubId, "EVENTS", editEvent.id),
            editEvent
          );

          // console.log("Im in firestore folder");
          // console.log(editEvent.id);
          // // console.log(newEventRef);
        });
        resolve({
          attendeeId,
          attendeeType,
        });
      } catch (e) {
        // console.log(e);
        reject({ error: e.message as string });
      }
    }
  );
};

export const addAttendeeToDBQuery = async (
  clubId: string,
  editEvent: EventType,
  attendeeId: string,
  attendeeType: Attendee
) => {
  return new Promise<{ attendeeId: string; attendeeType: Attendee }>(
    async (resolve, reject) => {
      const regex=/^S1032\d{6}$/;
      if(attendeeId.match(regex)===null) reject({error:"Invalid Student ID"})
      try {
        await runTransaction(firedb, async (transaction) => {
          // console.log({ attendeeId });
          let student = (
            await transaction.get(doc(firedb, "STUDENTS", attendeeId))
          ).data() as StudentType | undefined;
          if (student === undefined) student = { attendance: { [clubId]: {} } };
          student.attendance[clubId][editEvent.id] = attendeeType;

          // const event = (await transaction.get(doc(firedb, "clubs", clubId, "EVENTS", deleteEventId))).data() as EventType;
          // delete editEvent.attendance[attendeeId];
          if (editEvent.attendance === undefined) editEvent.attendance = {};
          editEvent.attendance[attendeeId] = attendeeType;
          // console.log({ clubId, editEvent });
          transaction.set(doc(firedb, "STUDENTS", attendeeId), student);
          transaction.set(
            doc(firedb, "clubs", clubId, "EVENTS", editEvent.id),
            editEvent
          );

          // console.log("Im in firestore folder");
          // console.log(editEvent.id);
          // // console.log(newEventRef);
        });
        resolve({
          attendeeId,
          attendeeType,
        });
      } catch (e) {
        // console.log(e);
        reject({ error: e.message as string });
      }
    }
  );
};
