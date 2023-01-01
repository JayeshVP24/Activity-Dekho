import { createMachine, assign, sendParent, ActorRefFrom } from "xstate";
import { ClubType, EventType } from "../../types";

interface newEventInterface {
  name: string;
  startDate: Date;
  endDate: Date;
}

export interface ClubEventContext {
  errorMsg?: string;
  events?: EventType[];
  currentEvent?: EventType;
  newEvent?: newEventInterface;
  attendance?: unknown;
  attendee?: string;
  modalAddEvent: boolean;
  modalAddAttendance: boolean;
  alert?: string;
  currentAttendance?: Set<string>;
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

type ClubEventServices =  {
    retrieveClubEvents: {
      data: EventType[] | string;
    };
    retrieveAttendance: {
      data: Set<string> | string;
    };
    addEventToDB: TFetch;
    verifyExcel: TFetch;
    addingAttendanceToDB: TFetch;
    addOneAttendeeToDB: TFetch;
    deleteAttendeeFromEvent: TFetch;
  }

type ClubEventEvents =
  //   | { type: "CHECK_AUTH"; club: ClubType | undefined }
  | { type: "LOAD" }
  | { type: "ADD_EVENT" }
  | { type: "ADD_EVENT.SUBMIT"; newEvent: newEventInterface }
  | { type: "ADD_ATTENDANCE"; currentEvent: EventType }
  | { type: "ADD_ATTENDANCE.UPLOAD_EXCEL"; excel: unknown }
  | { type: "VIEW_ATTENDANCE"; currentEvent: EventType }
  | { type: "CLOSE_VIEW_ATTENDANCE" }
  | { type: "ADD_ONE_ATTENDEE" }
  | { type: "ADD_ONE_ATTENDEE.SUBMIT"; attendee: string }
  | { type: "DELETE_ATTENDEE" }
  | { type: "DELETE_ATTENDEE.YES"; attendee: string }
  | { type: "DELETE_ATTENDEE.NO" }
  | { type: "RETRIEVE_EVENTS.RETRY" }
//   | { type: "done.invoke.retrieveclubevents", data: EventType[]}
//   | {type: "events.actions.checkAuthAndAddToContext", club: ClubType | undefined}
//   | {type: "events.actions.checkAuthAndAddToContext", club}
const ClubEventMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QFEBuYB2AXWA6AkgCIAyyAxAMIASyFA0gPoCCAqgCpUDaADALqKgADgHtYASyxjhGASAAeiALQBWAEyrcqgMzctANgAcARj3cjATlXKANCACeiIwdzKtWiwBZlHvVoDseqrcBgC+IbZomDgEJOTUtIysHJxG-EggIuKS0rIKCIq+Rrh+Wsp+yoG++h4etg4IRh7O+tx6JcH65soGfmER6Nh4AE5gWCOoYhhQkYNkENJguJOowgDWiyNjYmDoAMYANgCuAEY7UbA8aUKiElIy6XmKRgG4-h6q5loGytzmfh7mWr2RyqPS4T4VPyqcpmEptPogGbRTbjSbTAY4OYLJYYFbrXAo7Z7I6nDEXVKyTK3HIPJTQ7guPwlZRGIzubpqPR1JSNXAGHweVoGcyGIKqNkIpHDUaoqZSshgIZDYRDXCCfYAQywADMVQBbAkyolgA4nM6DS6Um7Ze6gR5+QG4Jx6NnGaFsv7chDihlqZTmbgsjwlNnKZSSsm4CBiWDqjV2NHypiEQgMZAANWQADk2Jb0lSbblEFousVWVCgiyDMYucCEIKGWyml8ano-l4I+cozG4wm5WSyMnU0w2Gxs4QmFmKMg89csnciwgerhA40DG49CyWqove8tK9VB4jGGtF4DKYRZ3Bt3Y5q++jzmR0-hkAB1Zij8eT6ezjLWhe0vk2h+K8BjqOouiHuubK7mGoFfE4PzmMKfihOEiKRtGt7xomSoqmQABKyBsARL6ZmmmY5gAyrgREkQAmr+BYAXaSh+MeuB6ACh7mCKXznl6pQMlCJbcIGoLIUe4boVKuBMBAEBIjed5ogAYvqg4phR2ZsLgVEsAAQgAsvguZ8Fa840qxCCuOYnHGKG3QBqyNh1mKrxHtWpR-NCWhXtE8mKRiuAagpiYYmwwiEAZWIYIsyxrIsoUQOaWBYFFBlMf+VnyI4-xOv4yGqN8lgApYXpOCBR6buKwrfO8-L+XggVKcl4VRJF0UKnhqpxjq+ohQpqXpdFWWWbauX1j8rxfGY5gWP4HynoJIEljUJb8m0LJGE1g0QEwaWYBAGoYLsixYb2aJGcIx37Jpw6flmE5TsguAsAACsQADyyZpgAGtOxBjdSE15C6jYiueyGfG2LpeuUGjvA1gqNG0vy7clB1YEdJ1nbg6BDGI2piPeyByGdd3zHFOJ4osBNE3YYDk2A+zA4WgGBB4nFGLoXQVNWrLmBVujNB4-jPI0nxOH5MmRpjh0YMdp104qRMk4mzN3Yqyq9Zq-VDAa9Paozmtsyxk1fBoIqCkGwoBm0XrGM4YFhmU3ANdLGMKVjOPK3taI+4ruNgJ1MVU-FuKJXtWrY0HysjZl5n5tloOIKCXPVE0gKWICXyufURWvKYPTeOKfiBjL-RdvLsdK3jbVTIHdchxl3U62qeu6gb0cK83CdmzleRMgy3DtN03HrkyXp6L4TptgENTcB8YZoVX14TGAADuAe98HlDfVRyAMM+b4fmOT3fjOSdziDi6KKCYJmK2vzqIY5Tw6ymifMKwb-LxrS7Q3tvRuu9lb3QYF9LMR8Rzn0IMgK+Vw-zjTvgCZwbtWiHl8GLIWdYwJFFBOeTw5d+KVwwl2IBO9a57zgaQMcZ9xzwIHqnfI3gigzy0EEMCvgZ6+C9N4fcpVjBlB8D5PQXtoxTC+nFJuYAwCxQjrTPaCwY5HVkf3a+SDb6ARUCWTi5dXbnh8OofOiB2IaAdKJNQTgrDu3EWiKRYAZFyO1iqDuWou4GmSso3uaiMpMLvkyZwgJ1ywycMhAIXpeJgn5MhSerQAS6F2gsJx6kDbgMgdAx6cDXr6WMqZfx2j+QgWzj8CozxvhuHhn8J0x4RHnnUPyDwu0Ur7FGJQ1Rcjw40yjrJFpbSQG11kQgBKuwtR3EuAU6yKhfjgjKFCNQhCxK1nqC2TQYEdAijKE4Iwqhmks36VAJxbdXF9Q8bgXp+zJADI6cMyOoybQTI0cxQeShLBFAWf6asq5yg4PqJufBbgWQ-F0Ds4IGMRj0WEIcKihwRhkBocRTJsD4G4HosgKikzJqKBFHZF0rZvDvEqDuOswK+Tp18A6LwHZZbVwhVCmFcKEV0JgQw16WYvqYvtNCYoIpQRQgMJBExU0ub22QmGVk7tUZhHQhgG6cBZBSgsloqZbITCcXdu8XibgvjIS9IodwYJ3jFUPMEUwYsAi7SIKQJV7MpmCjBOxFyYkvA83fnWJ4YFub-HUOxNoSNpJr2RDKHY7VBg2vNo8IMK5vBL2+FYascM3IcJXDzbBbYRE7RpdeAA4sINEkUqDCD1GAd6GoYDhpefkJkdknDmtKpYYwWg9VFFPOKBp2hTztiXs0nsKl+znArcwp4FQv721RrZRoQqhLFG0AGcSbZ+THh7dhUmPVB132CR5Vk1YvCjx5gYQSbhXjPFjRwnwRTdotQxOujm+4BYlHLi6HmVggT1CeO4PkfFDAmBdJufQl6FJKSwn2qAqS9Q3usgCMEa4vJVncKPIVigaivC-SeIIrbDwAaClEf2-bsChwg5NVkRR73+FaBKl98M56uu8MKQoXFzDiKbsHQjeQ3Aiq4quLO9s-B8K8E6Tk-CxILUzYGvANdfZ4wuiB66t1WOIH4bMil-oug+EMNPZNNVNxtlPGe3ZWbogSbjnjI26s5Sa3kwgXwGhW1iXKC6eaQqAyrXXK0QEw9DCkNkkZ5uuHDmgLOgR5OyDAILOKNpj4MJWRfAqjzaJx4OFhmhO0fTYn8bbGAf5qhytLP6uCHyJezI92UtfQpgMmgjy-FqRUDhqWyHXgblABxTjcs7NcOCMJm5WjapKI7bQfISiWEWhXCwSTpE+LAGB3L-pGwcLZGYMSahR6RKXk6GGNRQTitHns1pVyssdNawQ9VG2tVuDqnwtkeiuLzzMNqgN9XDN0uhbCsAuWF0dbFZPNQvGSVi3BFBY8-x56gkva0oYWBLPOZ5YUbOIoF56oaf9411Y-RzMY9KoAA */

