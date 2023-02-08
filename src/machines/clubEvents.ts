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
  filteredEvents?: EventType[];
  currentEvent?: EventType;
  newEvent?: EventType;
  attendee?: string;
  modalAddEvent: boolean;
  modalAddAttendance: boolean;
  alert?: string;
  currentAttendance?: AttendanceViewType[];
  filteredAttendance?: AttendanceViewType[];
  modalViewAttendance: boolean;
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
  addOneAttendeeToDB: { data: EventType | string };
  deleteOneAttendeeFromDB: { data: EventType | string };
  editEventOnDB: {
    data: {
      successfull: boolean;
    };
  };
  deleteEvent: {
    data: {
      successfull: boolean;
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
  | { type: "ADD_ONE_ATTENDEE" }
  | { type: "ADD_ONE_ATTENDEE.SUBMIT"; attendee: string }
  | { type: "DELETE_ATTENDEE" }
  | { type: "DELETE_ATTENDEE.YES"; attendee: string }
  | { type: "DELETE_ATTENDEE.NO" }
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
  | { type: "error.platform.addeventtoDB"; data: { error: string } }
  | { type: "error.platform.editeventonDB"; data: { error: string } }
  | { type: "error.platform.deleteevent"; data: { error: string } };

//   | { type: "done.invoke.retrieveclubevents", data: EventType[]}
//   | {type: "events.actions.checkAuthAndAddToContext", club: ClubType | undefined}
//   | {type: "events.actions.checkAuthAndAddToContext", club}
const ClubEventMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QFEBuYB2AXWA6AkgCIAyyAxAMIASyFA0gPoCCAqgCpUDaADALqKgADgHtYASyxjhGASAAeiALQBWAEyrcqgMzctANgAcARj3cjATlXKANCACeiIwdzKtWiwBZlHvVoDseqrcBgC+IbZomDgEJOTUtIysHJxG-EggIuKS0rIKCIq+Rrh+Wsp+yoG++h4etg4IRh7O+tx6JcH65soGfmER6Nh4AE5gWCOoYhhQkYNkENJguJOowgDWiyNjYmDoAMYANgCuAEY7UbA8aUKiElIy6XmKRgG4-h6q5loGytzmfh7mWr2RyqPS4T4VPyqcpmEptPogGbRTbjSbTAY4OYLJYYFbrXAo7Z7I6nDEXVKyTK3HIPJTQ7guPwlZRGIzubpqPR1JSNXAGHweVoGcyGIKqNkIpHDUaoqZSshgIZDYRDXCCfYAQywADMVQBbAkyolgA4nM6DS6Um7Ze6gR5+QG4Jx6NnGaFsv7chDihlqZTmbgsjwlNnKZSSsm4CBiWDqjV2NHypiEQgMZAANWQADk2Jb0lSbblEFousVWVCgiyDMYucCEIKGWyml8ano-l4I+cozG4wm5WSyMnU0w2Gxs4QmFmKMg89csnciwgerhA40DG49CyWqove8tK9VB4jGGtF4DKYRZ3Bt3Y5q++jzmR0-hkAB1Zij8eT6ezjLWhe0vk2h+K8BjqOouiHuubK7mGoFfE4PzmMKfihOEiKRtGt7xomSoqmQABKyBsARL6ZmmmY5gAyrgREkQAmr+BYAXaSh+MeuB6ACh7mCKXznl6pQMlCJbcIGoLIUe4boVKuBMBAEBIjed5ogAYvqg4phR2ZsLgVEsAAQgAsvguZ8Fa840qxCCuOYnHGKG3QBqyNh1mKrxHtWpR-NCWhXtE8mKRiuAagpiYYmwwiEAZWIYIsyxrIsoUQOaWBYFFBlMf+VnyI4-xOv4yGqN8lgApYXpOCBR6buKwrfO8-L+XggVKcl4VRJF0UKnhqpxjq+ohQpqXpdFWWWbauX1j8rxfGY5gWP4HynoJIEljUJb8m0LJGE1g0QEwaWYBAGoYLsixYb2aJGcIx37Jpw6flmE5TsguAsAACsQADyyZpgAGtOxBjdSE15C6jYiueyGfG2LpeuUGjvA1gqNG0vy7clB1YEdJ1nbg6BDGI2piPeyByGdd3zHFOJ4osBNE3YYDk2A+zA4WgGBB4nFGLoXQVNWrLmBVujNB4-jPI0nxOH5MmRpjh0YMdp104qRMk4mzN3Yqyq9Zq-VDAa9Paozmtsyxk1fBoIqCkGwoBm0XrGM4YFhmU3ANdLGMKVjOPK3taI+4ruNgJ1MVU-FuKJXtWrY0HysjZl5n5tloOIKCXPVE0gKWICXyufURWvKYPTeOKfiBjL-RdvLsdK3jbVTIHdchxl3U62qeu6gb0cK83CdmzleRMgy3DtN03HrkyXp6L4TptgENTcB8YZoVX14TGAADuAe98HlDfVRyAMM+b4fmOT3fjOSdziDi6KKCYJmK2vzqIY5Tw6ymifMKwb-LxrS7Q3tvRuu9lb3QYF9LMR8Rzn0IMgK+Vw-zjTvgCZwbtWiHl8GLIWdYwJFFBOeTw5d+KVwwl2IBO9a57zgaQMcZ9xzwIHqnfI3gigzy0EEMCvgZ6+C9N4fcpVjBlB8D5PQXtoxTC+nFJuYAwCxQjrTPaCwY5HVkf3a+SDb6ARUCWTi5dXbnh8OofOiB2IaAdKJNQTgrDu3EWiKRYAZFyO1iqDuWou4GmSso3uaiMpMLvkyZwgJ1ywycMhAIXpeJgn5MhSerQAS6F2gsJx6kDbgMgdAx6cDXr6WMqZfx2j+QgWzj8CozxvhuHhn8J0x4RHnnUPyDwu0Ur7FGJQ1Rcjw40yjrJFpbSQG11kQgBKuwtR3EuAU6yKhfjgjKFCNQhCxK1nqC2TQYEdAijKE4Iwqhmks36VAJxbdXF9Q8bgXp+zJADI6cMyOoybQTI0cxQeShLBFAWf6asq5yg4PqJufBbgWQ-F0Ds4IGMRj0WEIcKihwRhkBocRTJsD4G4HosgKikzJqKBFHZF0rZvDvEqDuOswK+Tp18A6LwHZZbVwhVCmFcKEV0JgQw16WYvqYvtNCYoIpQRQgMJBExU0ub22QmGVk7tUZhHQhgG6cBZBSgsloqZbITCcXdu8XibgvjIS9IodwYJ3jFUPMEUwYsAi7SIKQJV7MpmCjBOxFyYkvA83fnWJ4YFub-HUOxNoSNpJr2RDKHY7VBg2vNo8IMK5vBL2+FYascM3IcJXDzbBbYRE7RpdeAA4sINEkUqDCD1GAd6GoYDhpefkJkdknDmtKpYYwWg9VFFPOKBp2hTztiXs0nsKl+znArcwp4FQv721RrZRoQqhLFG0AGcSbZ+THh7dhUmPVB132CR5Vk1YvCjx5gYQSbhXjPFjRwnwRTdotQxOujm+4BYlHLi6HmVggT1CeO4PkfFDAmBdJufQl6FJKSwn2qAqS9Q3usgCMEa4vJVncKPIVigaivC-SeIIrbDwAaClEf2-bsChwg5NVkRR73+FaBKl98M56uu8MKQoXFzDiKbsHQjeQ3Aiq4quLO9s-B8K8E6Tk-CxILUzYGvANdfZ4wuiB66t1WOIH4bMil-oug+EMNPZNNVNxtlPGe3ZWbogSbjnjI26s5Sa3kwgXwGhW1iXKC6eaQqAyrXXK0QEw9DCkNkkZ5uuHDmgLOgR5OyDAILOKNpj4MJWRfAqjzaJx4OFhmhO0fTYn8bbGAf5qhytLP6uCHyJezI92UtfQpgMmgjy-FqRUDhqWyHXgblABxTjcs7NcOCMJm5WjapKI7bQfISiWEWhXCwSTpE+LAGB3L-pGwcLZGYMSahR6RKXk6GGNRQTitHns1pVyssdNawQ9VG2tVuDqnwtkeiuLzzMNqgN9XDN0uhbCsAuWF0dbFZPNQvGSVi3BFBY8-x56gkva0oYWBLPOZ5YUbOIoF56oaf9411Y-RzMY9KoAA */

  /** @xstate-layout N4IgpgJg5mDOIC5QFEBuYB2AXWA6AkgCIAyyAxAMIASyFA0gPoCCAqgCpUDaADALqKgADgHtYASyxjhGASAAeiALQBWAEyrcqgMzctANgAcARj3cjATlXKANCACeiIwdzKtWiwBZlHvVoDseqrcBgC+IbZomDgEJOTUtIysHJxG-EggIuKS0rIKCIq+Rrh+Wsp+yoG++h4etg4IRh7O+tx6JcH65soGfmER6Nh4AE5gWCOoYhhQkYNkENJguJOowgDWiyNjYmDoAMYANgCuAEY7UbA8aUKiElIy6XmKRgG4-h6q5loGytzmfh7mWr2RyqPS4T4VPyqcpmEptPogGbRTbjSbTAY4OYLJYYFbrXAo7Z7I6nDEXVKyTK3HIPJTQ7guPwlZRGIzubpqPR1JSNXAGHweVoGcyGIKqNkIpHDUaoqZSshgIZDYRDXCCfYAQywADMVQBbAkyolgA4nM6DS6Um7Ze6gR5+QG4Jx6NnGaFsv7chDihlqZTmbgsjwlNnKZSSsm4CBiWDqjV2NHypiEQgMZAANWQADk2Jb0lSbblEFousVWVCgiyDMYucCEIKGWyml8ano-l4I+cozG4wm5WSyMnU0w2Gxs4QmFmKMg89csnciwgerhA40DG49CyWqove8tK9VB4jGGtF4DKYRZ3Bt3Y5q++jzmR0-hkAB1Zij8eT6ezjLWhe0vk2h+K8BjqOouiHuubK7mGoFfE4PzmMKfihOEiKRtGt7xomSoqmQABKyBsARL6ZmmmY5gAyrgREkQAmr+BYAXaSh+MeuB6ACh7mCKXznl6pQMlCJbcIGoLIUe4boVKuBMBAEBIjed5ogAYvqg4phR2ZsLgVEsAAQgAsvguZ8Fa840qxCCuOYnHGKG3QBqyNh1mKrxHtWpR-NCWhXtE8mKRiuAagpiYYmwwiEAZWIYIsyxrIsoUQOaWBYFFBlMf+VnyI4-xOv4yGqN8lgApYXpOCBR6buKwrfO8-L+XggVKcl4VRJF0UKnhqpxjq+ohQpqXpdFWWWbauX1j8rxfGY5gWP4HynoJIEljUJb8m0LJGE1g0QEwaWYBAGoYLsixYb2aJGcIx37Jpw6flmE5TsguAsAACsQADyyZpgAGtOxBjdSE15C6jYiueyGfG2LpeuUGjvA1gqNG0vy7clB1YEdJ1nbg6BDGI2piPeyByGdd3zHFOJ4osBNE3YYDk2A+zA4WgGBB4nFGLoXQVNWrLmBVujNB4-jPI0nxOH5MmRpjh0YMdp104qRMk4mzN3Yqyq9Zq-VDAa9Paozmtsyxk1fBoIqCkGwoBm0XrGM4YFhmU3ANdLGMKVjOPK3taI+4ruNgJ1MVU-FuKJXtWrY0HysjZl5n5tloOIKCXPVE0gKWICXyufURWvKYPTeOKfiBjL-RdvLsdK3jbVTIHdchxl3U62qeu6gb0cK83CdmzleRMgy3DtN03HrkyXp6L4TptgENTcB8YZoVX14TGAADuAe98HlDfVRyAMM+b4fmOT3fjOSdziDi6KKCYJmK2vzqIY5Tw6ymifMKwb-LxrS7Q3tvRuu9lb3QYF9LMR8Rzn0IMgK+Vw-zjTvgCZwbtWiHl8GLIWdYwJFFBOeTw5d+KVwwl2IBO9a57zgaQMcZ9xzwIHqnfI3gigzy0EEMCvgZ6+C9N4fcpVjBlB8D5PQXtoxTC+nFJuYAwCxQjrTPaCwY5HVkf3a+SDb6ARUCWTi5dXbnh8OofOiB2IaAdKJNQTgrDu3EWiKRYAZFyO1iqDuWou4GmSso3uaiMpMLvkyZwgJ1ywycMhAIXpeJgn5MhSerQAS6F2gsJx6kDbgMgdAx6cDXr6WMqZfx2j+QgWzj8CozxvhuHhn8J0x4RHnnUPyDwu0Ur7FGJQ1Rcjw40yjrJFpbSQG11kQgBKuwtR3EuAU6yKhfjgjKFCNQhCxK1nqC2TQYEdAijKE4Iwqhmks36VAJxbdXF9Q8bgXp+zJADI6cMyOoybQTI0cxQeShLBFAWf6asq5yg4PqJufBbgWQ-F0Ds4IGMRj0WEIcKihwRhkBocRTJsD4G4HosgKikzJqKBFHZF0rZvDvEqDuOswK+Tp18A6LwHZZbVwhVCmFcKEV0JgQw16WYvqYvtNCYoIpQRQgMJBExU0ub22QmGVk7tUa7SYK0oYWAQqyqwF9bU2pBykAImZRBzzmFdFWnxdQFhAzlD8F6RQDpwQNPFjzVobhV5kOvDKxU8qNSKqkWQKibAvrvWYOqzVFktHWR5rPAV+hoRdA+LE01ZRwRslDMYHQWzzBhHQhgG6cBZBSn9ezKZsawSmBqBGtwXxkKmvcGCd4xVgzBHLsKXZNLrxEFIFm82jxBRgnYi5MSXgebvzrE8MC3N-jqHYm0JG0k17IhlDsdqgxm0vJYbyQMgpip+mrHDNyHCVw82wW2ERO163RAAOLCDRJFKgwg9RgHehqGAc7mFmvNU4MWDoeLFRgn2oop5xQNO0KedsS9mk9hUv2c4d677HjBBG1oqNbKNCFUJYo2gAziTbPyY8gHsKkx6mB7RwSPKsmrF4UePMDCCTcK8Z4S91yYKKdKhSSIcPWWDcYEo5cXQ8ysECeoTx3B8j4oYEwLpNz6Do0FKIykcJTFSXqRjk0ARgjXF5Ks7hR5CsUDUV4-GTxBC-YeUTrUwogewKHWTeRWRFAFqx6DHHvDwznj27wwpChcSTQevANdfZnVM8WU84IuKrizvbE1JKvBOk5PwsSC190Tvc97UBeMLrAagNdW63mbJi1mRS-0XQfCGGnpumqm42yng4e8cRTdg741VsTUmms0u+A0F+sS5QXTzSFQGVa65WiAmHoYUhskPNx3roZw58WW7RTSws4oRWPgwlZF8CqQa+THg4WGaE7Q60xfxtsYBo2qHKzS4oHQzsl7MmI5SrjiB-QMkPDzNrXgGubftdEBuUAHFOMOzs1wManM-CqP4LQjttB8hKJYRaFcLBJOkT4sA0nDvXYKuKHQ1q1Cj0iUvJ0MMC2bhZKPPZrSrl7Y6Z9ghnF3bvF4kWuqfC2R6K4vPMwRbx3Pfc3S6FsKwCHdQzGsVk81DBfqPwi1TRjz-HnqCaViq0soU049w1ZQKimoaRaytoJyk6cl06hVTrlXajS3zHlhRs4igXqaxoiMGlNFQmLHoXFNdyu13KqR+vQsljlwGBXyyeR2UsMVK1SzbVNOTUAA */

  /** @xstate-layout N4IgpgJg5mDOIC5QFEBuYB2AXWBiAwgDLICCASgPr4DyAcgCrIAa9A2gAwC6ioADgPawAlliH8MPEAA9EAWgCsAFkUA6AEzsAjAGY1mxQDZ2agwHZNAGhABPORvYrFADm1PTa3QE4Dn9u20AvgFWaJg4KgCSACLEuITUJFEc3EggAsKi4pIyCLKK2qpuxmrenvKapuyKVrYITmrqmvqmTlXySpr1QSHo2LAqAE5gWANCYKhCGFChfbgQ4mAqk6j8ANaLQyNj6ADGADYArgBG42GwyZLpImISqTmyFQYq2qaKJa7y7J6vntU2iJoTCpPNp5GY1KZPhVtGZuiAZuFNqNxpNpr0cHMFksMCt1oNhsjdocTujzpoUnxBNcsnc7JUVPJTKZQU1tJp5E55CYanJ9ConIZFOwDE5vPVjDo4Qj+kjtqjpbgwAMBvwBipeHsAIZYABmqoAtvitqd9sdTn0LqkrplbqB7qZfipOgYdE5AeZtN8eQg9A4ufJfOVFMydO0paSVBAhLANZrrPLSbhElEKMgAGrIBiWykZG7ZRCe+QqcwVNQacpON0Gb1Chw6ZyuZQ+V7ycNnSPR2PxqYK5MUEj0Ri0KIkWj4ZDZtJUm35hBNUwMkVqAUQpri+Q1+meepcxTeMzmTltvodmNa7tos64NMRZAAdX7g8zI7HE64l2nedpuTUbxU-i0ApXhcTwyxrEFi3aUwDDLNkAwqVtgnhCMozPOMEyvAAxCJCEYSh00zegAGUKEICIiLYd8rU-Gk7TkTxgW+ZwDHkGEITcZdvWXTR1EMUDPUBMx-EQnp21QrsMNmAiGAoEdGAobDcOQMhJ2tL86J-HQVBYjw2RKJQDHyP5aghBpf0ZIwXWcEFf2PcJxPPeVlVVXAyGQegyFvDNUwzBgiJUNyPIATVUmjbWkORmSeTxvDULlfE8TRPG9Fl-1Fdk3UUTQfGygw7P6EgIAgBEkyiFNpPoFQiGoIi3wpKdc1oiK520P1vjBDkORMbRtBSzkGSykEQXZJRFHylRCuK9FT0cqZMINUryt8yqiIAVQAIQAWQiSj6rUpqclYhiRVZdpRS0dkuOMZ4ssrUFvghQIkOlCaioRFRNSKySsHofgonWzEMEWZY1kWT6IHNLAsD+9bQsa8KcgqVQdAdepOVAvdQO9ToFyynTOm3JRlzG56I0m97we+37-sVZy1VjXUDQ+orIeh-64epBHEEUT5nlcLREpBdwQWMgsF09ZRPQFMxyk0cbwZIKHMAgTUMB2MBFsfIcX3HKr4lqjmZ2-Vri1XLxnHnD1vRg7QGVamK2SqGCYvlorFawZXVfV08JKmTb+BVvZNYHbXR111aAAV4kSVMmHHQhDfU5qXTrMUfFFGFvEsf4EEhBo3jeAUtEMSpPFdiB3c9tXFnQUYdSEC9kCkdWg-mIHsVxGulSEHVrDAZuwD2RODsQGDVBTwswUrJpkpzzR-CcG6XgqfRhpccvK4wFXq5UWue4b+UB6DpUVXprVGYGQ0997-uW+HrmEFcBpvCFINRV8MxvTdRedygqpuPXqTdsCslZby9mDL6UxN7b3VtTAGbdgY4lBszFWoCYHDBhvfWcJhVAwmUKKPcJR8icm9NuBoMJ2BuCJhUdgrEN5oPASg1E0DwFwNpqfdU589SXxQdqD2YDq5s1hlRHMnNZyckXixPcLRyjtC+LPWoLEeIcjZE0N4pR2T0P4egn2s0oBpk1HsIQxUj7ByfMOMOyAVBrS2jtLB34HrPHMB4F0BgCgBl6nPXKps3gVCKG4liWiq7ewcuhKYBijEmJbmY0Or4VCR2juVOOyAE4iIamIhx-UtAihFAJHJosEBDQZG6ecbgeb+HGhMMAAB3ZhDDq4EH1sgCgN57xa2fJY+xGlZBsieC6bKZQAwuAFBuHObgGImCcCxGWlYx6VLGLUqB9T1a4EUnhdpFjXxdOarIEwPE3EaFFL+QmrFvSQiLL+QERNgx+E9ONUJjdEzICiDtHyhFtn3AMsCMwBgWKcheHFGsehHBNCkZ8aCrFGTjWQFGLA70Hmon9oHXAzzXkhw6XEmx21dofnhrOWQ0Fx5Mi5DLPcGVrYuAZEjACLQiHQthSVVF9A3kMD1jVOquKMndPUcCQw+haHOyUFUFKZR-yGDcWUAoWUIQiWQu2GFIh3qQGuD2dEgNEGdxUMqj26JxDszSftB+Cg-DPESqxYwPNvhujOSbYUPNHhGB5k9JCGAA5wEkNKTlRtunz2uuozoTQIQug5N6HpJtYr8xJV1JQ41ojEC9Une4TrtJMUoTKnQn8c4EsXhZVqzIpnMlskAk8soUSqrOAmkeuQAwOD8EKSWQo3C-Oxv1aChkP75GFJ0EmokTwIvLX0StRqkqL2ZDFYUrECiVicCKhi7RtwS0MhbYU9zOx6OQHTId+LfiLwKGuEZ7BzCUJSj1Z4NDly6EMAKUw41yboi3d+Nx-I3TMkqP04wShQ2-ltoYFxZrZZaFvW9aaqE9HzUvg+jSwYeLfH5VQl0F7Q0jW+R4V988XBvCA1NMITCB0-RhpB5qTQeLT1fV2+ecUCkLmyvPSE1k3HZT3EEgR6tCM5B6qoF+tD9Dv2FKYb0SgizshMFZXwVRAG9vCCA7RjD+1QCRYYtjiAlC2zKG4yEMUDIimtrobSUafAFEvWoZjOjr4Hx7EfJTCADk3XsJCF0ZrSGHueC4YUvwmTCgk3Kk80ngkQKjEsmT1c4FWecA0dwJg9DLh0i8bGI6z3z1BdBeoiUTOybXWE-RhjjFNxboR6GvAATz1UGWN4T8QyGX4yAPYYAdRYEQKBReQ0xR7NeKCKwRx+BQ34PqIrXJ1C-g8PUCrwYrCjCgAAC3q3OcTwJPQtZdG16sIBakQCwBNgEGh-x+B27tvwTQrATbAEISb03nBWByI1ubMUlyLfyKM2oTQqgDbK8N3pwZ5k1LqUF1j1E8XGx4v4MwZWlHfEoQ9xAGngR+FljBDzVR6WKvvX9rlOyyiqH9SUoN5Kc7+kcHuXQDHdCMicIjuFIGMsXgU3sKzBLXjFnTrQmKYnOI536bykWwZCUlBvcW8ICryc4e1d9WnH9HAlADe6YNM6c4tBI7LQuApvC6CCEEIAA */

  /** @xstate-layout N4IgpgJg5mDOIC5QFEBuYB2AXWBiAwgDLICCASgPr4DyAcgCrIAa9A2gAwC6ioADgPawAlliH8MPEAA9EAWgCsAFkUA6AEzsAjAGY1mxQDZ2agwHZNAGhABPORvYrFADm1PTa3QE4Dn9u20AvgFWaJg4KgCSACLEuITUJFEc3EggAsKi4pIyCLKK2qpuxmrenvKapuyKVrYITmrqmvqmTlXySpr1QSHo2LAqAE5gWANCYKhCGFChfbgQ4mAqk6j8ANaLQyNj6ADGADYArgBG42GwyZLpImISqTmynZ4qni5qak6K7E71Rk41iE0ni8-F9PNp2J5vBDuiAZuFNqNxpNpr0cLgwAMBvwBipeHsAIZYABm2IAtoNhojdocTqjzlxLoJrlk7nJTJ5VJ0DDonJo1OZtJ5TP8EHoHPI1PJfOVFKZtDp2jC4f0IEJYHj8dZkcrcIkohRkAA1ZAMC6pK6ZW6gHLc7QqCVy7TyMw6UwtEWCzSODneeSCoyQsFKukqVXqglaqY6vUUEj0Ri0KIkWj4ZBmvhMy3ZRDaUzyRwggz5PNqRSlkWyu2S7lyjnaMxB4KwkNhjWRlFnXCGiLIADqsfjJqTKbTDPNmZu2dyfKe8r95X5PN58hFUqcKgFJblec8TWDZ1Darb2rpuAAYhFCIxKEaTfQAMoUQgRe9sMcZjKT1m5IFC5wGP0DH5Nx3hFd4vVLHwPF3ExKidfc+kPcNNRPTtbwYCgk0YCgLyvZAyHTNIJxZa07EFFR6w0XkXEUPlyjAtwC3kFx5C0T4DHlBDwlbCNUNmZAogiegDWNU13yIz8SOkOQHRUJo+S0TwSnYICDArPw5IKNxzB09kiy4lUj14qNTyiZBiGw9C3xSD9mStaTckUXwVCcXwIVMIC+T5bRV2clxPOY1jNC0TQDKQ48o0xbFcDIZB6DIHtjREu97xUWL4oATUIi0v1I3I5QMZ5vElZTd08D1yhUUFNGY-RNB8eqDDCkgIAgOFdSifUrJUIhqHvUcbIkuypx0cUhWdQKfm0HybBzJx8w6MEwRqpRFGa1q4SQ4yoDPMkOq60T6BUe8AFUACEAFkhOy4j7JyP0ngMXkFWY3wmhXWbRWMCjaO+J0hX5QIm2VFQWra1EVHxVq+Kweh+CiM65gWJYMBWdZIda05sCweGzpuyS7oBUxOVzF53ilUtITUEVOlMRx6olR55rLD51vBsIMdVEywjhhH0SinENWJMlOaxrAcYR-Hhu-RRWIo1xFM0MF3DBapPtzCiOXyF5DDzPdgZDKGIBIcXMAgfEMB2MB9oHBNh1THr4n6qWs2-JW6e5EoHrzbT6xFIw7SFHdWklIVdDCo2TawM2Lat8Ltou-hzb2G24zt5MHZOgAFeJEgNJhU0IF3coc4mHEqWWauUIV6rV2oXC9CFSwblSDCA0wI9aqOY8txZ0FGIkhHbZApCtlP5gwRZljWPuMSEIlrDAUewD2YupJyPN8yaVpaL5ZxdGpz75LpkLdyA2j5WMTvjdNjBzd7lR+-noftWXlOMSxQWCWFgZySfhel5jzXoTBA5Q7SynqkKNoSkfAilcnTJyuZnQ6GcMFNQ19u531josI2yJMH3ytrzRGE8p6oxnpzQk0csG9wlnjcSOV145iAvaNwstWLyHMDRGmVQHDV0qD4ICUpZQYNvgQnB0Mpj4OwUQ-mn9cTfxJL-ChojsG0OAVOF4Tx6omFLOwcwfpjAijlA4SUOhgqMyetNERVCxHxxQlMQ0+I9hCDam-VOg5EwZ2QMdc6V1rKMgJiNNBLkWjfAqErWUZQaalnzIKUskDVLvDWgbA8kcVEPx4vYqAjjnGuLHu49OI4VDZ1zl1Au5l1Fu3evaGJOgORuhUsKI+Wh1yU3lAIosHInBhQmGAAA7ng9JVsCBO2QBQbsfZbZDi8ZUvKDwOFyV9OUMoZZd5qU+nKVpzhmZOUhHEnpYwBmSKGdbXC14pmeJHLMhyAF7QeWmt4Co7BXrcNufczRspm6GDCsgVUWB2oCSEslBgjs+oDQCdLOZrhVB+jlMWQCJRpqrnBCE9kIVOF+HQSkxCvyRCbUye2ROydcCAuEt1U6l1rr0NulOWQaKXIvEEd5coHD-ZmE0k6Xkvh5omCati8IuL-kQ0gNcbm2AkaTxRmjRYIro6onEJLalgTvwKA1k6fR-gKiyyRRs55VUno+ClAUPwZYfl-M2rKmGsjsTyMJIo8ksqxYKroYNBhICHhVEKpRIsWh3D+C+P7eaVUtUVA8G3GqWKegHiiCvYYYB2pmQsmM7qvVnZKshQ5WQ7x1xmDcL6dwUE-afQanJWWnwIQvQAmFGNew434qMlk3av9cCJrismw6PjKX+PHMquZZaVAcQ8KWQwLpDA0z5B7JyEoPg6Dbpxfl-Qa11ohhAWNogxVYAlaQ6VoY11gDFtc+4TkvS0QArLIwUpB0ijBHaD4SDZ1t35PIate78VrqtR-G1Qt7W7trdHA96bXZQqVhuesAECgAT0ZCOuAI9Ae2MErDiyDkFBCbBgJOcBJDKghUBzNTQywUVUp8UN-q-ifVkNNBwxVcwqQhFKPkYVojEBwyXI9foB1-i+E+2dTTah0vXBwjiejXBmF0MkqNiEETbBhvAHtGb7hSgcCaqo+RPhuDbjTINHlOkqXyCpTo4nmwHgJTJljjDpxChcroJ6+GgIlDlB6SE9o1xOWMMYZweiwomcip-Mz7quk-W3h8Vi5gA3q2mhRJ57wxNPWEQu0GG1UR+anBxFyvJtz6bQUoEUWb8iOCAq4ZieY-C1jZvW2A20m2kmSzLcwzxzBqbzJ7FwOWVrPAK9uYKNFI1GcQmDTauCN1EJq3leSaWKg0e5FlmDCA6b1WCnmZw3h2lOWsT3K2I2HKGHzBAnwFcKY+BmrUArLkqL5CcJ5Msng1vULjt5qARKnGbZtMTfLnw9DtH0G4SwGymgUSos6YwHF6o3dsf-F+UY37PcQB5BoHxfTygqGCP016LtVQXE9Z0vgjChXi2kmx2DOaDIJ73YbcncM2h0OocEvKPiSmUNEjy9WlILaevUL4oPCf3ZyS4keY9ocIHMU8ZQHkeQVHuWR2o284dKWLPWFlbcDn9OJ+tsAAuXAbnqtNVozp3AXxpoKQOtNWgRMsYZkGgq4QC49RyQjJhiN+vBJLxAkTHCChaE0EKip4uW5XQ2wlScnvk9Y3IIoA6pTGOx65PRq427PHd2CEwfpwJmrxcKv5MNrfY8cCUToTR+TcmYkY3kLlyj6GzU5QdL6-3xqS8H8zdLlCOGUHoJWNUqY-frmCDc7g3hsIqCy6vy6Ob3aq9bgRzeyyAnbyz6JNUanuHF-NNvfKJPhCXdHN9f7M-1-dYKJ4EokPTRCxW1HEFe-1n0bLjuqGgA */
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
        modalAddAttendance: false,
        modalAddEvent: false,
        modalViewAttendance: false,
        loading: false,
        errorMsg: undefined,
        alert: undefined,
        excelAttendance: undefined,
        attendee: undefined,
        currentAttendance: undefined,
        currentEvent: undefined,
        events: undefined,
        filteredEvents: undefined,
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
            ADD_EVENT: {
              target: "AddEvent",
              actions: "openAddEventModal",
            },

            ADD_ATTENDANCE: {
              target: "addAttendance",
              actions: [
                "addSelectedEventAndAttendanceToContext",
                "openAddAttendanceModal",
              ],
            },

            VIEW_ATTENDANCE: {
              target: "viewingAttendance",
              actions: [
                "addSelectedEventAndAttendanceToContext",
                "openViewAttendanceModal",
              ],
            },

            FILTER_EVENTS_LIST: {
              target: "displayingEvents",
              internal: true,
              actions: "filterEvents",
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
                  actions: ["alertNewEventAdded", "closeAddNewModal"],
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
                    "closeAddAttendaceModal",
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
            "ADD_ATTENDANCE.CLOSE": {
              target: "displayingEvents",
              actions: "closeAddAttendaceModal",
            },
          },
        },

        viewingAttendance: {
          on: {
            CLOSE_VIEW_ATTENDANCE: {
              target: "displayingEvents",
              actions: "closeViewAttendanceModal",
            },

            FILTER_ATTENDANCE: {
              target: "viewingAttendance",
              internal: true,
              actions: "filterCurrentAttendance",
            },
          },

          entry: "openViewAttendanceModal",
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
                  actions: "setLoadingTrue"
                },
              },

              exit: "clearErrorMsgFromContext"
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

              exit: "setLoadingFalse"
            },
          },

          initial: "displayingForm",

          on: {
            "DELETE_EVENT.CLOSE": "displayingEvents",
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
          filteredEvents: (_) => undefined,
          excelAttendance: (_) => undefined,
          currentAttendance: (_) => undefined,
          filteredAttendance: (_) => undefined,
        }),
        addEventsListToContext: assign({
          events: (_, event) => event.data as EventType[],
          filteredEvents: (_, event) => event.data as EventType[],
        }),
        filterEvents: assign({
          filteredEvents: (context, event) =>
            context.events.filter((f) =>
              f.id.toLowerCase().includes(event.query.toLowerCase())
            ),
        }),
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
        openAddEventModal: assign({
          modalAddEvent: true,
        }),
        closeAddNewModal: assign({
          modalAddEvent: false,
        }),
        openAddAttendanceModal: assign({
          modalAddAttendance: true,
        }),
        closeAddAttendaceModal: assign({
          modalAddAttendance: false,
        }),
        openViewAttendanceModal: assign({
          modalViewAttendance: true,
        }),
        closeViewAttendanceModal: assign({
          modalViewAttendance: false,
        }),
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
          filteredAttendance: (_, event) => {
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
          // currentAttendance: (context, event) => event.currentEvent.attendance,
          // filteredAttendance: (context, event) => event.currentEvent.attendance,
          // filteredAttendance: (context, event) => {
          //   if (event.currentEvent.attendance === undefined) return [];
          //   else return Object.keys(event.currentEvent.attendance);
          // },
        }),
        filterCurrentAttendance: assign({
          filteredAttendance: (context, event) => {
            return context.currentAttendance.filter((f) =>
              f.id.toLowerCase().includes(event.query.toLowerCase())
            );
          },
        }),
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
            return attendance;
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
