import { Timestamp } from "firebase/firestore";
import { createMachine, assign, sendParent, ActorRefFrom } from "xstate";
import { Attendee, DateFilters } from "../../enums";
import { AttendanceViewType, ClubType, EventType } from "../../types";
import { getFilteredDates } from "../../utils";

// interface newEventInterface {
//   name: string;
//   startDate: Date;
//   endDate: Date;
//   activityHours: number;
// }

export interface ClubEventContext {
  errorMsg?: string;
  events?: EventType[];
  // filteredEvents?: EventType[];
  currentEvent?: EventType;
  newEvent?: EventType;
  currentAttendee?: string;
  // modalAddEvent: boolean;
  // modalAddAttendance: boolean;
  alert?: string;
  currentAttendance?: AttendanceViewType[];
  // filteredAttendance?: AttendanceViewType[];
  // modalViewAttendance: boolean;
  loading: boolean;
  excelFileName?: string;
  excelAttendance?: {
    participants: string[];
    organizers: string[];
    volunteers: string[];
  };
  validExcel?: boolean;
  dateFilter?: {
    fromDate: Timestamp;
    toDate: Timestamp;
  };
}

type TFetch = {
  data:
    | {
        successfull: boolean;
      }
    | {
        error: string;
      };
};

type ClubEventServices = {
  retrieveClubEvents: {
    data: EventType[] | string;
  };
  retrieveAttendance: {
    data: Set<string> | string;
  };
  addEventToDB: {
    data: {
      successfull: boolean;
    };
  };
  verifyExcel: {
    data: boolean | string;
  };
  addAttendanceToDB: {
    data: {
      newAttendance: Record<string, Attendee>;
    };
  };
  // addOneAttendeeToDB: { data: EventType | string };
  // deleteOneAttendeeFromDB: { data: EventType | string };
  editEventOnDB: {
    data: {
      successfull: boolean;
    };
  };
  deleteEvent: {
    data: {
      successfull: boolean;
    };
  };
  deleteAttendee: {
    data: {
      deleteAttendeeId: string;
    };
  };
  editAttendee: {
    data: {
      attendeeId: string,
      attendeeType: Attendee
    }
  }
};

type ClubEventEvents =
  //   | { type: "CHECK_AUTH"; club: ClubType | undefined }
  | { type: "LOAD" }
  | { type: "ADD_EVENT" }
  | { type: "ADD_EVENT.SUBMIT"; newEvent: EventType }
  | { type: "ADD_ATTENDANCE"; currentEvent: EventType }
  | {
      type: "ADD_ATTENDANCE.UPLOAD_EXCEL";
      excelFileName: string;
      excelStringArray: {
        participants: string[];
        organizers: string[];
        volunteers: string[];
      };
    }
  | { type: "ADD_ATTENDANCE.SUBMIT" }
  | { type: "FILTER_EVENTS_LIST"; query: string }
  | {
      type: "EVENT_DATE_FILTER";
      dateFilters: {
        fromDate: Timestamp;
        toDate: Timestamp;
      };
    }
  // | { type: "EVENT_DATE_FILTER2"; fromDate: Timestamp; toDate: Timestamp }
  | { type: "VIEW_ATTENDANCE"; currentEvent: EventType }
  | {
      type: "FILTER_ATTENDANCE";
      query?: string;
      dateQuery?: {
        from: Date;
        to: Date;
      };
    }
  | { type: "CLOSE_VIEW_ATTENDANCE" }
  // | { type: "ADD_ONE_ATTENDEE" }
  // | { type: "ADD_ONE_ATTENDEE.SUBMIT"; attendee: string }
  // | { type: "DELETE_ATTENDEE" }
  // | { type: "DELETE_ATTENDEE.YES"; attendee: string }
  // | { type: "DELETE_ATTENDEE.NO" }
  | { type: "RETRIEVE_EVENTS.RETRY" }
  | { type: "ADD_ATTENDANCE.CLOSE" }
  | { type: "ADD_EVENT.CLOSE" }
  | { type: "CLEAR_CONTEXT" }
  | { type: "EDIT_EVENT"; currentEvent: EventType }
  | { type: "EDIT_EVENT.SUBMIT"; editedEvent: EventType }
  | { type: "EDIT_EVENT.CLOSE" }
  | { type: "DELETE_EVENT"; currentEvent: EventType }
  | { type: "DELETE_EVENT.SUBMIT"; deleteEventId: string }
  | { type: "DELETE_EVENT.CLOSE" }
  | { type: "DELETE_ATTENDEE"; currentAttendee: string }
  | { type: "DELETE_ATTENDEE.SUBMIT"; deleteAttendeeId: string }
  | { type: "DELETE_ATTENDEE.CLOSE" }
  | { type: "EDIT_ATTENDEE"; currentAttendee: string }
  | { type: "EDIT_ATTENDEE.SUBMIT"; attendeeId: string, attendeeType: Attendee }
  | { type: "EDIT_ATTENDEE.CLOSE" }
  | { type: "error.platform.addeventtoDB"; data: { error: string } }
  | { type: "error.platform.editeventonDB"; data: { error: string } }
  | { type: "error.platform.deleteevent"; data: { error: string } }
  | { type: "error.platform.deleteattendee"; data: { error: string } }
  | { type: "error.platform.addattendancetoDB"; data: { error: string } }
  | { type: "error.platform.editattendee"; data: { error: string } }
  | { type: "error.platform.retrieveclubevents"; data: { error: string } }
  | { type: "error.platform.verifyexcel"; data: { error: string } };