  /** @xstate-layout N4IgpgJg5mDOIC5QFEBuYB2AXWA6AkgCIAyyAxAMIASyFA0gPoCCAqgCpUDaADALqKgADgHtYASyxjhGASAAeiALQBWAEyrcqgMzctANgAcARj3cjATlXKANCACeiIwdzKtWiwBZlHvVoDseqrcBgC+IbZomDgEJOTUtIysHJxG-EggIuKS0rIKCIq+Rrh+Wsp+yoG++h4etg4IRh7O+tx6JcH65soGfmER6Nh4AE5gWCOoYhhQkYNkENJguJOowgDWiyNjYmDoAMYANgCuAEY7UbA8aUKiElIy6XmKRgG4-h6q5loGytzmfh7mWr2RyqPS4T4VPyqcpmEptPogGbRTbjSbTAY4OYLJYYFbrXAo7Z7I6nDEXVKyTK3HIPJTQ7guPwlZRGIzubpqPR1JSNXAGHweVoGcyGIKqNkIpHDUaoqZSshgIZDYRDXCCfYAQywADMVQBbAkyolgA4nM6DS6Um7Ze6gR5+QG4Jx6NnGaFsv7chDihlqZTmbgsjwlNnKZSSsm4CBiWDqjV2NHypiEQgMZAANWQADk2Jb0lSbblEFousVWVCgiyDMYucCEIKGWyml8ano-l4I+cozG4wm5WSyMnU0w2Gxs4QmFmKMg89csnciwgerhA40DG49CyWqove8tK9VB4jGGtF4DKYRZ3Bt3Y5q++jzmR0-hkAB1Zij8eT6ezjLWhe0vk2h+K8BjqOouiHuubK7mGoFfE4PzmMKfihOEiKRtGt7xomSoqmQABKyBsARL6ZmmmY5gAyrgREkQAmr+BYAXaSh+MeuB6ACh7mCKXznl6pQMlCJbcIGoLIUe4boVKuBMBAEBIjed5ogAYvqg4phR2ZsLgVEsAAQgAsvguZ8Fa840qxCCuOYnHGKG3QBqyNh1mKrxHtWpR-NCWhXtE8mKRiuAagpiYYmwwiEAZWIYIsyxrIsoUQOaWBYFFBlMf+VnyI4-xOv4yGqN8lgApYXpOCBR6buKwrfO8-L+XggVKcl4VRJF0UKnhqpxjq+ohQpqXpdFWWWbauX1j8rxfGY5gWP4HynoJIEljUJb8m0LJGE1g0QEwaWYBAGoYLsixYb2aJGcIx37Jpw6flmE5TsguAsAACsQADyyZpgAGtOxBjdSE15C6jYiueyGfG2LpeuUGjvA1gqNG0vy7clB1YEdJ1nbg6BDGI2piPeyByGdd3zHFOJ4osBNE3YYDk2A+zA4WgGBB4nFGLoXQVNWrLmBVujNB4-jPI0nxOH5MmRpjh0YMdp104qRMk4mzN3Yqyq9Zq-VDAa9Paozmtsyxk1fBoIqCkGwoBm0XrGM4YFhmU3ANdLGMKVjOPK3taI+4ruNgJ1MVU-FuKJXtWrY0HysjZl5n5tloOIKCXPVE0gKWICXyufURWvKYPTeOKfiBjL-RdvLsdK3jbVTIHdchxl3U62qeu6gb0cK83CdmzleRMgy3DtN03HrkyXp6L4TptgENTcB8YZoVX14TGAADuAe98HlDfVRyAMM+b4fmOT3fjOSdziDi6KKCYJmK2vzqIY5Tw6ymifMKwb-LxrS7Q3tvRuu9lb3QYF9LMR8Rzn0IMgK+Vw-zjTvgCZwbtWiHl8GLIWdYwJFFBOeTw5d+KVwwl2IBO9a57zgaQMcZ9xzwIHqnfI3gigzy0EEMCvgZ6+C9N4fcpVjBlB8D5PQXtoxTC+nFJuYAwCxQjrTPaCwY5HVkf3a+SDb6ARUCWTi5dXbnh8OofOiB2IaAdKJNQTgrDu3EWiKRYAZFyO1iqDuWou4GmSso3uaiMpMLvkyZwgJ1ywycMhAIXpeJgn5MhSerQAS6F2gsJx6kDbgMgdAx6cDXr6WMqZfx2j+QgWzj8CozxvhuHhn8J0x4RHnnUPyDwu0Ur7FGJQ1Rcjw40yjrJFpbSQG11kQgBKuwtR3EuAU6yKhfjgjKFCNQhCxK1nqC2TQYEdAijKE4Iwqhmks36VAJxbdXF9Q8bgXp+zJADI6cMyOoybQTI0cxQeShLBFAWf6asq5yg4PqJufBbgWQ-F0Ds4IGMRj0WEIcKihwRhkBocRTJsD4G4HosgKikzJqKBFHZF0rZvDvEqDuOswK+Tp18A6LwHZZbVwhVCmFcKEV0JgQw16WYvqYvtNCYoIpQRQgMJBExU0ub22QmGVk7tUa7SYK0oYWAQqyqwF9bU2pBykAImZRBzzmFdFWnxdQFhAzlD8F6RQDpwQNPFjzVobhV5kOvDKxU8qNSKqkWQKibAvrvWYOqzVFktHWR5rPAV+hoRdA+LE01ZRwRslDMYHQWzzBhHQhgG6cBZBSn9ezKZsawSmBqBGtwXxkKmvcGCd4xVgzBHLsKXZNLrxEFIFm82jxBRgnYi5MSXgebvzrE8MC3N-jqHYm0JG0k17IhlDsdqgxm0vJYbyQMgpip+mrHDNyHCVw82wW2ERO163RAAOLCDRJFKgwg9RgHehqGAc7mFmvNU4MWDoeLFRgn2oop5xQNO0KedsS9mk9hUv2c4d677HjBBG1oqNbKNCFUJYo2gAziTbPyY8gHsKkx6mB7RwSPKsmrF4UePMDCCTcK8Z4S91yYKKdKhSSIcPWWDcYEo5cXQ8ysECeoTx3B8j4oYEwLpNz6Do0FKIykcJTFSXqRjk0ARgjXF5Ks7hR5CsUDUV4-GTxBC-YeUTrUwogewKHWTeRWRFAFqx6DHHvDwznj27wwpChcSTQevANdfZnVM8WU84IuKrizvbE1JKvBOk5PwsSC190Tvc97UBeMLrAagNdW63mbJi1mRS-0XQfCGGnpumqm42yng4e8cRTdg741VsTUmms0u+A0F+sS5QXTzSFQGVa65WiAmHoYUhskPNx3roZw58WW7RTSws4oRWPgwlZF8CqQa+THg4WGaE7Q60xfxtsYBo2qHKzS4oHQzsl7MmI5SrjiB-QMkPDzNrXgGubftdEBuUAHFOMOzs1wManM-CqP4LQjttB8hKJYRaFcLBJOkT4sA0nDvXYKuKHQ1q1Cj0iUvJ0MMC2bhZKPPZrSrl7Y6Z9ghnF3bvF4kWuqfC2R6K4vPMwRbx3Pfc3S6FsKwCHdQzGsVk81DBfqPwi1TRjz-HnqCaViq0soU049w1ZQKimoaRaytoJyk6cl06hVTrlXajS3zHlhRs4igXqaxoiMGlNFQmLHoXFNdyu13KqR+vQsljlwGBXyyeR2UsMVK1SzbVNOTUAA */

