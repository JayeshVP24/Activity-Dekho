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
  attendee?: string;
  modalAddEvent: boolean;
  modalAddAttendance: boolean;
  alert?: string;
  currentAttendance?: Set<string>;
  modalViewAttendance: boolean;
  loading: boolean;
  excelFileName?: string;
  attendance?: string[];
  validExcel?: boolean;
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
    data: boolean | string
  };
  addingAttendanceToDB: TFetch;
  addOneAttendeeToDB: { data: EventType | string };
  deleteOneAttendeeFromDB: { data: EventType | string };
};

type ClubEventEvents =
  //   | { type: "CHECK_AUTH"; club: ClubType | undefined }
  | { type: "LOAD" }
  | { type: "ADD_EVENT" }
  | { type: "ADD_EVENT.SUBMIT"; newEvent: newEventInterface }
  | { type: "ADD_ATTENDANCE"; currentEvent: EventType }
  | {
      type: "ADD_ATTENDANCE.UPLOAD_EXCEL";
      excelFileName: string;
      excelStringArray: string[];
    }
  | {
      type: "ADD_ATTENDANCE.SUBMIT";

    }
  | { type: "VIEW_ATTENDANCE"; currentEvent: EventType }
  | { type: "CLOSE_VIEW_ATTENDANCE" }
  | { type: "ADD_ONE_ATTENDEE" }
  | { type: "ADD_ONE_ATTENDEE.SUBMIT"; attendee: string }
  | { type: "DELETE_ATTENDEE" }
  | { type: "DELETE_ATTENDEE.YES"; attendee: string }
  | { type: "DELETE_ATTENDEE.NO" }
  | { type: "RETRIEVE_EVENTS.RETRY" }
  | { type: "ADD_ATTENDANCE.CLOSE" };

