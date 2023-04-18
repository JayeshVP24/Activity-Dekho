import { Timestamp } from "firebase/firestore";
import { DateFilters } from "./enums";

export const getFilteredDates = (dateFilter: DateFilters) => {
  let fromDate: Date, toDate: Date;
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  if (dateFilter.includes(DateFilters.currentSem)) {
    // console.log("current sem");
    if (currentMonth < 7) {
      // even sem
      fromDate = new Date(`${currentYear}-01-01`);
      toDate = new Date(`${currentYear}-06-30`);
    } else if (currentMonth >= 7) {
      // odd sem
      fromDate = new Date(`${currentYear}-07-01`);
      toDate = new Date(`${currentYear}-12-31`);
    }
  }
  if (dateFilter.includes(DateFilters.lastSem)) {
    // console.log("last sem");
    if (currentMonth < 7) {
      //current sem is even sem
      // odd sem is last sem which is last year
      fromDate = new Date(`${currentYear - 1}-07-01`);
      toDate = new Date(`${currentYear - 1}-12-31`);
    } else if (currentMonth >= 7) {
      //current sem is odd sem
      // even sem is last sem which is this year
      fromDate = new Date(`${currentYear}-01-01`);
      toDate = new Date(`${currentYear}-06-30`);
    }
  }
  if (dateFilter.includes(DateFilters.currentYear)) {
    fromDate = new Date(`${currentYear - 1}-07-01`);
    toDate = new Date(`${currentYear}-06-30`);
  }
  if (dateFilter.includes(DateFilters.lastYear)) {
    fromDate = new Date(`${currentYear - 2}-07-01`);
    toDate = new Date(`${currentYear - 1}-06-30`);
  }
  return { fromDate: Timestamp.fromDate(fromDate), toDate: Timestamp.fromDate(toDate) };
};

