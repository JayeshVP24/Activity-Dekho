import { Timestamp } from "firebase/firestore";
import { createMachine, assign, sendParent, ActorRefFrom } from "xstate";
import { DateFilters } from "../../enums";
import { ClubType, EventType } from "../../types";
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
  currentAttendance?: string[];
  filteredAttendance?: string[];
  modalViewAttendance: boolean;
  loading: boolean;
  excelFileName?: string;
  attendance?: string[];
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
      newAttendance: Record<string, string>;
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
      excelStringArray: string[];
    }
  | { type: "ADD_ATTENDANCE.SUBMIT" }
  | { type: "FILTER_EVENTS_LIST"; query: string }
  | { type: "EVENT_DATE_FILTER"; dateFilters: {
    fromDate: Timestamp;
    toDate: Timestamp;
  } }
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

  /** @xstate-layout N4IgpgJg5mDOIC5QFEBuYB2AXWBiAwgDLICCASgPr4DyAcgCrIAa9A2gAwC6ioADgPawAlliH8MPEAA9EAWgCsAFkUA6AEzsAjAGY1mxQDZ2agwHZNAGhABPORvYrFADm1PTa3QE4Dn9u20AvgFWaJg4KgCSACLEuITUJFEc3EggAsKi4pIyCLKK2qpuxmrenvKapuyKVrYITmrqmvqmTlXySpr1QSHo2LAqAE5gWANCYKhCGFChfbgQ4mAqk6j8ANaLQyNj6ADGADYArgBG42GwyZLpImISqTmyFQYq2qaKJa7y7J6vntU2iJoTCpPNp5GY1KZPhVtGZuiAZuFNqNxpNpr0cHMFksMCt1oNhsjdocTujzpoUnxBNcsnc7JUVPJTKZQU1tJp5E55CYanJ9ConIZFOwDE5vPVjDo4Qj+kjtqjpbgwAMBvwBipeHsAIZYABmqoAtvitqd9sdTn0LqkrplbqB7qZfipOgYdE5AeZtN8eQg9A4ufJfOVFMydO0paSVBAhLANZrrPLSbhElEKMgAGrIBiWykZG7ZRCe+QqcwVNQacpON0Gb1Chw6ZyuZQ+V7ycNnSPR2PxqYK5MUEj0Ri0KIkWj4ZDZtJUm35hBNUwMkVqAUQpri+Q1+meepcxTeMzmTltvodmNa7tos64NMRZAAdX7g8zI7HE64l2nedpuTUbxU-i0ApXhcTwyxrEFi3aUwDDLNkAwqVtgnhCMozPOMEyvAAxCJCEYSh00zegAGUKEICIiLYd8rU-Gk7TkTxgW+ZwDHkGEITcZdvWXTR1EMUDPUBMx-EQnp21QrsMNmAiGAoEdGAobDcOQMhJ2tL86J-HQVBYjw2RKJQDHyP5aghBpf0ZIwXWcEFf2PcJxPPeVlVVXAyGQegyFvDNUwzBgiJUNyPIATVUmjbWkORmSeTxvDULlfE8TRPG9Fl-1Fdk3UUTQfGygw7P6EgIAgBEkyiFNpPoFQiGoIi3wpKdc1oiK520P1vjBDkORMbRtBSzkGSykEQXZJRFHylRCuK9FT0cqZMINUryt8yqiIAVQAIQAWQiSj6rUpqclYhiRVZdpRS0dkuOMZ4ssrUFvghQIkOlCaioRFRNSKySsHofgonWzEMEWZY1kWT6IHNLAsD+9bQsa8KcgqVQdAdepOVAvdQO9ToFyynTOm3JRlzG56I0m97we+37-sVZy1VjXUDQ+orIeh-64epBHEEUT5nlcLREpBdwQWMgsF09ZRPQFMxyk0cbwZIKHMAgTUMB2MBFsfIcX3HKr4lqjmZ2-Vri1XLxnHnD1vRg7QGVamK2SqGCYvlorFawZXVfV08JKmTb+BVvZNYHbXR111aAAV4kSVMmHHQhDfU5qXTrMUfFFGFvEsf4EEhBo3jeAUtEMSpPFdiB3c9tXFnQUYdSEC9kCkdWg-mIHsVxGulSEHVrDAZuwD2RODsQGDVBTwswUrJpkpzzR-CcG6XgqfRhpccvK4wFXq5UWue4b+UB6DpUVXprVGYGQ0997-uW+HrmEFcBpvCFINRV8MxvTdRedygqpuPXqTdsCslZby9mDL6UxN7b3VtTAGbdgY4lBszFWoCYHDBhvfWcJhVAwmUKKPcJR8icm9NuBoMJ2BuCJhUdgrEN5oPASg1E0DwFwNpqfdU589SXxQdqD2YDq5s1hlRHMnNZyckXixPcLRyjtC+LPWoLEeIcjZE0N4pR2T0P4egn2s0oBpk1HsIQxUj7ByfMOMOyAVBrS2jtLB34HrPHMB4F0BgCgBl6nPXKps3gVCKG4li40JhgAAO7MIYdXAg+tkAUBvPeLWz5LH2I0rINkTwXTZTKAGFwAoNw5zcAxEwTgWIy0rGPIJYwwlQIierTWdAYkh2fMgOqH54azjyNuBklRhS-jcfkBRiB6g8SKS6X4lRXCANEieYJVSoAsMiVEZAxB5KNOHM05JzUFBZW0m4jQ9QAkGDcd6JQtsMZukZHxdweUgHTMqeE7R4DcCKTwgkixr4Nn3BMDxXZlCMaE1Yt6SERZfyAiJsGPwnpy6omoEDaBYANYII7sg8GCw+HK3hUIj5chGSLziuYFRrxdBgmthybSxgC6-AhMyJwUKpgwrAHCjWJ9VScO1Nww0KKgZoq3hizBIiGpiO-LIJki9fguB8C6UUbhqw5xik8AU24XCVEMr4J6UzwgLEZfNS+dTaANPMYsqxNjtq7VaYKlJAoFy-DKLQl0MieqAu+E6dkfFillgFCTdV-QIZ7GGPc9FCKsQgzxC9H1frqnaPhQgEGOxtQ3GSFi3InwGJlCZHFZcKdhR9VUMuDwXwWKHkBONMNogI0BvYSyhm7KVChsHuGuZaCo0xrjeIBN-L9oP1kKBZRy5smtHKJCAZCAlHqB6rIiFgJKHyyGEFfgBwiIHCGLgRZyz9Xa2aSoIKyAiKJq7T4bS+hDCjRMCe45fh+Q4LcQ6HmPNp1gFnfOxdGsV3uTXU0qxtBqC7vcAuB0MFwStCJTWJQwJhT-KaFUfQ1ykIYADnASQ0ozVGxSTobKZLlAlBBD1KV3pUkm1io2X8opXhqHGtEYgSGk73B5rbZsQp6iQh0J-HOwrF4WVatSswuhPXIXbLKFEPZSSUZHkm3w-4qhVCMpQ6CMraidCLDJvcwp8jCk6Dx0NnY9GIeom0oVSVF7MhisKViBRKxOBSjFBk2SJaGQtsKYtmn0I9jpsJztYqbprlyewcwlCUo9WeDQ5c3GRTBnGuTdErnZxuP5G6ZkyqINxVFj+fIjgbbQQkSCIw6myZvWmqhPR2r9SRe-MGHi3x9DSbBICFwuGRrAjS8vShBRSM3PCOFsITDBNhDgcVjSTQeLTzi6p+eiXAVOhTpCaybjsp7i0VXdWvXmo9VUC-Wh+h37ClMMcnmTouQujBNJrJc2BHewck5qA-tA6LcOilsoV6AxlEMCKa2uhtJ7bBCLbjLWvUoPmd7a+B8exH2u6PV7zW-CQlGZdWV3nnguDA8GZVkzeMnhAQ8nelMy0nbAD1nT5rmrOAaO4E91WdIvGxvpgL88mhmCXIlY7OizsXgMUYkxLdFvQ14ACeeObfweAY2k4MVhfU6iwIgUCorPRii+YSvJRx+BQ34EVuc7IzJ86fiGQyW2QCjCgAACzF3OKoku5X7KRjCKwYSIBYD1wCDQ4m-CO6dxdKweuwBCH14b5wVgcgS+BFLpcdr8h5Lkzz9Q6uBczdMBU0J-rscg9yKCBwOSn5Cnni8Ao1sduvGq0lQyEJfi0qgPSxlCeHgmCeBh9K8UVVf33foNiGbVPOHGpqxtYBCtl4DHWXQOgtB+C5N50h10kp4LeCxco3ni11tLQ2yNYAy+CUkZJzDPVXDbmOVpWnlzAJjrvQ+hdQwy-p2BPpglXJte1BOcCIj7JXjNhMEEIIQA */
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
        attendance: undefined,
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
              actions: ["addSelectedEventToContext", "openAddAttendanceModal"],
            },

            VIEW_ATTENDANCE: {
              target: "viewingAttendance",
              actions: [
                "openViewAttendanceModal",
                "addSelectedEventAndAttendanceToContext",
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
                  actions: "addErrorMsgToContext",
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

            ADD_ONE_ATTENDEE: "oneAttendeeForm",
            DELETE_ATTENDEE: "areYouSure",

            FILTER_ATTENDANCE: {
              target: "viewingAttendance",
              internal: true,
              actions: "filterCurrentAttendance",
            },
          },

          entry: "openViewAttendanceModal",
        },

        addingOneAttendee: {
          invoke: {
            src: "addOneAttendeeToDB",
            id: "addoneattendeetoDB",

            onDone: {
              target: "viewingAttendance",
              actions: [
                "modifyCurrentEventInContext",
                "alertOneAttendeeAdded",
                "clearAttendeeFromContext",
              ],
            },

            onError: {
              target: "oneAttendeeForm",
              actions: "addErrorMsgToContext",
            },
          },

          entry: "setLoadingTrue",
          exit: "setLoadingFalse",
        },

        oneAttendeeForm: {
          on: {
            "ADD_ONE_ATTENDEE.SUBMIT": {
              target: "addingOneAttendee",
              actions: ["clearErrorMsgFromContext", "addAttendeeToContext"],
            },
          },
        },

        deletingAttendee: {
          invoke: {
            src: "deleteOneAttendeeFromDB",

            onDone: {
              target: "viewingAttendance",
              actions: [
                "modifyCurrentEventInContext",
                "clearAttendeeFromContext",
                "alertOneAttendeeDeleted",
              ],
            },

            onError: {
              target: "areYouSure",
              actions: "addErrorMsgToContext",
            },
          },

          entry: "setLoadingTrue",
          exit: "setLoadingFalse",
        },

        areYouSure: {
          on: {
            "DELETE_ATTENDEE.YES": {
              target: "deletingAttendee",
              actions: ["addAttendeeToContext", "clearErrorMsgFromContext"],
            },
            "DELETE_ATTENDEE.NO": {
              target: "viewingAttendance",
              actions: "clearAttendeeFromContext",
            },
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
        eventsNotEmpty: (context, event) => {
          // console.log("event.data: ", event)
          return event.data.length > 0;
        },
      },
      services: {
        verifyExcel: (context, event) => {
          return new Promise((resolve, reject) => {
            const arr = event.excelStringArray;
            console.log("size", arr.length);
            if (arr.length === 0) {
              reject("Empty attendance, please check the sample format");
              return;
            }
            if (arr.length >= 200) {
              reject(`Limit on Students UID in one Excel Upload is 200!`);
              return;
            }
            const regex = new RegExp("^\\d{2}-[A-Z]+\\d{2}-\\d{2}$", "s");
            let valid: boolean = true;
            console.log("arrayy  ", arr);
            for (let i = 0; i < arr.length; i++) {
              console.log(i, regex.test(arr[i]));
              if (regex.test(arr[i]) == false) {
                valid = false;
                break;
              }
            }
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
          attendance: (_) => undefined,
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
              f.name.toLowerCase().includes(event.query.toLowerCase())
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
        alertOneAttendeeAdded: assign({
          alert: (_) => `One Attendee added`,
        }),
        alertOneAttendeeDeleted: assign({
          alert: (_) => `One Attendee deleted`,
        }),
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
          currentAttendance: (context, event) =>
            Object.keys(event.currentEvent.attendance),
          filteredAttendance: (context, event) =>
            Object.keys(event.currentEvent.attendance),
        }),
        filterCurrentAttendance: assign({
          filteredAttendance: (context, event) =>
            context.currentAttendance.filter((f) =>
              f.toLowerCase().includes(event.query.toLowerCase())
            ),
        }),
        clearSelectedEventFromContext: assign({
          currentEvent: (_) => undefined,
        }),
        addExcelToContext: assign({
          excelFileName: (_, event) => event.excelFileName,
          attendance: (_, event) => event.excelStringArray,
        }),
        clearExcelFromContext: (context, event) => {
          (context.attendance = undefined), (context.excelFileName = undefined);
        },
        addAttendeeToContext: assign({
          attendee: (_, event) => event.attendee,
        }),
        clearAttendeeFromContext: assign({
          attendee: (_) => undefined,
        }),
        addNewEventFormToContext: assign({
          newEvent: (_, event) => event.newEvent,
        }),
        modifyCurrentEventInContext: (context, event) => {
          console.log(event.data);
          // @ts-ignore
          context.currentEvent.attendance = event.data.newAttendance as Record<
            string,
            string
          >;
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
