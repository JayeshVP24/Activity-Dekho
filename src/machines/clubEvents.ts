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
  addEventToDB: TFetch;
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
  | { type: "CLEAR_CONTEXT" };

//   | { type: "done.invoke.retrieveclubevents", data: EventType[]}
//   | {type: "events.actions.checkAuthAndAddToContext", club: ClubType | undefined}
//   | {type: "events.actions.checkAuthAndAddToContext", club}
const ClubEventMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QFEBuYB2AXWA6AkgCIAyyAxAMIASyFA0gPoCCAqgCpUDaADALqKgADgHtYASyxjhGASAAeiALQBWAEyrcqgMzctANgAcARj3cjATlXKANCACeiIwdzKtWiwBZlHvVoDseqrcBgC+IbZomDgEJOTUtIysHJxG-EggIuKS0rIKCIq+Rrh+Wsp+yoG++h4etg4IRh7O+tx6JcH65soGfmER6Nh4AE5gWCOoYhhQkYNkENJguJOowgDWiyNjYmDoAMYANgCuAEY7UbA8aUKiElIy6XmKRgG4-h6q5loGytzmfh7mWr2RyqPS4T4VPyqcpmEptPogGbRTbjSbTAY4OYLJYYFbrXAo7Z7I6nDEXVKyTK3HIPJTQ7guPwlZRGIzubpqPR1JSNXAGHweVoGcyGIKqNkIpHDUaoqZSshgIZDYRDXCCfYAQywADMVQBbAkyolgA4nM6DS6Um7Ze6gR5+QG4Jx6NnGaFsv7chDihlqZTmbgsjwlNnKZSSsm4CBiWDqjV2NHypiEQgMZAANWQADk2Jb0lSbblEFousVWVCgiyDMYucCEIKGWyml8ano-l4I+cozG4wm5WSyMnU0w2Gxs4QmFmKMg89csnciwgerhA40DG49CyWqove8tK9VB4jGGtF4DKYRZ3Bt3Y5q++jzmR0-hkAB1Zij8eT6ezjLWhe0vk2h+K8BjqOouiHuubK7mGoFfE4PzmMKfihOEiKRtGt7xomSoqmQABKyBsARL6ZmmmY5gAyrgREkQAmr+BYAXaSh+MeuB6ACh7mCKXznl6pQMlCJbcIGoLIUe4boVKuBMBAEBIjed5ogAYvqg4phR2ZsLgVEsAAQgAsvguZ8Fa840qxCCuOYnHGKG3QBqyNh1mKrxHtWpR-NCWhXtE8mKRiuAagpiYYmwwiEAZWIYIsyxrIsoUQOaWBYFFBlMf+VnyI4-xOv4yGqN8lgApYXpOCBR6buKwrfO8-L+XggVKcl4VRJF0UKnhqpxjq+ohQpqXpdFWWWbauX1j8rxfGY5gWP4HynoJIEljUJb8m0LJGE1g0QEwaWYBAGoYLsixYb2aJGcIx37Jpw6flmE5TsguAsAACsQADyyZpgAGtOxBjdSE15C6jYiueyGfG2LpeuUGjvA1gqNG0vy7clB1YEdJ1nbg6BDGI2piPeyByGdd3zHFOJ4osBNE3YYDk2A+zA4WgGBB4nFGLoXQVNWrLmBVujNB4-jPI0nxOH5MmRpjh0YMdp104qRMk4mzN3Yqyq9Zq-VDAa9Paozmtsyxk1fBoIqCkGwoBm0XrGM4YFhmU3ANdLGMKVjOPK3taI+4ruNgJ1MVU-FuKJXtWrY0HysjZl5n5tloOIKCXPVE0gKWICXyufURWvKYPTeOKfiBjL-RdvLsdK3jbVTIHdchxl3U62qeu6gb0cK83CdmzleRMgy3DtN03HrkyXp6L4TptgENTcB8YZoVX14TGAADuAe98HlDfVRyAMM+b4fmOT3fjOSdziDi6KKCYJmK2vzqIY5Tw6ymifMKwb-LxrS7Q3tvRuu9lb3QYF9LMR8Rzn0IMgK+Vw-zjTvgCZwbtWiHl8GLIWdYwJFFBOeTw5d+KVwwl2IBO9a57zgaQMcZ9xzwIHqnfI3gigzy0EEMCvgZ6+C9N4fcpVjBlB8D5PQXtoxTC+nFJuYAwCxQjrTPaCwY5HVkf3a+SDb6ARUCWTi5dXbnh8OofOiB2IaAdKJNQTgrDu3EWiKRYAZFyO1iqDuWou4GmSso3uaiMpMLvkyZwgJ1ywycMhAIXpeJgn5MhSerQAS6F2gsJx6kDbgMgdAx6cDXr6WMqZfx2j+QgWzj8CozxvhuHhn8J0x4RHnnUPyDwu0Ur7FGJQ1Rcjw40yjrJFpbSQG11kQgBKuwtR3EuAU6yKhfjgjKFCNQhCxK1nqC2TQYEdAijKE4Iwqhmks36VAJxbdXF9Q8bgXp+zJADI6cMyOoybQTI0cxQeShLBFAWf6asq5yg4PqJufBbgWQ-F0Ds4IGMRj0WEIcKihwRhkBocRTJsD4G4HosgKikzJqKBFHZF0rZvDvEqDuOswK+Tp18A6LwHZZbVwhVCmFcKEV0JgQw16WYvqYvtNCYoIpQRQgMJBExU0ub22QmGVk7tUZhHQhgG6cBZBSgsloqZbITCcXdu8XibgvjIS9IodwYJ3jFUPMEUwYsAi7SIKQJV7MpmCjBOxFyYkvA83fnWJ4YFub-HUOxNoSNpJr2RDKHY7VBg2vNo8IMK5vBL2+FYascM3IcJXDzbBbYRE7RpdeAA4sINEkUqDCD1GAd6GoYDhpefkJkdknDmtKpYYwWg9VFFPOKBp2hTztiXs0nsKl+znArcwp4FQv721RrZRoQqhLFG0AGcSbZ+THh7dhUmPVB132CR5Vk1YvCjx5gYQSbhXjPFjRwnwRTdotQxOujm+4BYlHLi6HmVggT1CeO4PkfFDAmBdJufQl6FJKSwn2qAqS9Q3usgCMEa4vJVncKPIVigaivC-SeIIrbDwAaClEf2-bsChwg5NVkRR73+FaBKl98M56uu8MKQoXFzDiKbsHQjeQ3Aiq4quLO9s-B8K8E6Tk-CxILUzYGvANdfZ4wuiB66t1WOIH4bMil-oug+EMNPZNNVNxtlPGe3ZWbogSbjnjI26s5Sa3kwgXwGhW1iXKC6eaQqAyrXXK0QEw9DCkNkkZ5uuHDmgLOgR5OyDAILOKNpj4MJWRfAqjzaJx4OFhmhO0fTYn8bbGAf5qhytLP6uCHyJezI92UtfQpgMmgjy-FqRUDhqWyHXgblABxTjcs7NcOCMJm5WjapKI7bQfISiWEWhXCwSTpE+LAGB3L-pGwcLZGYMSahR6RKXk6GGNRQTitHns1pVyssdNawQ9VG2tVuDqnwtkeiuLzzMNqgN9XDN0uhbCsAuWF0dbFZPNQvGSVi3BFBY8-x56gkva0oYWBLPOZ5YUbOIoF56oaf9411Y-RzMY9KoAA */

  /** @xstate-layout N4IgpgJg5mDOIC5QFEBuYB2AXWA6AkgCIAyyAxAMIASyFA0gPoCCAqgCpUDaADALqKgADgHtYASyxjhGASAAeiALQBWAEyrcqgMzctANgAcARj3cjATlXKANCACeiIwdzKtWiwBZlHvVoDseqrcBgC+IbZomDgEJOTUtIysHJxG-EggIuKS0rIKCIq+Rrh+Wsp+yoG++h4etg4IRh7O+tx6JcH65soGfmER6Nh4AE5gWCOoYhhQkYNkENJguJOowgDWiyNjYmDoAMYANgCuAEY7UbA8aUKiElIy6XmKRgG4-h6q5loGytzmfh7mWr2RyqPS4T4VPyqcpmEptPogGbRTbjSbTAY4OYLJYYFbrXAo7Z7I6nDEXVKyTK3HIPJTQ7guPwlZRGIzubpqPR1JSNXAGHweVoGcyGIKqNkIpHDUaoqZSshgIZDYRDXCCfYAQywADMVQBbAkyolgA4nM6DS6Um7Ze6gR5+QG4Jx6NnGaFsv7chDihlqZTmbgsjwlNnKZSSsm4CBiWDqjV2NHypiEQgMZAANWQADk2Jb0lSbblEFousVWVCgiyDMYucCEIKGWyml8ano-l4I+cozG4wm5WSyMnU0w2Gxs4QmFmKMg89csnciwgerhA40DG49CyWqove8tK9VB4jGGtF4DKYRZ3Bt3Y5q++jzmR0-hkAB1Zij8eT6ezjLWhe0vk2h+K8BjqOouiHuubK7mGoFfE4PzmMKfihOEiKRtGt7xomSoqmQABKyBsARL6ZmmmY5gAyrgREkQAmr+BYAXaSh+MeuB6ACh7mCKXznl6pQMlCJbcIGoLIUe4boVKuBMBAEBIjed5ogAYvqg4phR2ZsLgVEsAAQgAsvguZ8Fa840qxCCuOYnHGKG3QBqyNh1mKrxHtWpR-NCWhXtE8mKRiuAagpiYYmwwiEAZWIYIsyxrIsoUQOaWBYFFBlMf+VnyI4-xOv4yGqN8lgApYXpOCBR6buKwrfO8-L+XggVKcl4VRJF0UKnhqpxjq+ohQpqXpdFWWWbauX1j8rxfGY5gWP4HynoJIEljUJb8m0LJGE1g0QEwaWYBAGoYLsixYb2aJGcIx37Jpw6flmE5TsguAsAACsQADyyZpgAGtOxBjdSE15C6jYiueyGfG2LpeuUGjvA1gqNG0vy7clB1YEdJ1nbg6BDGI2piPeyByGdd3zHFOJ4osBNE3YYDk2A+zA4WgGBB4nFGLoXQVNWrLmBVujNB4-jPI0nxOH5MmRpjh0YMdp104qRMk4mzN3Yqyq9Zq-VDAa9Paozmtsyxk1fBoIqCkGwoBm0XrGM4YFhmU3ANdLGMKVjOPK3taI+4ruNgJ1MVU-FuKJXtWrY0HysjZl5n5tloOIKCXPVE0gKWICXyufURWvKYPTeOKfiBjL-RdvLsdK3jbVTIHdchxl3U62qeu6gb0cK83CdmzleRMgy3DtN03HrkyXp6L4TptgENTcB8YZoVX14TGAADuAe98HlDfVRyAMM+b4fmOT3fjOSdziDi6KKCYJmK2vzqIY5Tw6ymifMKwb-LxrS7Q3tvRuu9lb3QYF9LMR8Rzn0IMgK+Vw-zjTvgCZwbtWiHl8GLIWdYwJFFBOeTw5d+KVwwl2IBO9a57zgaQMcZ9xzwIHqnfI3gigzy0EEMCvgZ6+C9N4fcpVjBlB8D5PQXtoxTC+nFJuYAwCxQjrTPaCwY5HVkf3a+SDb6ARUCWTi5dXbnh8OofOiB2IaAdKJNQTgrDu3EWiKRYAZFyO1iqDuWou4GmSso3uaiMpMLvkyZwgJ1ywycMhAIXpeJgn5MhSerQAS6F2gsJx6kDbgMgdAx6cDXr6WMqZfx2j+QgWzj8CozxvhuHhn8J0x4RHnnUPyDwu0Ur7FGJQ1Rcjw40yjrJFpbSQG11kQgBKuwtR3EuAU6yKhfjgjKFCNQhCxK1nqC2TQYEdAijKE4Iwqhmks36VAJxbdXF9Q8bgXp+zJADI6cMyOoybQTI0cxQeShLBFAWf6asq5yg4PqJufBbgWQ-F0Ds4IGMRj0WEIcKihwRhkBocRTJsD4G4HosgKikzJqKBFHZF0rZvDvEqDuOswK+Tp18A6LwHZZbVwhVCmFcKEV0JgQw16WYvqYvtNCYoIpQRQgMJBExU0ub22QmGVk7tUa7SYK0oYWAQqyqwF9bU2pBykAImZRBzzmFdFWnxdQFhAzlD8F6RQDpwQNPFjzVobhV5kOvDKxU8qNSKqkWQKibAvrvWYOqzVFktHWR5rPAV+hoRdA+LE01ZRwRslDMYHQWzzBhHQhgG6cBZBSn9ezKZsawSmBqBGtwXxkKmvcGCd4xVgzBHLsKXZNLrxEFIFm82jxBRgnYi5MSXgebvzrE8MC3N-jqHYm0JG0k17IhlDsdqgxm0vJYbyQMgpip+mrHDNyHCVw82wW2ERO163RAAOLCDRJFKgwg9RgHehqGAc7mFmvNU4MWDoeLFRgn2oop5xQNO0KedsS9mk9hUv2c4d677HjBBG1oqNbKNCFUJYo2gAziTbPyY8gHsKkx6mB7RwSPKsmrF4UePMDCCTcK8Z4S91yYKKdKhSSIcPWWDcYEo5cXQ8ysECeoTx3B8j4oYEwLpNz6Do0FKIykcJTFSXqRjk0ARgjXF5Ks7hR5CsUDUV4-GTxBC-YeUTrUwogewKHWTeRWRFAFqx6DHHvDwznj27wwpChcSTQevANdfZnVM8WU84IuKrizvbE1JKvBOk5PwsSC190Tvc97UBeMLrAagNdW63mbJi1mRS-0XQfCGGnpumqm42yng4e8cRTdg741VsTUmms0u+A0F+sS5QXTzSFQGVa65WiAmHoYUhskPNx3roZw58WW7RTSws4oRWPgwlZF8CqQa+THg4WGaE7Q60xfxtsYBo2qHKzS4oHQzsl7MmI5SrjiB-QMkPDzNrXgGubftdEBuUAHFOMOzs1wManM-CqP4LQjttB8hKJYRaFcLBJOkT4sA0nDvXYKuKHQ1q1Cj0iUvJ0MMC2bhZKPPZrSrl7Y6Z9ghnF3bvF4kWuqfC2R6K4vPMwRbx3Pfc3S6FsKwCHdQzGsVk81DBfqPwi1TRjz-HnqCaViq0soU049w1ZQKimoaRaytoJyk6cl06hVTrlXajS3zHlhRs4igXqaxoiMGlNFQmLHoXFNdyu13KqR+vQsljlwGBXyyeR2UsMVK1SzbVNOTUAA */

  /** @xstate-layout N4IgpgJg5mDOIC5QFEBuYB2AXWBiAwgDLICCASgPr4DyAcgCrIAa9A2gAwC6ioADgPawAlliH8MPEAA9EAWgCsAFkUA6AEzsAjAGY1mxQDZ2agwHZNAGhABPORvYrFADm1PTa3QE4Dn9u20AvgFWaJg4KgCSACLEuITUJFEc3EggAsKi4pIyCLKK2qpuxmrenvKapuyKVrYITmrqmvqmTlXySpr1QSHo2LAqAE5gWANCYKhCGFChfbgQ4mAqk6j8ANaLQyNj6ADGADYArgBG42GwyZLpImISqTmyFQYq2qaKJa7y7J6vntU2iJoTCpPNp5GY1KZPhVtGZuiAZuFNqNxpNpr0cHMFksMCt1oNhsjdocTujzpoUnxBNcsnc7JUVPJTKZQU1tJp5E55CYanJ9ConIZFOwDE5vPVjDo4Qj+kjtqjpbgwAMBvwBipeHsAIZYABmqoAtvitqd9sdTn0LqkrplbqB7qZfipOgYdE5AeZtN8eQg9A4ufJfOVFMydO0paSVBAhLANZrrPLSbhElEKMgAGrIBiWykZG7ZRCe+QqcwVNQacpON0Gb1Chw6ZyuZQ+V7ycNnSPR2PxqYK5MUEj0Ri0KIkWj4ZDZtJUm35hBNUwMkVqAUQpri+Q1+meepcxTeMzmTltvodmNa7tos64NMRZAAdX7g8zI7HE64l2nedpuTUbxU-i0ApXhcTwyxrEFi3aUwDDLNkAwqVtgnhCMozPOMEyvAAxCJCEYSh00zegAGUKEICIiLYd8rU-Gk7TkTxgW+ZwDHkGEITcZdvWXTR1EMUDPUBMx-EQnp21QrsMNmAiGAoEdGAobDcOQMhJ2tL86J-HQVBYjw2RKJQDHyP5aghBpf0ZIwXWcEFf2PcJxPPeVlVVXAyGQegyFvDNUwzBgiJUNyPIATVUmjbWkORmSeTxvDULlfE8TRPG9Fl-1Fdk3UUTQfGygw7P6EgIAgBEkyiFNpPoFQiGoIi3wpKdc1oiK520P1vjBDkORMbRtBSzkGSykEQXZJRFHylRCuK9FT0cqZMINUryt8yqiIAVQAIQAWQiSj6rUpqclYhiRVZdpRS0dkuOMZ4ssrUFvghQIkOlCaioRFRNSKySsHofgonWzEMEWZY1kWT6IHNLAsD+9bQsa8KcgqVQdAdepOVAvdQO9ToFyynTOm3JRlzG56I0m97we+37-sVZy1VjXUDQ+orIeh-64epBHEEUT5nlcLREpBdwQWMgsF09ZRPQFMxyk0cbwZIKHMAgTUMB2MBFsfIcX3HKr4lqjmZ2-Vri1XLxnHnD1vRg7QGVamK2SqGCYvlorFawZXVfV08JKmTb+BVvZNYHbXR111aAAV4kSVMmHHQhDfU5qXTrMUfFFGFvEsf4EEhBo3jeAUtEMSpPFdiB3c9tXFnQUYdSEC9kCkdWg-mIHsVxGulSEHVrDAZuwD2RODsQGDVBTwswUrJpkpzzR-CcG6XgqfRhpccvK4wFXq5UWue4b+UB6DpUVXprVGYGQ0997-uW+HrmEFcBpvCFINRV8MxvTdRedygqpuPXqTdsCslZby9mDL6UxN7b3VtTAGbdgY4lBszFWoCYHDBhvfWcJhVAwmUKKPcJR8icm9NuBoMJ2BuCJhUdgrEN5oPASg1E0DwFwNpqfdU589SXxQdqD2YDq5s1hlRHMnNZyckXixPcLRyjtC+LPWoLEeIcjZE0N4pR2T0P4egn2s0oBpk1HsIQxUj7ByfMOMOyAVBrS2jtLB34HrPHMB4F0BgCgBl6nPXKps3gVCKG4liWiq7ewcuhKYBijEmJbmY0Or4VCR2juVOOyAE4iIamIhx-UtAihFAJHJosEBDQZG6ecbgeb+HGhMMAAB3ZhDDq4EH1sgCgN57xa2fJY+xGlZBsieC6bKZQAwuAFBuHObgGImCcCxGWlYx6VLGLUqB9T1a4EUnhdpFjXxdOarIEwPE3EaFFL+QmrFvSQiLL+QERNgx+E9EEJCGAA5wEkNKD88NZyyBik8Aoa4RnsHMJQ70PSTaxWXvBMsBg8pAJPNEYgbyMndJ5rbZsQp6iQh0J-HOsgWgMmgq1ZkUzmS2WhYiAkcoeyknhUbbpAYHB+CFJLVF0Fqxz36syvcwp8jCk6CTUSJ5QmN0pdRd534HjbmLJ6D+rECiVicClGKDIhkS0MhbYU40BVOVPlSpO9xfiLx+Z0P5AK5U5x6rbNklRly6EMAKUw41ybom1SPBAbj+RumZJUfpxglBAt-LbQwHgHbz3ulCvl4QHVhBmmEqA81L5OofsGHi3x9CUMhC6K1QKRrAhth6+eLg3j2retNSmFKwhwPjbOJoPFp4eu5fPOKBSFzZXnpCaybjsp7iCQI9WFbjYFGza-fQ79hSmG9EoIs7Juo6CAtuMuJL+ggO0YwjVfsA6GN7RpJQtsyhuMhDFAyIpra6G0lyaZItrVqC7To6+B8exHw3cnY9BR7BpqSpdHOvhxYuGFL8JkwpAFhoXW7ZZECoxLKXdXctwqEXNWcA0dwJg9DLh0i8bGSV9VNAumYJciUr3Ls7HoiJxim4twfdDXgAJ56qDLG8J+IZDKjpAHsMAOosCIFAovIaYo9mvFBFYI4-Aob8H1JRrk6hfweDRb04MVhRhQAABZsbnFUTjkqlwul4yy2pEAsDyYBBof8fgjPGb8E0Kw8mwBCAU0p5wVgcgceBGp+oGn8ijNqJh6jEm6PSbtfO3eCy6kQZ7dB6lOzazFlKcuX8bjPiMcUT1f8xMIRfGgsKKFQQgA */
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
            onDone: [
              {
                target: "displayingEvents",
                actions: "addEventsListToContext",
                cond: "eventsNotEmpty",
              },
              {
                target: "AddEvent",
                actions: "openAddEventModal",
              },
            ],
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
        eventsNotEmpty: (context, event) => {
          // console.log("event.data: ", event)
          return event.data.length > 0;
        },
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