  /** @xstate-layout N4IgpgJg5mDOIC5QFEBuYB2AXWA6ATmFvgJZiokZRqY4DEEA9hmLpaowNauHFnoBjADYBXAEblasANoAGALqJQAB0awSWEsyUgAHogC0ARgDsANlwBmEwBYATAE5LADgCssh7Yc2ANCACeiEZ2Fk6uZiZ2Ju6mlhEAvvF+NNh4vKTklNToqQzMrOxcPEQZgqISOTjSRopIIKrqmtp1+ggGUbK4riYmlq5GRpZGrm4hfoFtRja4zjZmNrJmzg5LdrJ2g4nJlWkl-Fkp9GD4+Iz4uMpCAIZYAGZnALYEe5LC4pKpcrUqahpaGDpWgYTN5cEZnGZBs5giZBp5xogNp1XHZXA5ZP0bL1Bq5XFsQIc8BASLBLld-AcdnQAIIAEVpAH1kAA1ZAAOQAKl8dA0-s1QK1LA5XLhYaY7Gt+s5oWYEQgFp1BjZnC4bHNPDY8UkCTtcMTSdcKVRCTT6QzqRyOezadS2QBhZDcuq8poAlqIZwmXAYqYquL9OLrOX2SxWOw2YauSyaiEeMz4wl6klko3ZKR0ZkASWQAHVzZbrbaHU6fo1-oDDMNOuHca41bizA4nLKAohlZ0XLisbDZFMUQndfqUwcTmc6AAlZAc8fZ1lM1mcgDKuEn04AmiX6r9XRW2rCRfMHOGm2YXBC5X1OpEhbIMSEHLNhgOpLhqRAIIck7BDVkAGKPU1GRZdkOVwRcAFUACEAFlMy5BQeW3ct3QQKMHFwJYBj6EZ0QGVw5TWOwrAjaU+k8KJLGfVJX3fT8rnfSlaA5RhaUgvIWDYDAOG4XB6IgD4sCwFjIM3F1kIFIJbDBawHzsNwjxsJs7DlcEvQjMwUXBB86zkmwqJwGiP0qXiGONSpmNYuhjlOc4yTuR4TP4yohNY0SkP5PQ23cKwXF7BwjCcSInF8VsEGsKxvBsIVZgifojH0vA+OpQTMAgK4MAEVghx-KhoMYNKhEA-MrTZG17WQXBwIABQAGQAeTpJkAA0HRqtyyw81pIUVFYIQfZsViMOVoiI+x7FmXs5hMDwEsc5KsFS9LMtwdBSFuEhU2QXRMsKpgOMKHjVpIW5-DAbawCEdq+TdCSEDMcMMKMWQhQbaUBgcFTnucYjrFMKYnHBSjtUTJKUowNKMtYI71s287Cuss4Lmuez8CeaHTrhq6dxQlwiJWBZMWWdEIjlaFvucVFcWm8bAdm0GFvBpbWD4rJ5sWyGLLYvaCi4opHJuBmIcylyRIQ513JuzyEBCaY4jVZZFMcKK3DlWSrDMWRPR00wMSB7YX3p9nlpZqg2cZjnhKs0dbOR+5Uf5sGhaIYSsfEqWek6WRegxWYjxVHo5TMU8wUbcw1XWYURlmigwAAd1Zx2mboO16sXZAGSzXNisLcrXc6wxLGero419uw5csOJSeDtEIgfL3bEbeLgd1GP49NxPIaKuq2XTi0StpZBHTF0trt3AxFO+7pb3uuZoyFUmNlwEIIQCrEvpVaOyDbqAzadugB5qqde4LUrB7zyWgTrIwMNPNYKdPIPTzlOtQwU6FunVSJ42bg3TKgOqWC7zAGAdiPNuLM3fPkAWqVgEi3PmPNCGFpq1ghHMCU+FQqwiIiCG8mkKbuD0j-aiJt-6AMdsAq2NkkY3Dtk8PiUDyHO1csPLcHUL6GB6N9bwKpGyQmWJ6FsEwTwzAnv7RYilnqzXyEAsA-5UZdx7tnU+FUIIwTgvAlCBhZhem8MKDEkITBuArsNTwYJhjqghBKWYhD9bUX4kIIgCdBYUO5pxcBuBEz2Mce3ZxYAECFAEDcf4XwNG3QMO4dCwoeiojkt1RYF5ZhLwpoXFY3RwTBFml4zQPiYEgIRjbGhDlPEXW8TvRh-jeaBNdCElhYl85tCPNfFE8lpQ+miB9UKGlr5lz6FWZ6wRNZ00IGuRgIhFwiEIPvZAh8rRKIHhVNcyBFyhKlgYFY6FIRqg0mqEIuzn63hmDLU8IJNSaiGWAEZYyJkgIPkfOZg9cBsjqisoEkQvQgnuhEOSz1UTBjrLgYm2k4qyAjHMWa6QwAkAoDk82mVQFuL5ukfgYBoGwrAC8wwZdpjPSWIY6aUR0TxMwSqDC-kApkwjFi8FJRIXQrKYLJO+TqEoyeEiyQqKnYYraCKaaERGwV2ScqeYz8Ii4CFUsdY4j+jf1sQZTMtJD50HqnSLl49owzHxY4Rs-RqYLyXgMLEzgQVdnBHYRI2oMD5TgDoQkiE2Fj0GEYCwGsdlNgri4B8cp2gBQisclwUwNKWBCLNeVh87Wj00ZqUMocFgU2iIMEmoVgST3MIXXoEJejhmpXwTIZkpDhuxmEzE3o6zrFGCMFeBEg3eielFdZ6om6yqJMmHKaZUgFrdkCYYFhHDEwDWhPsF5vLXkJSiRsj4tRNq-MOY01sO31LWcqYiAxpSai9k9ZwF4K5WB1nJINcxtGzTfEZWg872F3VDG9XovKBjrDrF6x1MwVhxBWL0Oetgj20WMvqVtciHhnt3IpCwvpSJSiGF7DBExx6y2fRpKMaxowShsTqF8x66J-0OJzADKEBjXyvdYRYt7UQhQmF6J1T1ojKmfU6xSdN3y7yZth26Fdpj4x9FR4mJhn6ajBGO6MY77DdDoxABjkNp2trygVJjUsX4AvCNYNEwo5hLEDtWjSIRwjBX3WaohBlDZopWscY6G0Dhw2k11atiHbzREhP5SDiB0RehcIXRs3ZFgb104lejHdjZ-1E5lLD4t7UoWaaKDS91PAxChCpJ6Fh35BtxFEb2Omp2tycUbMA5mC7eRVLl8MvZnq9BI4geYPLKXQnxgS5DIM-4ALADIrLkxUSvy0hpRY7regL0vb0I81hJRDAcFIshvi-2NfCeiaSGxC5PTvF7VW6wwTNh2XBijmSSnZPpbksbwQlgYRBfYN1ArPWhQDEg+YodezusnSh4hwzRnjMIGN8dALyUjAU1Ebjr9wzvwbuRGVN2DIQqheltF22oxdGVuiIYZdyKB16GKirs93CnnsOa+IQA */
  createMachine(
    {
      predictableActionArguments: true,
      id: "Events",

      schema: {
        events: {} as ClubEventEvents,
        context: {} as ClubEventContext,
        services: {} as ClubEventServices
      },

      context: {
        modalAddAttendance: false,
        modalAddEvent: false,
        errorMsg: undefined,
        alert: undefined,
        attendance: undefined,
        attendee: undefined,
        currentAttendance: undefined,
        currentEvent: undefined,
        events: undefined,
        newEvent: undefined,
      },

      tsTypes: {} as import("./clubEvents.typegen").Typegen0,

      states: {
        IDLE: {
          on: {
            LOAD: "retrievingEvents",
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
              target: "retreivingAttendance",
              actions: ["openViewAttendanceModal", "addSelectedEventToContext"],
            },
          },

          entry: [
            "clearSelectedEventFromContext",
            "clearCurrentAttendanceFromContext",
          ],
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
            },
          },

          initial: "dislayingForm",
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
                onDone: "addingAttendanceToDB",
                onError: {
                  target: "displayingModal",
                  actions: "addErrorMsgToContext",
                },
              },
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
                  target: "#Events.retrievingEvents",
                  actions: ["alertAttendanceAdded", "closeAddAttendaceModal"],
                },
              },
            },
          },

          initial: "displayingModal",
        },

        viewingAttendance: {
          on: {
            CLOSE_VIEW_ATTENDANCE: {
              target: "displayingEvents",
              actions: "closeViewAttendanceModal",
            },

            ADD_ONE_ATTENDEE: "oneAttendeeForm",
            DELETE_ATTENDEE: "areYouSure",
          },
        },

        addingOneAttendee: {
          invoke: {
            src: "addOneAttendeeToDB",
            id: "addoneattendeetoDB",

            onDone: {
              target: "retrievingEvents",
              actions: ["alertOneAttendeeAdded", "clearAttendeeFromContext"],
            },

            onError: {
              target: "oneAttendeeForm",
              actions: "addErrorMsgToContext",
            },
          },
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
              target: "retrievingEvents",
              actions: ["clearAttendeeFromContext", "alertOneAttendeeDeleted"],
            },

            onError: {
              target: "areYouSure",
              actions: "addErrorMsgToContext",
            },
          },
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

        retreivingAttendance: {
          invoke: {
            src: "retrieveAttendance",
            id: "retrieveattendance",
            onDone: {
              target: "viewingAttendance",
              actions: "addAttendanceToCurrentEvent",
            },
            onError: {
              target: "displayingEvents",
              actions: "addErrorMsgToContext",
            },
          },
        },
      },

      initial: "IDLE",
    },
    {
      guards: {
        // isLoggedIn: (_, event) => {
        //     console.log(event.club)
        //     console.log(event.club !== undefined)
        //     return event.club !== undefined
        // },
        eventsNotEmpty: (context, event) => {
            console.log("event.data: ", event)
            return event.data.length > 0},
      },
      actions: {
        // checkAuthAndAddToContext: assign({
        //   club: (_, event) => event.club,
        // }),
        addEventsListToContext: assign({
          events: (_, event) => event.data as EventType[],
        }),
        addErrorMsgToContext: assign({
          errorMsg: (_, event) => event.data as string,
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
          modalAddAttendance: true,
        }),
        closeViewAttendanceModal: assign({
          modalAddAttendance: false,
        }),
        addSelectedEventToContext: assign({
          currentEvent: (_, event) => event.currentEvent,
        }),
        clearSelectedEventFromContext: assign({
          currentEvent: (_) => undefined,
        }),
        addExcelToContext: assign({
          attendance: (_, event) => event.excel,
        }),
        addAttendeeToContext: assign({
          attendee: (_, event) => event.attendee,
        }),
        clearAttendeeFromContext: assign({
          attendee: (_) => undefined,
        }),
        addAttendanceToCurrentEvent: assign({
          currentAttendance: (_, event) => event.data as Set<string>,
        }),
        clearCurrentAttendanceFromContext: assign({
          currentAttendance: (_) => undefined,
        }),
        addNewEventFormToContext: assign({
          newEvent: (_, event) => event.newEvent,
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