//   | { type: "done.invoke.retrieveclubevents", data: EventType[]}
//   | {type: "events.actions.checkAuthAndAddToContext", club: ClubType | undefined}
//   | {type: "events.actions.checkAuthAndAddToContext", club}
const ClubEventMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QFEBuYB2AXWA6AkgCIAyyAxAMIASyFA0gPoCCAqgCpUDaADALqKgADgHtYASyxjhGASAAeiALQBWAEyrcqgMzctANgAcARj3cjATlXKANCACeiIwdzKtWiwBZlHvVoDseqrcBgC+IbZomDgEJOTUtIysHJxG-EggIuKS0rIKCIq+Rrh+Wsp+yoG++h4etg4IRh7O+tx6JcH65soGfmER6Nh4AE5gWCOoYhhQkYNkENJguJOowgDWiyNjYmDoAMYANgCuAEY7UbA8aUKiElIy6XmKRgG4-h6q5loGytzmfh7mWr2RyqPS4T4VPyqcpmEptPogGbRTbjSbTAY4OYLJYYFbrXAo7Z7I6nDEXVKyTK3HIPJTQ7guPwlZRGIzubpqPR1JSNXAGHweVoGcyGIKqNkIpHDUaoqZSshgIZDYRDXCCfYAQywADMVQBbAkyolgA4nM6DS6Um7Ze6gR5+QG4Jx6NnGaFsv7chDihlqZTmbgsjwlNnKZSSsm4CBiWDqjV2NHypiEQgMZAANWQADk2Jb0lSbblEFousVWVCgiyDMYucCEIKGWyml8ano-l4I+cozG4wm5WSyMnU0w2Gxs4QmFmKMg89csnciwgerhA40DG49CyWqove8tK9VB4jGGtF4DKYRZ3Bt3Y5q++jzmR0-hkAB1Zij8eT6ezjLWhe0vk2h+K8BjqOouiHuubK7mGoFfE4PzmMKfihOEiKRtGt7xomSoqmQABKyBsARL6ZmmmY5gAyrgREkQAmr+BYAXaSh+MeuB6ACh7mCKXznl6pQMlCJbcIGoLIUe4boVKuBMBAEBIjed5ogAYvqg4phR2ZsLgVEsAAQgAsvguZ8Fa840qxCCuOYnHGKG3QBqyNh1mKrxHtWpR-NCWhXtE8mKRiuAagpiYYmwwiEAZWIYIsyxrIsoUQOaWBYFFBlMf+VnyI4-xOv4yGqN8lgApYXpOCBR6buKwrfO8-L+XggVKcl4VRJF0UKnhqpxjq+ohQpqXpdFWWWbauX1j8rxfGY5gWP4HynoJIEljUJb8m0LJGE1g0QEwaWYBAGoYLsixYb2aJGcIx37Jpw6flmE5TsguAsAACsQADyyZpgAGtOxBjdSE15C6jYiueyGfG2LpeuUGjvA1gqNG0vy7clB1YEdJ1nbg6BDGI2piPeyByGdd3zHFOJ4osBNE3YYDk2A+zA4WgGBB4nFGLoXQVNWrLmBVujNB4-jPI0nxOH5MmRpjh0YMdp104qRMk4mzN3Yqyq9Zq-VDAa9Paozmtsyxk1fBoIqCkGwoBm0XrGM4YFhmU3ANdLGMKVjOPK3taI+4ruNgJ1MVU-FuKJXtWrY0HysjZl5n5tloOIKCXPVE0gKWICXyufURWvKYPTeOKfiBjL-RdvLsdK3jbVTIHdchxl3U62qeu6gb0cK83CdmzleRMgy3DtN03HrkyXp6L4TptgENTcB8YZoVX14TGAADuAe98HlDfVRyAMM+b4fmOT3fjOSdziDi6KKCYJmK2vzqIY5Tw6ymifMKwb-LxrS7Q3tvRuu9lb3QYF9LMR8Rzn0IMgK+Vw-zjTvgCZwbtWiHl8GLIWdYwJFFBOeTw5d+KVwwl2IBO9a57zgaQMcZ9xzwIHqnfI3gigzy0EEMCvgZ6+C9N4fcpVjBlB8D5PQXtoxTC+nFJuYAwCxQjrTPaCwY5HVkf3a+SDb6ARUCWTi5dXbnh8OofOiB2IaAdKJNQTgrDu3EWiKRYAZFyO1iqDuWou4GmSso3uaiMpMLvkyZwgJ1ywycMhAIXpeJgn5MhSerQAS6F2gsJx6kDbgMgdAx6cDXr6WMqZfx2j+QgWzj8CozxvhuHhn8J0x4RHnnUPyDwu0Ur7FGJQ1Rcjw40yjrJFpbSQG11kQgBKuwtR3EuAU6yKhfjgjKFCNQhCxK1nqC2TQYEdAijKE4Iwqhmks36VAJxbdXF9Q8bgXp+zJADI6cMyOoybQTI0cxQeShLBFAWf6asq5yg4PqJufBbgWQ-F0Ds4IGMRj0WEIcKihwRhkBocRTJsD4G4HosgKikzJqKBFHZF0rZvDvEqDuOswK+Tp18A6LwHZZbVwhVCmFcKEV0JgQw16WYvqYvtNCYoIpQRQgMJBExU0ub22QmGVk7tUZhHQhgG6cBZBSgsloqZbITCcXdu8XibgvjIS9IodwYJ3jFUPMEUwYsAi7SIKQJV7MpmCjBOxFyYkvA83fnWJ4YFub-HUOxNoSNpJr2RDKHY7VBg2vNo8IMK5vBL2+FYascM3IcJXDzbBbYRE7RpdeAA4sINEkUqDCD1GAd6GoYDhpefkJkdknDmtKpYYwWg9VFFPOKBp2hTztiXs0nsKl+znArcwp4FQv721RrZRoQqhLFG0AGcSbZ+THh7dhUmPVB132CR5Vk1YvCjx5gYQSbhXjPFjRwnwRTdotQxOujm+4BYlHLi6HmVggT1CeO4PkfFDAmBdJufQl6FJKSwn2qAqS9Q3usgCMEa4vJVncKPIVigaivC-SeIIrbDwAaClEf2-bsChwg5NVkRR73+FaBKl98M56uu8MKQoXFzDiKbsHQjeQ3Aiq4quLO9s-B8K8E6Tk-CxILUzYGvANdfZ4wuiB66t1WOIH4bMil-oug+EMNPZNNVNxtlPGe3ZWbogSbjnjI26s5Sa3kwgXwGhW1iXKC6eaQqAyrXXK0QEw9DCkNkkZ5uuHDmgLOgR5OyDAILOKNpj4MJWRfAqjzaJx4OFhmhO0fTYn8bbGAf5qhytLP6uCHyJezI92UtfQpgMmgjy-FqRUDhqWyHXgblABxTjcs7NcOCMJm5WjapKI7bQfISiWEWhXCwSTpE+LAGB3L-pGwcLZGYMSahR6RKXk6GGNRQTitHns1pVyssdNawQ9VG2tVuDqnwtkeiuLzzMNqgN9XDN0uhbCsAuWF0dbFZPNQvGSVi3BFBY8-x56gkva0oYWBLPOZ5YUbOIoF56oaf9411Y-RzMY9KoAA */

  /** @xstate-layout N4IgpgJg5mDOIC5QFEBuYB2AXWA6AkgCIAyyAxAMIASyFA0gPoCCAqgCpUDaADALqKgADgHtYASyxjhGASAAeiALQBWAEyrcqgMzctANgAcARj3cjATlXKANCACeiIwdzKtWiwBZlHvVoDseqrcBgC+IbZomDgEJOTUtIysHJxG-EggIuKS0rIKCIq+Rrh+Wsp+yoG++h4etg4IRh7O+tx6JcH65soGfmER6Nh4AE5gWCOoYhhQkYNkENJguJOowgDWiyNjYmDoAMYANgCuAEY7UbA8aUKiElIy6XmKRgG4-h6q5loGytzmfh7mWr2RyqPS4T4VPyqcpmEptPogGbRTbjSbTAY4OYLJYYFbrXAo7Z7I6nDEXVKyTK3HIPJTQ7guPwlZRGIzubpqPR1JSNXAGHweVoGcyGIKqNkIpHDUaoqZSshgIZDYRDXCCfYAQywADMVQBbAkyolgA4nM6DS6Um7Ze6gR5+QG4Jx6NnGaFsv7chDihlqZTmbgsjwlNnKZSSsm4CBiWDqjV2NHypiEQgMZAANWQADk2Jb0lSbblEFousVWVCgiyDMYucCEIKGWyml8ano-l4I+cozG4wm5WSyMnU0w2Gxs4QmFmKMg89csnciwgerhA40DG49CyWqove8tK9VB4jGGtF4DKYRZ3Bt3Y5q++jzmR0-hkAB1Zij8eT6ezjLWhe0vk2h+K8BjqOouiHuubK7mGoFfE4PzmMKfihOEiKRtGt7xomSoqmQABKyBsARL6ZmmmY5gAyrgREkQAmr+BYAXaSh+MeuB6ACh7mCKXznl6pQMlCJbcIGoLIUe4boVKuBMBAEBIjed5ogAYvqg4phR2ZsLgVEsAAQgAsvguZ8Fa840qxCCuOYnHGKG3QBqyNh1mKrxHtWpR-NCWhXtE8mKRiuAagpiYYmwwiEAZWIYIsyxrIsoUQOaWBYFFBlMf+VnyI4-xOv4yGqN8lgApYXpOCBR6buKwrfO8-L+XggVKcl4VRJF0UKnhqpxjq+ohQpqXpdFWWWbauX1j8rxfGY5gWP4HynoJIEljUJb8m0LJGE1g0QEwaWYBAGoYLsixYb2aJGcIx37Jpw6flmE5TsguAsAACsQADyyZpgAGtOxBjdSE15C6jYiueyGfG2LpeuUGjvA1gqNG0vy7clB1YEdJ1nbg6BDGI2piPeyByGdd3zHFOJ4osBNE3YYDk2A+zA4WgGBB4nFGLoXQVNWrLmBVujNB4-jPI0nxOH5MmRpjh0YMdp104qRMk4mzN3Yqyq9Zq-VDAa9Paozmtsyxk1fBoIqCkGwoBm0XrGM4YFhmU3ANdLGMKVjOPK3taI+4ruNgJ1MVU-FuKJXtWrY0HysjZl5n5tloOIKCXPVE0gKWICXyufURWvKYPTeOKfiBjL-RdvLsdK3jbVTIHdchxl3U62qeu6gb0cK83CdmzleRMgy3DtN03HrkyXp6L4TptgENTcB8YZoVX14TGAADuAe98HlDfVRyAMM+b4fmOT3fjOSdziDi6KKCYJmK2vzqIY5Tw6ymifMKwb-LxrS7Q3tvRuu9lb3QYF9LMR8Rzn0IMgK+Vw-zjTvgCZwbtWiHl8GLIWdYwJFFBOeTw5d+KVwwl2IBO9a57zgaQMcZ9xzwIHqnfI3gigzy0EEMCvgZ6+C9N4fcpVjBlB8D5PQXtoxTC+nFJuYAwCxQjrTPaCwY5HVkf3a+SDb6ARUCWTi5dXbnh8OofOiB2IaAdKJNQTgrDu3EWiKRYAZFyO1iqDuWou4GmSso3uaiMpMLvkyZwgJ1ywycMhAIXpeJgn5MhSerQAS6F2gsJx6kDbgMgdAx6cDXr6WMqZfx2j+QgWzj8CozxvhuHhn8J0x4RHnnUPyDwu0Ur7FGJQ1Rcjw40yjrJFpbSQG11kQgBKuwtR3EuAU6yKhfjgjKFCNQhCxK1nqC2TQYEdAijKE4Iwqhmks36VAJxbdXF9Q8bgXp+zJADI6cMyOoybQTI0cxQeShLBFAWf6asq5yg4PqJufBbgWQ-F0Ds4IGMRj0WEIcKihwRhkBocRTJsD4G4HosgKikzJqKBFHZF0rZvDvEqDuOswK+Tp18A6LwHZZbVwhVCmFcKEV0JgQw16WYvqYvtNCYoIpQRQgMJBExU0ub22QmGVk7tUa7SYK0oYWAQqyqwF9bU2pBykAImZRBzzmFdFWnxdQFhAzlD8F6RQDpwQNPFjzVobhV5kOvDKxU8qNSKqkWQKibAvrvWYOqzVFktHWR5rPAV+hoRdA+LE01ZRwRslDMYHQWzzBhHQhgG6cBZBSn9ezKZsawSmBqBGtwXxkKmvcGCd4xVgzBHLsKXZNLrxEFIFm82jxBRgnYi5MSXgebvzrE8MC3N-jqHYm0JG0k17IhlDsdqgxm0vJYbyQMgpip+mrHDNyHCVw82wW2ERO163RAAOLCDRJFKgwg9RgHehqGAc7mFmvNU4MWDoeLFRgn2oop5xQNO0KedsS9mk9hUv2c4d677HjBBG1oqNbKNCFUJYo2gAziTbPyY8gHsKkx6mB7RwSPKsmrF4UePMDCCTcK8Z4S91yYKKdKhSSIcPWWDcYEo5cXQ8ysECeoTx3B8j4oYEwLpNz6Do0FKIykcJTFSXqRjk0ARgjXF5Ks7hR5CsUDUV4-GTxBC-YeUTrUwogewKHWTeRWRFAFqx6DHHvDwznj27wwpChcSTQevANdfZnVM8WU84IuKrizvbE1JKvBOk5PwsSC190Tvc97UBeMLrAagNdW63mbJi1mRS-0XQfCGGnpumqm42yng4e8cRTdg741VsTUmms0u+A0F+sS5QXTzSFQGVa65WiAmHoYUhskPNx3roZw58WW7RTSws4oRWPgwlZF8CqQa+THg4WGaE7Q60xfxtsYBo2qHKzS4oHQzsl7MmI5SrjiB-QMkPDzNrXgGubftdEBuUAHFOMOzs1wManM-CqP4LQjttB8hKJYRaFcLBJOkT4sA0nDvXYKuKHQ1q1Cj0iUvJ0MMC2bhZKPPZrSrl7Y6Z9ghnF3bvF4kWuqfC2R6K4vPMwRbx3Pfc3S6FsKwCHdQzGsVk81DBfqPwi1TRjz-HnqCaViq0soU049w1ZQKimoaRaytoJyk6cl06hVTrlXajS3zHlhRs4igXqaxoiMGlNFQmLHoXFNdyu13KqR+vQsljlwGBXyyeR2UsMVK1SzbVNOTUAA */

  /** @xstate-layout N4IgpgJg5mDOIC5QFEBuYB2AXWA6AkgCIAyyAxMQPICChA2gAwC6ioADgPawCWW3HGViAAeiALQAWAMwTcADgDsDAEzKAnADY1AVgCMSiQBoQAT0RzluZbt0SFchhO3aJuiwF93xtJhy4ATmBY-txgqNwYUD7YsGQQAmC4EagcANaJgcGh6ADGADYArgBGYb6wjCxIIJw8fAJCoghi+hq4UgoS6lJy2gxqHWpGpoi6yq1qUtoaCsoKvfpS057e6DEBQSFhEVGrOHEJSRgp6etZpfnFpTF0upXsXLz8glWNYrMMuNoKCpM2UrraHpjYxmJq2eQSDQSBgaOSaCwqXRSZYgaJ+TKbcKRNGxMD+fwcfy4Nh5ACGWAAZoSALanTFgC4lXblZhCGqPeovcQKQa4NwaJFyUYKJH9EGIawfbTKbRqBh6Oz-SbaFE43AQbiwEmkkzbHFkWiEAD6yAAasgAHIAFQqbIedWeoEaUh0uBF+lU8rcQo04oQ0I+SIkcm6Ekh-ScquZ6s12t12OZBsIxuoVqtlsI1AtAGFkLaquyHQ0RtopLhodNZj8OoK-ZC5OWJh1-gCNKoNFGyjGtWT4zsymRTfhkAB1I2p9MWzM5vOsgv2p7FprKTq4BhSBhBjohtSqOsTN3OBRt5T-WX6FVeVHRjU9nV6-GEsgAJWQVufw-NJvN1oAyrhX3fABNfN7lqRcuSaH5xk0GV1D6XQ1D9X41zhAEhVcLRdA0DsrzVagIAgNFu17bYADEaSTY0zUtK1cF-ABVAAhABZfAbTnMCOUdEREFLNRcFhP5nDhTcAT9ZQVDaVw5BDWUZh+Ts1gIojdlwUlCL1XYrQ4QgmP2DBEmSNJEg0iAriwLBdKY0DqgXTknRGDo+XaNQLB6XcJDUXc-TcBRy2w6U3DclxlDkCQlL8FTiLMrTfB0vSyDxAkiW1SkaXUwiLKsvTbMLCDHP9Xo2m6Tc1EQ9ouiGUF2jaQZpDcyE5hsSK8DM6hLMwCBSQwHJElvONthYjhuryKjxzTDMs1zXAGIABSoWgTQADVzYg8vsnjGgFQN4S0OFFk0XQ-TmSxOk6cLNyavpWsyiAOqwLqer63B0BCCluD7ZBhD6sb4kMw5jkSN7uApEwwB+sA8g28CHN4hA21kHaXWcWEhUQ3z1wbGR2n0WwJjcZE8OjdrOowbreuBvFQc+vVIbG5LCWJMl0v8WkQbBiHfph7il26SxNGhBU4TlaY-SFBsLGcL5HDCwnbtJx7yee0zNMiB6nsphL9P+oyjhMu7ySVim+pymzOLs2GtolKE2ihYNBl3QZum0P03MsRYGEUUL9HlImVi7RXNZe2L1bJk2wG1pLH1SlmqTZw3w5Vs2eaLSDvg+BgfnlcLdxDb4-RwstsP6e2VB0QFbvCMAAHdtg15XKbIbMqF-ZAjSHUcJsnadc1Tgr4bEf5WgFEvnDc0NXeGBBFAEsY5A0KY5lkxGq9COuw+NlXxsoC124nDNkFnO5Ld5yDJDcz4lBhFcNBxpDp4sXQrFhAVBiUboQzX2v66TpvCGQKQdM3dD7HztFbJcYgXDPyLpJCwd8cJ3z9C4MsnkhRfHDDMXCAc1ihygJQQyDdzJgAMnrIGd0EhGy6mAII1l+5w1eF8BsMoRSAnaNIGUvpp6LwbBoFQ51BhVm6ArNW+DCHhxodHFKzNyTx1pGZShEjaG5QtvlBh3J7C4EGCGLQAo4SKC4aCbyrRc6yXaDCLy65boJCITQiibMd57xAVOI+9FmJsQ4ifNR1smjhX8o7XoUx9A9CkFIE6-Q+QAnDAvVQ4UIrEy7OZPIQRf7G0kbrQGBs1RJJSZvahYAEDGRyOSJ4FR6E+KgX0LRXwZjSgXroBgMJkLhSsBYDcmgvhuFGLdHJfA8nk0kYzWOsiMrZKhrkqAtiClFJKQIMpqjNqQN3M-OpspZJejmA-UEi9n6nl+L0dcowvYK0CEBDgBRfwFECGQABQD96TRccgXAQFkC-nKUsrQglbCQhcJ0NsbZkGNPkGMSErknCRgSbg055zLnXNuW+e5PdXEWkoO88+Ck3SwUrA4KQMo6wuC0TCEKegGmuEhCI+6f8+rjQPlOaaTyW6UDbmiwq6g1zqC8mMLQ0hgwqELlU6UqM+Eui-pCvwQdG4vQGqRSIppSR5G4ERemNKHm9yeYxVi7EWXw36B7EUp4BR3ycBMXy2FWgzE6MEpQCDLxXgwCNOAQgcTgLPoVZow9BKOE6N5UJ3Q3J+jeIhOqd9Rgyx+N0sVeAiCkBdWnN1TgyxaA6F7WYehFgKADZor4d8s7dGmLi+JOD0QbGyHFGIsaB6MPBPKaEYVBUr2OtPU8lhNyOBdNyrCPTYwyv7OW+cEDz6tisN5GEthF4ulsFPGqxUZgukadKfarhLxFrwNK+82IY4VvUU0bR0kbCyScFnBpchkKhLaL7MKBbYR2FutFXYW6fF33kEKaso6GkymquIJEz84R32ln0Uqblb2EWIreHt9jqQPqXF5VothZJyUJg0uYAawzBsWM4XF65OgrmA6pXwd0y1YG1lByCNgf0vvMaPFQLgTp8h2nMB2IaoRqApUQlWJHCqhNkILL0DtRYZuni4bQfIF2cqzlMCYrGqX9W7euqAw1Rocfhig6pd9Nk6EhLCQuuLBILokzjFcygpNb0pq9amH0vr0yU9tHTMhJLibfuJaecp-LdA3NyjOsJ-bXkDoRNjpm8H+b6sR-trr4bBksDMMY1gwqL1PAJ0ENhL4tjEtMWE6hdDfw3pM6T1nxCTA+CGIrK5W3tBkIXJwbpXBy0FrMQYFLtgELAFMvLYIuXlguuVaUgstnmE+bYRYsS+ECmDNY8RaSwAQda1AuULlrAbgafKSSCXEByksBVe2YxnBIZ6eMvpOWJvTdGLCT1YZ1ATFCfo5BSJBLHkwZuX1y6fNQrAGci5VywDTf2loxCPR87ShWwgFTaCAQdCTWMYzwcZN3j7HKhVSrfpKasmwEYpKrCGf5uGqEAnkkUiwKtsKWiXTwjGPoaQU8igcEshwSDCAbDSnR50THw87DGBCFAAAFvjunjgGwTGMfAsnixjB1wgFgDnIxJJrkaTL2XjSbDGA52AbgnPufBmMI0POROBek+bFO1HjhGengsFjm9nh3BAA */
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
              target: "viewingAttendance",
              actions: ["openViewAttendanceModal", "addSelectedEventToContext"],
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
                  ],
                },
              },

              entry: "setLoadingTrue",
              exit: "setLoadingFalse",
            },

            displayingValidExcel: {
              on: {
                "ADD_ATTENDANCE.SUBMIT": {
                  target: "displayingValidExcel",
                  internal: true
                }
              }
            }
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
          },
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
            return new Promise ((resolve, reject) => {
                const arr = event.excelStringArray
                console.log("size", arr.length)
                if (arr.length === 0) {
                    reject("Empty attendance, please check the sample format")
                    return
                }
                const regex = new RegExp('^\\d{2}-[A-Z]+\\d{2}-\\d{2}$', 's')
                let valid: boolean = true;
                console.log("arrayy  ", arr)
                for (let i=0; i<arr.length;i++) {
                    console.log(i, regex.test(arr[i]))                    
                    if(regex.test(arr[i]) == false) {
                        valid = false;
                        break;
                    }
                    
                }
                if(valid) resolve(true)
                else reject("Invalid File Contents")
            }) 
          },
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
          modalViewAttendance: true,
        }),
        closeViewAttendanceModal: assign({
          modalViewAttendance: false,
        }),
        addSelectedEventToContext: assign({
          currentEvent: (_, event) => event.currentEvent,
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
        modifyCurrentEventInContext: assign({
          currentEvent: (_, event) => event.data as EventType,
        }),
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