//   | { type: "done.invoke.retrieveclubevents", data: EventType[]}
//   | {type: "events.actions.checkAuthAndAddToContext", club: ClubType | undefined}
//   | {type: "events.actions.checkAuthAndAddToContext", club}
const ClubEventMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QFEBuYB2AXWA6AkgCIAyyAxAMIASyFA0gPoCCAqgCpUDaADALqKgADgHtYASyxjhGASAAeiALQBWAEyrcqgMzctANgAcARj3cjATlXKANCACeiIwdzKtWiwBZlHvVoDseqrcBgC+IbZomDgEJOTUtIysHJxG-EggIuKS0rIKCIq+Rrh+Wsp+yoG++h4etg4IRh7O+tx6JcH65soGfmER6Nh4AE5gWCOoYhhQkYNkENJguJOowgDWiyNjYmDoAMYANgCuAEY7UbA8aUKiElIy6XmKRgG4-h6q5loGytzmfh7mWr2RyqPS4T4VPyqcpmEptPogGbRTbjSbTAY4OYLJYYFbrXAo7Z7I6nDEXVKyTK3HIPJTQ7guPwlZRGIzubpqPR1JSNXAGHweVoGcyGIKqNkIpHDUaoqZSshgIZDYRDXCCfYAQywADMVQBbAkyolgA4nM6DS6Um7Ze6gR5+QG4Jx6NnGaFsv7chDihlqZTmbgsjwlNnKZSSsm4CBiWDqjV2NHypiEQgMZAANWQADk2Jb0lSbblEFousVWVCgiyDMYucCEIKGWyml8ano-l4I+cozG4wm5WSyMnU0w2Gxs4QmFmKMg89csnciwgerhA40DG49CyWqove8tK9VB4jGGtF4DKYRZ3Bt3Y5q++jzmR0-hkAB1Zij8eT6ezjLWhe0vk2h+K8BjqOouiHuubK7mGoFfE4PzmMKfihOEiKRtGt7xomSoqmQABKyBsARL6ZmmmY5gAyrgREkQAmr+BYAXaSh+MeuB6ACh7mCKXznl6pQMlCJbcIGoLIUe4boVKuBMBAEBIjed5ogAYvqg4phR2ZsLgVEsAAQgAsvguZ8Fa840qxCCuOYnHGKG3QBqyNh1mKrxHtWpR-NCWhXtE8mKRiuAagpiYYmwwiEAZWIYIsyxrIsoUQOaWBYFFBlMf+VnyI4-xOv4yGqN8lgApYXpOCBR6buKwrfO8-L+XggVKcl4VRJF0UKnhqpxjq+ohQpqXpdFWWWbauX1j8rxfGY5gWP4HynoJIEljUJb8m0LJGE1g0QEwaWYBAGoYLsixYb2aJGcIx37Jpw6flmE5TsguAsAACsQADyyZpgAGtOxBjdSE15C6jYiueyGfG2LpeuUGjvA1gqNG0vy7clB1YEdJ1nbg6BDGI2piPeyByGdd3zHFOJ4osBNE3YYDk2A+zA4WgGBB4nFGLoXQVNWrLmBVujNB4-jPI0nxOH5MmRpjh0YMdp104qRMk4mzN3Yqyq9Zq-VDAa9Paozmtsyxk1fBoIqCkGwoBm0XrGM4YFhmU3ANdLGMKVjOPK3taI+4ruNgJ1MVU-FuKJXtWrY0HysjZl5n5tloOIKCXPVE0gKWICXyufURWvKYPTeOKfiBjL-RdvLsdK3jbVTIHdchxl3U62qeu6gb0cK83CdmzleRMgy3DtN03HrkyXp6L4TptgENTcB8YZoVX14TGAADuAe98HlDfVRyAMM+b4fmOT3fjOSdziDi6KKCYJmK2vzqIY5Tw6ymifMKwb-LxrS7Q3tvRuu9lb3QYF9LMR8Rzn0IMgK+Vw-zjTvgCZwbtWiHl8GLIWdYwJFFBOeTw5d+KVwwl2IBO9a57zgaQMcZ9xzwIHqnfI3gigzy0EEMCvgZ6+C9N4fcpVjBlB8D5PQXtoxTC+nFJuYAwCxQjrTPaCwY5HVkf3a+SDb6ARUCWTi5dXbnh8OofOiB2IaAdKJNQTgrDu3EWiKRYAZFyO1iqDuWou4GmSso3uaiMpMLvkyZwgJ1ywycMhAIXpeJgn5MhSerQAS6F2gsJx6kDbgMgdAx6cDXr6WMqZfx2j+QgWzj8CozxvhuHhn8J0x4RHnnUPyDwu0Ur7FGJQ1Rcjw40yjrJFpbSQG11kQgBKuwtR3EuAU6yKhfjgjKFCNQhCxK1nqC2TQYEdAijKE4Iwqhmks36VAJxbdXF9Q8bgXp+zJADI6cMyOoybQTI0cxQeShLBFAWf6asq5yg4PqJufBbgWQ-F0Ds4IGMRj0WEIcKihwRhkBocRTJsD4G4HosgKikzJqKBFHZF0rZvDvEqDuOswK+Tp18A6LwHZZbVwhVCmFcKEV0JgQw16WYvqYvtNCYoIpQRQgMJBExU0ub22QmGVk7tUZhHQhgG6cBZBSgsloqZbITCcXdu8XibgvjIS9IodwYJ3jFUPMEUwYsAi7SIKQJV7MpmCjBOxFyYkvA83fnWJ4YFub-HUOxNoSNpJr2RDKHY7VBg2vNo8IMK5vBL2+FYascM3IcJXDzbBbYRE7RpdeAA4sINEkUqDCD1GAd6GoYDhpefkJkdknDmtKpYYwWg9VFFPOKBp2hTztiXs0nsKl+znArcwp4FQv721RrZRoQqhLFG0AGcSbZ+THh7dhUmPVB132CR5Vk1YvCjx5gYQSbhXjPFjRwnwRTdotQxOujm+4BYlHLi6HmVggT1CeO4PkfFDAmBdJufQl6FJKSwn2qAqS9Q3usgCMEa4vJVncKPIVigaivC-SeIIrbDwAaClEf2-bsChwg5NVkRR73+FaBKl98M56uu8MKQoXFzDiKbsHQjeQ3Aiq4quLO9s-B8K8E6Tk-CxILUzYGvANdfZ4wuiB66t1WOIH4bMil-oug+EMNPZNNVNxtlPGe3ZWbogSbjnjI26s5Sa3kwgXwGhW1iXKC6eaQqAyrXXK0QEw9DCkNkkZ5uuHDmgLOgR5OyDAILOKNpj4MJWRfAqjzaJx4OFhmhO0fTYn8bbGAf5qhytLP6uCHyJezI92UtfQpgMmgjy-FqRUDhqWyHXgblABxTjcs7NcOCMJm5WjapKI7bQfISiWEWhXCwSTpE+LAGB3L-pGwcLZGYMSahR6RKXk6GGNRQTitHns1pVyssdNawQ9VG2tVuDqnwtkeiuLzzMNqgN9XDN0uhbCsAuWF0dbFZPNQvGSVi3BFBY8-x56gkva0oYWBLPOZ5YUbOIoF56oaf9411Y-RzMY9KoAA */

  /** @xstate-layout N4IgpgJg5mDOIC5QFEBuYB2AXWA6AkgCIAyyAxAMIASyFA0gPoCCAqgCpUDaADALqKgADgHtYASyxjhGASAAeiALQBWAEyrcqgMzctANgAcARj3cjATlXKANCACeiIwdzKtWiwBZlHvVoDseqrcBgC+IbZomDgEJOTUtIysHJxG-EggIuKS0rIKCIq+Rrh+Wsp+yoG++h4etg4IRh7O+tx6JcH65soGfmER6Nh4AE5gWCOoYhhQkYNkENJguJOowgDWiyNjYmDoAMYANgCuAEY7UbA8aUKiElIy6XmKRgG4-h6q5loGytzmfh7mWr2RyqPS4T4VPyqcpmEptPogGbRTbjSbTAY4OYLJYYFbrXAo7Z7I6nDEXVKyTK3HIPJTQ7guPwlZRGIzubpqPR1JSNXAGHweVoGcyGIKqNkIpHDUaoqZSshgIZDYRDXCCfYAQywADMVQBbAkyolgA4nM6DS6Um7Ze6gR5+QG4Jx6NnGaFsv7chDihlqZTmbgsjwlNnKZSSsm4CBiWDqjV2NHypiEQgMZAANWQADk2Jb0lSbblEFousVWVCgiyDMYucCEIKGWyml8ano-l4I+cozG4wm5WSyMnU0w2Gxs4QmFmKMg89csnciwgerhA40DG49CyWqove8tK9VB4jGGtF4DKYRZ3Bt3Y5q++jzmR0-hkAB1Zij8eT6ezjLWhe0vk2h+K8BjqOouiHuubK7mGoFfE4PzmMKfihOEiKRtGt7xomSoqmQABKyBsARL6ZmmmY5gAyrgREkQAmr+BYAXaSh+MeuB6ACh7mCKXznl6pQMlCJbcIGoLIUe4boVKuBMBAEBIjed5ogAYvqg4phR2ZsLgVEsAAQgAsvguZ8Fa840qxCCuOYnHGKG3QBqyNh1mKrxHtWpR-NCWhXtE8mKRiuAagpiYYmwwiEAZWIYIsyxrIsoUQOaWBYFFBlMf+VnyI4-xOv4yGqN8lgApYXpOCBR6buKwrfO8-L+XggVKcl4VRJF0UKnhqpxjq+ohQpqXpdFWWWbauX1j8rxfGY5gWP4HynoJIEljUJb8m0LJGE1g0QEwaWYBAGoYLsixYb2aJGcIx37Jpw6flmE5TsguAsAACsQADyyZpgAGtOxBjdSE15C6jYiueyGfG2LpeuUGjvA1gqNG0vy7clB1YEdJ1nbg6BDGI2piPeyByGdd3zHFOJ4osBNE3YYDk2A+zA4WgGBB4nFGLoXQVNWrLmBVujNB4-jPI0nxOH5MmRpjh0YMdp104qRMk4mzN3Yqyq9Zq-VDAa9Paozmtsyxk1fBoIqCkGwoBm0XrGM4YFhmU3ANdLGMKVjOPK3taI+4ruNgJ1MVU-FuKJXtWrY0HysjZl5n5tloOIKCXPVE0gKWICXyufURWvKYPTeOKfiBjL-RdvLsdK3jbVTIHdchxl3U62qeu6gb0cK83CdmzleRMgy3DtN03HrkyXp6L4TptgENTcB8YZoVX14TGAADuAe98HlDfVRyAMM+b4fmOT3fjOSdziDi6KKCYJmK2vzqIY5Tw6ymifMKwb-LxrS7Q3tvRuu9lb3QYF9LMR8Rzn0IMgK+Vw-zjTvgCZwbtWiHl8GLIWdYwJFFBOeTw5d+KVwwl2IBO9a57zgaQMcZ9xzwIHqnfI3gigzy0EEMCvgZ6+C9N4fcpVjBlB8D5PQXtoxTC+nFJuYAwCxQjrTPaCwY5HVkf3a+SDb6ARUCWTi5dXbnh8OofOiB2IaAdKJNQTgrDu3EWiKRYAZFyO1iqDuWou4GmSso3uaiMpMLvkyZwgJ1ywycMhAIXpeJgn5MhSerQAS6F2gsJx6kDbgMgdAx6cDXr6WMqZfx2j+QgWzj8CozxvhuHhn8J0x4RHnnUPyDwu0Ur7FGJQ1Rcjw40yjrJFpbSQG11kQgBKuwtR3EuAU6yKhfjgjKFCNQhCxK1nqC2TQYEdAijKE4Iwqhmks36VAJxbdXF9Q8bgXp+zJADI6cMyOoybQTI0cxQeShLBFAWf6asq5yg4PqJufBbgWQ-F0Ds4IGMRj0WEIcKihwRhkBocRTJsD4G4HosgKikzJqKBFHZF0rZvDvEqDuOswK+Tp18A6LwHZZbVwhVCmFcKEV0JgQw16WYvqYvtNCYoIpQRQgMJBExU0ub22QmGVk7tUa7SYK0oYWAQqyqwF9bU2pBykAImZRBzzmFdFWnxdQFhAzlD8F6RQDpwQNPFjzVobhV5kOvDKxU8qNSKqkWQKibAvrvWYOqzVFktHWR5rPAV+hoRdA+LE01ZRwRslDMYHQWzzBhHQhgG6cBZBSn9ezKZsawSmBqBGtwXxkKmvcGCd4xVgzBHLsKXZNLrxEFIFm82jxBRgnYi5MSXgebvzrE8MC3N-jqHYm0JG0k17IhlDsdqgxm0vJYbyQMgpip+mrHDNyHCVw82wW2ERO163RAAOLCDRJFKgwg9RgHehqGAc7mFmvNU4MWDoeLFRgn2oop5xQNO0KedsS9mk9hUv2c4d677HjBBG1oqNbKNCFUJYo2gAziTbPyY8gHsKkx6mB7RwSPKsmrF4UePMDCCTcK8Z4S91yYKKdKhSSIcPWWDcYEo5cXQ8ysECeoTx3B8j4oYEwLpNz6Do0FKIykcJTFSXqRjk0ARgjXF5Ks7hR5CsUDUV4-GTxBC-YeUTrUwogewKHWTeRWRFAFqx6DHHvDwznj27wwpChcSTQevANdfZnVM8WU84IuKrizvbE1JKvBOk5PwsSC190Tvc97UBeMLrAagNdW63mbJi1mRS-0XQfCGGnpumqm42yng4e8cRTdg741VsTUmms0u+A0F+sS5QXTzSFQGVa65WiAmHoYUhskPNx3roZw58WW7RTSws4oRWPgwlZF8CqQa+THg4WGaE7Q60xfxtsYBo2qHKzS4oHQzsl7MmI5SrjiB-QMkPDzNrXgGubftdEBuUAHFOMOzs1wManM-CqP4LQjttB8hKJYRaFcLBJOkT4sA0nDvXYKuKHQ1q1Cj0iUvJ0MMC2bhZKPPZrSrl7Y6Z9ghnF3bvF4kWuqfC2R6K4vPMwRbx3Pfc3S6FsKwCHdQzGsVk81DBfqPwi1TRjz-HnqCaViq0soU049w1ZQKimoaRaytoJyk6cl06hVTrlXajS3zHlhRs4igXqaxoiMGlNFQmLHoXFNdyu13KqR+vQsljlwGBXyyeR2UsMVK1SzbVNOTUAA */

  /** @xstate-layout N4IgpgJg5mDOIC5QFEBuYB2AXWBiAwgDLICCASgPr4DyAcgCrIAa9A2gAwC6ioADgPawAlliH8MPEAA9EAWgCsAFkUA6AEzsAjAGY1mxQDZ2agwHZNAGhABPORvYrFADm1PTa3QE4Dn9u20AvgFWaJg4KgCSACLEuITUJFEc3EggAsKi4pIyCLKK2qpuxmrenvKapuyKVrYITmrqmvqmTlXySpr1QSHo2LAqAE5gWANCYKhCGFChfbgQ4mAqk6j8ANaLQyNj6ADGADYArgBG42GwyZLpImISqTmyFQYq2qaKJa7y7J6vntU2iJoTCpPNp5GY1KZPhVtGZuiAZuFNqNxpNpr0cHMFksMCt1oNhsjdocTujzpoUnxBNcsnc7JUVPJTKZQU1tJp5E55CYanJ9ConIZFOwDE5vPVjDo4Qj+kjtqjpbgwAMBvwBipeHsAIZYABmqoAtvitqd9sdTn0LqkrplbqB7qZfipOgYdE5AeZtN8eQg9A4ufJfOVFMydO0paSVBAhLANZrrPLSbhElEKMgAGrIBiWykZG7ZRCe+QqcwVNQacpON0Gb1Chw6ZyuZQ+V7ycNnSPR2PxqYK5MUEj0Ri0KIkWj4ZDZtJUm35hBNUwMkVqAUQpri+Q1+meepcxTeMzmTltvodmNa7tos64NMRZAAdX7g8zI7HE64l2nedpuTUbxU-i0ApXhcTwyxrEFi3aUwDDLNkAwqVtgnhCMozPOMEyvAAxCJCEYSh00zegAGUKEICIiLYd8rU-Gk7TkTxgW+ZwDHkGEITcZdvWXTR1EMUDPUBMx-EQnp21QrsMNmAiGAoEdGAobDcOQMhJ2tL86J-HQVBYjw2RKJQDHyP5aghBpf0ZIwXWcEFf2PcJxPPeVlVVXAyGQegyFvDNUwzBgiJUNyPIATVUmjbWkORmSeTxvDULlfE8TRPG9Fl-1Fdk3UUTQfGygw7P6EgIAgBEkyiFNpPoFQiGoIi3wpKdc1oiK520P1vjBDkORMbRtBSzkGSykEQXZJRFHylRCuK9FT0cqZMINUryt8yqiIAVQAIQAWQiSj6rUpqclYhiRVZdpRS0dkuOMZ4ssrUFvghQIkOlCaioRFRNSKySsHofgonWzEMEWZY1kWT6IHNLAsD+9bQsa8KcgqVQdAdepOVAvdQO9ToFyynTOm3JRlzG56I0m97we+37-sVZy1VjXUDQ+orIeh-64epBHEEUT5nlcLREpBdwQWMgsF09ZRPQFMxyk0cbwZIKHMAgTUMB2MBFsfIcX3HKr4lqjmZ2-Vri1XLxnHnD1vRg7QGVamK2SqGCYvlorFawZXVfV08JKmTb+BVvZNYHbXR111aAAV4kSVMmHHQhDfU5qXTrMUfFFGFvEsf4EEhBo3jeAUtEMSpPFdiB3c9tXFnQUYdSEC9kCkdWg-mIHsVxGulSEHVrDAZuwD2RODsQGDVBTwswUrJpkpzzR-CcG6XgqfRhpccvK4wFXq5UWue4b+UB6DpUVXprVGYGQ0997-uW+HrmEFcBpvCFINRV8MxvTdRedygqpuPXqTdsCslZby9mDL6UxN7b3VtTAGbdgY4lBszFWoCYHDBhvfWcJhVAwmUKKPcJR8icm9NuBoMJ2BuCJhUdgrEN5oPASg1E0DwFwNpqfdU589SXxQdqD2YDq5s1hlRHMnNZyckXixPcLRyjtC+LPWoLEeIcjZE0N4pR2T0P4egn2s0oBpk1HsIQxUj7ByfMOMOyAVBrS2jtLB34HrPHMB4F0BgCgBl6nPXKps3gVCKG4liWiq7ewcuhKYBijEmJbmY0Or4VCR2juVOOyAE4iIamIhx-UtAihFAJHJosEBDQZG6ecbgeb+HGhMMAAB3ZhDDq4EH1sgCgN57xa2fJY+xGlZBsieC6bKZQAwuAFBuHObgGImCcCxGWlYx6VLGLUqB9T1a4EUnhdpFjXxdOarIEwPE3EaFFL+QmrFvSQiLL+QERNgx+E9ONUJjdEzICiDtHyhFtn3AMsCMwBgWKcheHFGsehHBNCkZ8aCrFGTjWQFGLA70Hmon9oHXAzzXkhw6XEmx21dofnhrOWQ0Fx5Mi5DLPcGVrYuAZEjACLQiHQthSVVF9A3kMD1jVOquKMndPUcCQw+haHOyUFUFKZR-yGDcWUAoWUIQiWQu2GFIh3qQGuD2dEgNEGdxUMqj26JxDszSftB+Cg-DPESqxYwPNvhujOSbYUPNHhGB5k9JCGAA5wEkNKTlRtunz2uuozoTQIQug5N6HpJtYr8xJV1JQ41ojEC9Une4TrtJMUoTKnQn8c4EsXhZVqzIpnMlskAk8soUSqrOAmkeuQAwOD8EKSWQo3C-Oxv1aChkP75GFJ0EmokTwIvLX0StRqkqL2ZDFYUrECiVicCKhi7RtwS0MhbYU9zOx6OQHTId+LfiLwKGuEZ7BzCUJSj1Z4NDly6EMAKUw41yboi3d+Nx-I3TMkqP04wShQ2-ltoYFxZrZZaFvW9aaqE9HzUvg+jSwYeLfH5VQl0F7Q0jW+R4V988XBvCA1NMITCB0-RhpB5qTQeLT1fV2+ecUCkLmyvPSE1k3HZT3EEgR6tCM5B6qoF+tD9Dv2FKYb0SgizshMFZXwVRAG9vCCA7RjD+1QCRYYtjiAlC2zKG4yEMUDIimtrobSUafAFEvWoZjOjr4Hx7EfJTCADk3XsJCF0ZrSGHueC4YUvwmTCgk3Kk80ngkQKjEsmT1c4FWecA0dwJg9DLh0i8bGI6z3z1BdBeoiUTOybXWE-RhjjFNxboR6GvAATz1UGWN4T8QyGX4yAPYYAdRYEQKBReQ0xR7NeKCKwRx+BQ34PqIrXJ1C-g8PUCrwYrCjCgAAC3q3OcTwJPQtZdG16sIBakQCwBNgEGh-x+B27tvwTQrATbAEISb03nBWByI1ubMUlyLfyKM2oTQqgDbK8N3pwZ5k1LqUF1j1E8XGx4v4MwZWlHfEoQ9xAGngR+FljBDzVR6WKvvX9rlOyyiqH9SUoN5Kc7+kcHuXQDHdCMicIjuFIGMsXgU3sKzBLXjFnTrQmKYnOI536bykWwZCUlBvcW8ICryc4e1d9WnH9HAlADe6YNM6c4tBI7LQuApvC6CCEEIAA */

  /** @xstate-layout N4IgpgJg5mDOIC5QFEBuYB2AXWBiAwgDLICCASgPr4DyAcgCrIAa9A2gAwC6ioADgPawAlliH8MPEAA9EAWgCsAFkUA6AEzsAjAGY1mxQDZ2agwHZNAGhABPORvYrFADm1PTa3QE4Dn9u20AvgFWaJg4KgCSACLEuITUJFEc3EggAsKi4pIyCLKK2qpuxmrenvKapuyKVrYITmrqmvqmTlXySpr1QSHo2LAqAE5gWANCYKhCGFChfbgQ4mAqk6j8ANaLQyNj6ADGADYArgBG42GwyZLpImISqTmynZ4qni5qak6K7E71Rk41iE0ni8-F9PNp2J5vBDuiAZuFNqNxpNpr0cLgwAMBvwBipeHsAIZYABm2IAtoNhojdocTqjzlxLoJrlk7nJTJ5VJ0DDonJo1OZtJ5TP8EHoHPI1PJfOVFKZtDp2jC4f0IEJYHj8dZkcrcIkohRkAA1ZAMC6pK6ZW6gHLc7QqCVy7TyMw6UwtEWCzSODneeSCoyQsFKukqVXqglaqY6vUUEj0Ri0KIkWj4ZBmvhMy3ZRDaUzyRwggz5PNqRSlkWyu2S7lyjnaMxB4KwkNhjWRlFnXCGiLIADqsfjJqTKbTDPNmZu2dyfKe8r95X5PN58hFUqcKgFJblec8TWDZ1Darb2rpuCNJvoFCTjAoADEIoRGGR02kJyzrXZBSp6xpeS5FHy5Qiu8pgFvILjyFonwGPK+59Ie4aaienbIFEESXueppjhmGSTqyuQOioTR8longlOwBgmBWfhEQUbjmAx7JFnB4SthGyGzFEyDEDemFsNhr64e+0hyIovgqE4vgQqYlF8ny2iruJLiyeBkGaFomgsSqR7sVGmLYrgZDIPQZA9saBrGgwADKKhGSZACaL4WnhH65HKBjPN4krkbungeuUKigpo4H6JoPhhQYWkqCQEAQHCupRPqfEqEQ1BWaOKQ4cyVoiQgOjikKzqqT82gKTYOZOPmHRgmCwVKIoUUxXFqIIbpUC3mSCVJZZ9AqFZACqABCACy6FOW+OU5H6TwGLyCrgb4TQruVorGN+AHfE6Qr8oETbKtFsVwio+KxRxWD0PwUSDXMCxLBgKzrMdsWnNgWCXYN41CZNAKmJyuYvO8UqlpCagip0oEAQYEqPJVZYfI1h0tSdqpRqiF1Xei+k4hqxJkk9EAvVgb1XZ92VTookHfq4pGaGC7hgtUK25t+HL5C8hh5nue0hsjJBE5gED4hgOxgF1A4JsOqYpfE6Wk1m+G06B3IlNNeb0fWIpGHaQo7q0kpCroUW8-zGCC8LixsUhUzDfwgt7GLcYS8mUv9QACvEiQGkwqaEHLLm5b9DiVBTwXKEKYWM7ULhehCpbRxRBiUaYRuxXzWAC0LIsqOgoxEkI7bIFIIv2-MGCLMsayLDnQhEtYYBF2Aex+8JOR5vmTStABfLOLooMrcRoEabulEAfKxgpxAacZ+b2cYjX+fag39sYli2MErjAzktXtf18XzffQg5R2rKYVCm0ZE+CKkkQ3Tzo6M46lqBPU+m5nizI8iL9myL6PXaX5f3UrvjQk6dX7m2Jh9ASzkW45kovaNwFNILyHMP+MGVQHBh0qD4SiUpZTPxNt-d+p0phfzfr-TGq9cTrxJJvYBBC34QP3lOF4TwwomFLOwcwfpjAijlA4SUOh1LQ1mqVfBoDCEIWPFMQ0+I9hCDikvB2g5EzO2QH1Iao1+KZUEmTBWj8JItG+BUWmsoyhg1LPmQUpZT6UUovDbmB5jbiLfpItqMi5EKOLkop2I4VBuw9klb23EmF6OCvaCxOgORugosKfuWh1zA3lNgosHInBRQmGAAA7p-eh5sCAy2QBQbsfZxZDlUSE1yDxkFEV9OUMoZYu4GF4a4dQzhYZiUhFY9JYxskkNySLXAXEeKFMdkOZAGVGRfSnLTL0hgoYSiUN8KUs1zF5nUKUIx-gYIlCisgVUWB4qoXQhZC80s0oTPHFM-CshXCqD9HKYsfpKJgjKrUbhBj2QaRQX4J+Dj4J7JEEdS27YbZ2zPGhDCPV1EjTGlAiaU5ZCfIki8HB8lyjIM1mYWiTpeS+EqiYSKfzwgAoOS1SA1xUZhBumXO6D1FjkvTqicQJM4VXMqfc78yDgr+AqBTUqvD2D5gok4HwUoCh+DLLs-ZR0GVnQodiKhhIaHkgZYTZlkDtHQIPg8KoHkfxFi0O4fwXxNaVUCryioHhE7BV+T0A8URG7DDAPFIZxlCnJVSrLVlujKnvHXGYNwvp3A+CtZrXcREKafAhPNKGUUHV7CdUCnSVt2qdVdbxKFA0YVaMmT63KeQlAqG2boZQidzCGDBnyJWYkJQfB0InWCRL+jxsTS1AmCbRCUuwNSgBdLQyOvToTCp+axKzLCkoZ0grvC6BFC8iSjz62J35PIONA7nVtoHXKleCqcbKv7R2sAQ7vXy0qfKJ47koYFChpwyEkcAR6CVsYWmME7531XQer+h7BncTdaUxM4yzles1fC-CUNvzK3rEY5wWDzE6ECq0WaJYqiSmTk2lQLb06fotsm9sHVN7fuGX+riais2aOHTkSDEbo3RNrPkMGlQ7RqSFHrCoXwV1oYw2ALD+7hg5PEV+-+tKgHtqdSAgWh7yMVQ3BKUskaviK1+mDXMDQ9BQxMO4esMF31Ou4yJztUAsPyrXkqvGemwBidNhJ49-sprsntHmJ0nCBHLVqGFesRFZogSFC8Lk3Ssl8engMo5l5Rn-ouVlE9I724VG3LNbkdZzHht+vTCmKK4ZSpELpnDyI8OknBcc0LxHoVkeszA3IKGNwcjY1sqrTT+7zI3PrbZkkcEZawNx2VfT+Oi0ExXR6DKLMEzAJJ3I7moZgg8LVOsEJ6NYv0OUW0M5JQNTQySjr+yAuWdFtu4zG8VX7MG1Z4DbKovrgvhyRWxj6hgxDY1sERRNpaF2na-5+zDPBaIwBz14WdGRfuJKZ4Py8xiS0JN74YNnSqDLFV-kYkOm7SbBgW2cBJDKlzX9uQTQyzgZMJ8S1xq-grRueCZ4lFBTgTx5CKK0RiDo5s6JP0RahSfHqJzessTaiIvXMgmCnDXBmBLVFBE2wzrwEuXm+4UoHASqqPkFnMk6uubNQrkHRZwTcnsS91i2Wu04Dp2Vh4QoJK6FmljyiJQ5QekhPaNcIONBx04VFYF2osb6+1ak9aHcPiQXMCapmpVvysfeCW2aeC0NNThG7qcMEJK8m3BRJoxglAilkKWY+ZOPhunaBFBGzUwitRTblqP+ET7PHLV8PMysXAp7qqTjw251L-ltc2A8EekbEI7NgX+xfXLEVjxUXMCfH7J5WqBMK6lgctaSWJMRgWwA99yoYfMJ8fDByBj4V5iAycSV-GHbkMFcyz7AVnZ31tbayIXzaX6jgDV6Gz9Bywo+mjfl-JOkwSSj8SO3gvKMS9L+IBkgaA+F9HlAqDBD9FnRFUCgXFmmdF8CME0jQycTn3xk20IW73FwxwQFtHUHBAJQ+GWzvTyn5A8m8zFBkm+F-E-xcVPygHcXkULmLn-zyinUcFlFtDjxklcErXqGRTT3cnRUTj816QM36Xn0wPpwQHlGN0MTeHUi8l3A5wBEFS9DKHaA4Q0zzDa0jwkIN3kNUH1TxyNXBEJ1qFMUcEFBaDeD8CLHAm0LbR1ygFBQv10O1SKCLSlD4XgMkk4VXETmeEsIm0vXeEQK136BJRlQ2112YNkHgMcBKE6CaBIOClMIAN5AknKH0D9TEm2W03Th0Ii0kMRWUDYLLEBGChBkfyjjBA3HcDeCKm7g8DyPXXz1oKL1cIRWwVKL0BmSlDIiqPvTCQdAfRaDqTCmaKBU3WiI6OuUFCeAlBfVKh92jUgK9H5DeHZwqNLFQzCPQzXSw2YNk3nRCkqHrV91SLyjh0a0h38BKA2hW12M4yy0QlwzJEOLKCIkeBaDEn+k6Ah14PqKhkiQAhsOaN0ymNEO63eKAIpjjyexdAGLynqCeAhD8AlHu0tTawOJmPZQomeBMAu3DhQT7lc1S2uJeX1kVixIIUPVcULzeJxPzVKieEMGD0fmUA2Ih0MHUH1i2kDhN2pO6xUE60hPE3EMKINydC9G5VKmMC+BrT8n7iYnnWcC+DV0dEJSCCAA */
  createMachine(
    {
      predictableActionArguments: true,
      id: "Events",

      schema: {
        events: {} as ClubEventEvents,
        context: {} as ClubEventContext,
        services: {} as ClubEventServices,
      },

      context: {
        // modalAddAttendance: false,
        // modalAddEvent: false,
        // modalViewAttendance: false,
        loading: false,
        errorMsg: undefined,
        alert: undefined,
        excelAttendance: undefined,
        currentAttendee: undefined,
        currentAttendance: undefined,
        currentEvent: undefined,
        events: undefined,
        // filteredEvents: undefined,
        newEvent: undefined,
        dateFilter: {
          fromDate: getFilteredDates(DateFilters.currentYear).fromDate,
          toDate: getFilteredDates(DateFilters.currentYear).toDate,
        },
      },

      tsTypes: {} as import("./clubEvents.typegen").Typegen0,

      states: {
        IDLE: {
          on: {
            LOAD: {
              target: "retrievingEvents",
              actions: "clearContext",
            },
          },
        },

        retrievingEvents: {
          invoke: {
            src: "retrieveClubEvents",
            id: "retrieveclubevents",
            onDone: {
              target: "displayingEvents",
              actions: "addEventsListToContext",
            },
            onError: {
              target: "displayingError",
              actions: "addErrorMsgToContext",
            },
          },

          entry: "clearErrorMsgFromContext",
        },

        displayingEvents: {
          on: {
            ADD_EVENT: "AddEvent",

            ADD_ATTENDANCE: {
              target: "addAttendance",
              actions: ["addSelectedEventAndAttendanceToContext"],
            },

            VIEW_ATTENDANCE: {
              target: "viewingAttendance",
              actions: ["addSelectedEventAndAttendanceToContext"],
            },

            EVENT_DATE_FILTER: {
              target: "retrievingEvents",
              actions: "updateDateFilter",
            },

            EDIT_EVENT: {
              target: "EditEvent",
              actions: "addSelectedEventAndAttendanceToContext",
            },

            DELETE_EVENT: {
              target: "DeleteEvent",
              actions: "addSelectedEventAndAttendanceToContext",
            },
          },

          entry: ["clearSelectedEventFromContext"],
        },

        displayingError: {
          on: {
            "RETRIEVE_EVENTS.RETRY": "retrievingEvents",
          },
        },

        AddEvent: {
          states: {
            dislayingForm: {
              on: {
                "ADD_EVENT.SUBMIT": {
                  target: "addingEventToDB",
                  actions: [
                    "addNewEventFormToContext",
                    "clearErrorMsgFromContext",
                  ],
                },
              },
            },

            addingEventToDB: {
              invoke: {
                src: "addEventToDB",

                onDone: {
                  target: "#Events.retrievingEvents",
                  actions: ["alertNewEventAdded"],
                },

                onError: {
                  target: "dislayingForm",
                  actions: "addErrorMsgToContext",
                },

                id: "addeventtoDB",
              },

              entry: "setLoadingTrue",
              exit: "setLoadingFalse",
            },
          },

          initial: "dislayingForm",

          on: {
            "ADD_EVENT.CLOSE": "displayingEvents",
          },
        },

        addAttendance: {
          states: {
            displayingModal: {
              on: {
                "ADD_ATTENDANCE.UPLOAD_EXCEL": {
                  target: "verifiyingExcel",
                  actions: ["addExcelToContext", "clearErrorMsgFromContext"],
                },
              },
            },

            verifiyingExcel: {
              invoke: {
                src: "verifyExcel",
                id: "verifyexcel",
                onDone: "displayingValidExcel",

                onError: {
                  target: "displayingModal",
                  actions: ["addErrorMsgToContext", "clearExcelFromContext"],
                },
              },

              entry: "setLoadingTrue",
              exit: "setLoadingFalse",
            },

            addingAttendanceToDB: {
              invoke: {
                src: "addAttendanceToDB",
                id: "addattendancetoDB",

                onError: {
                  target: "displayingModal",
                  actions: "addErrorMsgToContext",
                },

                onDone: {
                  target: "#Events.viewingAttendance",
                  actions: [
                    "alertAttendanceAdded",
                    "clearExcelFromContext",
                    "modifyCurrentEventInContext",
                  ],
                },
              },

              entry: "setLoadingTrue",
              exit: "setLoadingFalse",
            },

            displayingValidExcel: {
              on: {
                "ADD_ATTENDANCE.SUBMIT": "addingAttendanceToDB",
                "ADD_ATTENDANCE.UPLOAD_EXCEL": "verifiyingExcel",
              },
            },
          },

          initial: "displayingModal",

          on: {
            "ADD_ATTENDANCE.CLOSE": "displayingEvents",
          },
        },

        viewingAttendance: {
          on: {
            CLOSE_VIEW_ATTENDANCE: "displayingEvents",

            DELETE_ATTENDEE: {
              target: "DeleteAttendee",
              actions: "setCurrentAttendee",
            },

            EDIT_ATTENDEE: "EditAttendee",
          },
        },

        EditEvent: {
          states: {
            displayingModal: {
              exit: "clearErrorMsgFromContext",

              on: {
                "EDIT_EVENT.SUBMIT": {
                  target: "editingEvent",
                  actions: "setLoadingTrue",
                },
              },
            },

            editingEvent: {
              invoke: {
                src: "editEventOnDb",
                id: "editeventonDB",

                onDone: {
                  target: "#Events.retrievingEvents",
                  actions: "alertEventUpdated",
                },

                onError: {
                  target: "displayingModal",
                  actions: "addErrorMsgToContext",
                },
              },

              exit: "setLoadingFalse",
            },
          },

          initial: "displayingModal",

          on: {
            "EDIT_EVENT.CLOSE": "displayingEvents",
          },
        },

        DeleteEvent: {
          states: {
            displayingForm: {
              on: {
                "DELETE_EVENT.SUBMIT": {
                  target: "deletingEvent",
                  actions: "setLoadingTrue",
                },
              },

              exit: "clearErrorMsgFromContext",
            },

            deletingEvent: {
              invoke: {
                src: "deleteEvent",
                id: "deleteevent",
                onDone: "#Events.retrievingEvents",
                onError: {
                  target: "displayingForm",
                  actions: "addErrorMsgToContext",
                },
              },

              exit: "setLoadingFalse",
            },
          },

          initial: "displayingForm",

          on: {
            "DELETE_EVENT.CLOSE": "displayingEvents",
          },
        },

        DeleteAttendee: {
          states: {
            displayingForm: {
              on: {
                "DELETE_ATTENDEE.SUBMIT": {
                  target: "deletingAttendee",
                  actions: "setLoadingTrue",
                },
              },

              exit: "clearErrorMsgFromContext",
            },

            deletingAttendee: {
              invoke: {
                src: "deleteAttendee",
                id: "deleteattendee",
                onDone: {
                  target: "#Events.viewingAttendance",
                  actions: "deleteAttendeeFromContext",
                },
                onError: {
                  target: "displayingForm",
                  actions: "addErrorMsgToContext",
                },
              },

              exit: "setLoadingFalse",
            },
          },

          initial: "displayingForm",

          on: {
            "DELETE_ATTENDEE.CLOSE": "viewingAttendance",
          },
        },

        EditAttendee: {
          states: {
            displayingForm: {
              exit: "clearErrorMsgFromContext",

              on: {
                "EDIT_ATTENDEE.SUBMIT": {
                  target: "editingAttendee",
                  actions: "setLoadingTrue",
                },
              },
            },

            editingAttendee: {
              invoke: {
                src: "editAttendee",
                id: "editattendee",
                onDone: {
                  target: "#Events.viewingAttendance",
                  actions: "editCurrentAttendance"
                },
                onError: {
                  target: "displayingForm",
                  actions: "addErrorMsgToContext",
                },
              },

              exit: "setLoadingFalse",
            },
          },

          initial: "displayingForm",

          on: {
            "EDIT_ATTENDEE.CLOSE": "viewingAttendance",
          },
        },
      },

      initial: "IDLE",

      on: {
        CLEAR_CONTEXT: {
          target: ".IDLE",
          actions: "clearContext",
        },
      },
    },
    {
      guards: {
        // isLoggedIn: (_, event) => {
        //     console.log(event.club)
        //     console.log(event.club !== undefined)
        //     return event.club !== undefined
        // },
        // eventsNotEmpty: (context, event) => {
        //   // console.log("event.data: ", event)
        //   console.log(event.data)
        //   return event.data.length > 0;
        // },
      },
      services: {
        verifyExcel: (context, event) => {
          return new Promise((resolve, reject) => {
            const obj = event.excelStringArray;
            console.log("size", obj.participants.length);
            if (obj.participants.length === 0) {
              reject("Empty attendance, please check the sample format");
              return;
            }
            if (obj.participants.length + obj.organizers.length >= 200) {
              reject(`Limit on Students UID in one Excel Upload is 200!`);
              return;
            }
            const regex = new RegExp("^\\d{2}-[A-Z]+\\d{2}-\\d{2}$", "s");
            let valid: boolean = true;
            console.log("arrayy  ", obj);
            // for (let i = 0; i < obj.students.length; i++) {
            //   console.log(i, regex.test(obj.students[i]));
            //   if (regex.test(obj.students[i]) == false) {
            //     valid = false;
            //     break;
            //   }
            // }
            obj.participants.forEach((element) => {
              console.log(
                `regex test for student ${element} is ${regex.test(element)}}`
              );
              if (regex.test(element) == false) {
                valid = false;
              }
            });
            // for (let i = 0; i < obj.coordinators.length; i++) {
            //   console.log(i, regex.test(obj.coordinators[i]));
            //   if (regex.test(obj.coordinators[i]) == false) {
            //     valid = false;
            //     break;
            //   }
            // }
            // obj.organizers.forEach((element) => {
            //   console.log(
            //     `regex test for coordinator ${element} is ${regex.test(
            //       element
            //     )}}`
            //   );
            //   if (regex.test(element) == false) {
            //     valid = false;
            //   }
            // });
            if (valid) resolve(true);
            else reject("Invalid File Contents");
          });
        },
      },
      actions: {
        // checkAuthAndAddToContext: assign({
        //   club: (_, event) => event.club,
        // }),
        clearContext: assign({
          events: (_) => undefined,
          // filteredEvents: (_) => undefined,
          excelAttendance: (_) => undefined,
          currentAttendance: (_) => undefined,
          // filteredAttendance: (_) => undefined,
        }),
        addEventsListToContext: assign({
          events: (_, event) => event.data as EventType[],
          // filteredEvents: (_, event) => event.data as EventType[],
        }),
        // filterEvents: assign({
        //   filteredEvents: (context, event) =>
        //     context.events.filter((f) =>
        //       f.id.toLowerCase().includes(event.query.toLowerCase())
        //     ),
        // }),
        // updateDateFilter: assign({
        //   dateFilter: (_, event) => event.query,
        // }),
        updateDateFilter: assign({
          dateFilter: (_, event) => event.dateFilters,
        }),
        addErrorMsgToContext: assign({
          // @ts-ignore
          errorMsg: (_, event) =>
            event.data.error ? event.data.error : event.data,
        }),
        clearErrorMsgFromContext: assign({
          errorMsg: (_) => undefined,
        }),
        alertNewEventAdded: assign({
          alert: (_) => `New Event Added`,
        }),
        alertAttendanceAdded: assign({
          alert: (_) => `Attendance added`,
        }),
        // alertOneAttendeeAdded: assign({
        //   alert: (_) => `One Attendee added`,
        // }),
        // alertOneAttendeeDeleted: assign({
        //   alert: (_) => `One Attendee deleted`,
        // }),
        // openAddEventModal: assign({
        //   modalAddEvent: true,
        // }),
        // closeAddNewModal: assign({
        //   modalAddEvent: false,
        // }),
        // openAddAttendanceModal: assign({
        //   modalAddAttendance: true,
        // }),
        // closeAddAttendaceModal: assign({
        //   modalAddAttendance: false,
        // }),
        // openViewAttendanceModal: assign({
        //   modalViewAttendance: true,
        // }),
        // closeViewAttendanceModal: assign({
        //   modalViewAttendance: false,
        // }),
        addSelectedEventAndAttendanceToContext: assign({
          currentEvent: (_, event) => event.currentEvent,
          currentAttendance: (_, event) => {
            if (event.currentEvent.attendance === undefined) return [];
            else {
              const attendance: AttendanceViewType[] = [];
              for (const [key, value] of Object.entries(
                event.currentEvent.attendance
              )) {
                attendance.push({ id: key, attendee: value });
              }
              return attendance;
            }
          },
          // filteredAttendance: (_, event) => {
          //   if (event.currentEvent.attendance === undefined) return [];
          //   else {
          //     const attendance: AttendanceViewType[] = [];
          //     for (const [key, value] of Object.entries(
          //       event.currentEvent.attendance
          //     )) {
          //       attendance.push({ id: key, attendee: value });
          //     }
          //     return attendance;
          //   }
          // },
          // currentAttendance: (context, event) => event.currentEvent.attendance,
          // filteredAttendance: (context, event) => event.currentEvent.attendance,
          // filteredAttendance: (context, event) => {
          //   if (event.currentEvent.attendance === undefined) return [];
          //   else return Object.keys(event.currentEvent.attendance);
          // },
        }),
        // filterCurrentAttendance: assign({
        //   filteredAttendance: (context, event) => {
        //     return context.currentAttendance.filter((f) =>
        //       f.id.toLowerCase().includes(event.query.toLowerCase())
        //     );
        //   },
        // }),
        clearSelectedEventFromContext: assign({
          currentEvent: (_) => undefined,
        }),
        addExcelToContext: assign({
          excelFileName: (_, event) => event.excelFileName,
          excelAttendance: (_, event) => event.excelStringArray,
        }),
        clearExcelFromContext: (context, event) => {
          (context.excelAttendance = undefined),
            (context.excelFileName = undefined);
        },
        // addAttendeeToContext: assign({
        //   attendee: (_, event) => event.attendee,
        // }),
        // clearAttendeeFromContext: assign({
        //   attendee: (_) => undefined,
        // }),
        addNewEventFormToContext: assign({
          newEvent: (_, event) => event.newEvent,
        }),
        setCurrentAttendee: assign({
          currentAttendee: (_, event) => event.currentAttendee,
        }),
        deleteAttendeeFromContext: assign({
          currentAttendance: (context, event) => {
            return context.currentAttendance.filter(
              (f) => f.id !== event.data.deleteAttendeeId
            );
          },
        }),
        editCurrentAttendance: assign({
          currentAttendance: (context, event) => {
            return context.currentAttendance.map((f) => {
              if (f.id === event.data.attendeeId) {
                f.attendee = event.data.attendeeType;
              }
              return f;
            });
          }
        }),
        modifyCurrentEventInContext: (context, event) => {
          console.log({ "modify context: ": event.data });
          context.currentEvent.attendance = event.data.newAttendance;
          // context.currentAttendance = Object.keys(event.data.newAttendance)
          // context.filteredAttendance = Object.keys(event.data.newAttendance)
          if (event.data.newAttendance === undefined) return [];
          else {
            const attendance: AttendanceViewType[] = [];
            for (const [key, value] of Object.entries(
              event.data.newAttendance
            )) {
              attendance.push({ id: key, attendee: value });
            }
            context.currentAttendance = attendance;
          }
          // filteredAttendance: (_, event) => {
          //   if (event.currentEvent.attendance === undefined) return [];
          //   else {
          //     const attendance: AttendanceViewType[] = []
          //     for (const [key, value] of Object.entries(event.currentEvent.attendance)) {
          //       attendance.push({name: key, attendee: value})
          //     }
          //     return attendance
          //   };
          // },
        },
        setLoadingTrue: assign({
          loading: true,
        }),
        setLoadingFalse: assign({
          loading: false,
        }),
      },
    }
  );

