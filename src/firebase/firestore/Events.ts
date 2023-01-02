import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { EventType } from "../../../types";
import { firedb } from "../config";

export const retrieveClubEventsQuery = async (clubId: string) => {
//   console.log("i came in firebase folder too");
const q =  query(collection(firedb, "clubs/" + clubId + "/EVENTS"), orderBy("startDate", "desc"))
return await  getDocs(q)
    .then((snap) =>
      {
          const eventsList: EventType[] = [];
        snap.forEach((s) => {
        eventsList.push({
          id: s.id,
          startDate: s.data().startDate.toDate(),
          endDate: s.data().endDate.toDate(),
          ...s.data(),
        } as EventType);
        console.log(eventsList);
    })
    return eventsList;
    }
    )
    .catch((err) => {
    //   console.log(err);
      return err.message as string;
    });
};

export const addAttendanceQuery = (UIDs: string[], event:EventType) => {
    
}