export default ClubEventMachine;

export type ClubEventActor = ActorRefFrom<typeof ClubEventMachine>;

// export const ClubAddEventMachine =
// /** @xstate-layout N4IgpgJg5mDOIC5QEMIQKIDcwDsAusAdAJYQA2YAxAMoAqAggEq0DaADALqKgAOA9rGJ5ifHNxAAPRGwA0IAJ7SAvkrmoM2fEQAWYMmT4B3PgCcyESvQAiVgProAaugBytQo3TUACgHlndryYXVk5xfkFhUXEpBABOABZCWIAOACYARgB2AGZ47IBWWLZ8rLlFBFTU-MIANnzi+PzknLrY7OSVVRAcPgg4cXUsXAIwgSERMSRJRABaKszCTNTm7NX45LT02LLZ5sJ6tkO2LPiazMz4zJU1NCGtEnIwUYiJ6MR0msTko-Tk7PSGjUNjsEAC2IRUj9KmxMmx-lVriBBpoCIQ+nhkMQyPApuFxlEpjEZul8ol8iV4sd0tTkvkMiDshl9ikailGjUCvkaojkcMdHoDMYzBBnvjJqAiZDYotljk1hsMtsFO9-oQYfFqdkaul-pluZ0gA */
// createMachine({
//     id: "addEvents",
//     preserveActionOrder: true,
//     predictableActionArguments: true,
//     initial: "idle",
//     tsTypes: {} as import("./clubAddEvent.typegen").Typegen0,
//     context: {
//         name: ""
//     },
//     states: {
//         idle: {
//             on: {
//                 START: 'helloworld'
//             }
//         },
//         helloworld: {
//             on: {
//                 "ADD_EVENT.RESPOND_PARENT": {
//                     actions: sendParent("ADD_EVENT.DONE"),
//                     target: "responded"
//                 }
//             }
//         },
//         responded: {}
//     }
// })
