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
    data: boolean | string;
  };
  addAttendanceToDB: {
    data: {
        newAttendance: Record<string, string>,
    }
  };
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
  | {type: "ADD_ATTENDANCE.SUBMIT";}
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

  /** @xstate-layout N4IgpgJg5mDOIC5QFEBuYB2AXWA6AkgCIAyyAxMQPICChA2gAwC6ioADgPawCWW3HGViAAeiALQAWAMwTcADgDsDAEzKAnADY1AVgCMSiQBoQAT0RzluZbt0SFchhO3aJuiwF93xtJhy4ATmBY-txgqNwYUD7YsGQQAmC4EagcANaJgcGh6ADGADYArgBGYb6wjCxIIJw8fAJCoghi+hq4UgoS6lJy2gxqHWpGpoi6yq1qUtoaCsoKvfpS057e6DEBQSFhEVGrOHEJSRgp6etZpfnFpTF0upXsXLz8glWNYrMMuNoKCpM2UrraHpjYxmJq2eQSDQSBgaOSaCwqXRSZYgaJ+TKbcKRNGxMD+fwcfy4Nh5ACGWAAZoSALanTFgC4lXblZhCGqPeovcQKQa4NwaJFyUYKJH9EGIawfbTKbRqBh6Oz-SbaFE43AQbiwEmkkzbHFkWiEAD6yAAasgAHIAFQqbIedWeoEaUh0uBF+lU8rcQo04oQ0I+SIkcm6Ekh-ScquZ6s12t12OZBsIxuoVqtlsI1AtAGFkLaquyHQ0RtopLhodNZj8OoK-ZC5OWJh1-gCNKoNFGyjGtWT4zsymRTfhkAB1I2p9MWzM5vOsgv2p7FprKTq4BhSBhBjohtSqOsTN3OBRt5T-WX6FVeVHRjU9nV6-GEsgAJWQVufw-NJvN1oAyrhX3fABNfN7lqRcuSaH5xk0GV1D6XQ1D9X41zhAEhVcLRdA0DsrzVagIAgNFu17bYADEaSTY0zUtK1cF-ABVAAhABZfAbTnMCOUdEREFLNRcFhP5nDhTcAT9ZQVDaVw5BDWUZh+Ts1gIojdlwUlCL1XYrQ4QgmP2DBEmSNJEg0iAriwLBdKY0DqgXTknRGDo+XaNQLB6XcJDUXc-TcBRy2w6U3DclxlDkCQlL8FTiLMrTfB0vSyDxAkiW1SkaXUwiLKsvTbMLCDHP9Xo2m6Tc1EQ9ouiGUF2jaQZpDcyE5hsSK8DM6hLMwCBSQwHIwCo8c0wzLNc1wbMqF-Wc7js8CHN4hB1DXdQvLGLRpGDFQ-Q0PpPhlKZtpdENWsyiAOqwLqer67s422FiOG6vIBonYaZ1wBiAAUqFoE0AA1c2IPL7J4xoBUDeEtDhRZNF0P05ksTpOnCzcmr6Y72s6jBut6xJ0BCCluD7ZBhD6x74kMw5jhxvFuApEwwGJsA8kB2bgcQNtZFBl1nFhIVEN89cGxkdp9FsCY3GRPDo3R87Mcuqm8YJvUGce5LCWJMl0v8WlcZpunleZ7il26SxNGhBU4TlaY-SFBsLGcL5HDC8W0cIs6Luxk7tjd2XsYS-SyaMo4TJO8kZaxvqcpsziZsNyCxlkRYwzhFbBm6bQ-TcyxFgYRRQv0eUJZWLtpfdq7Ysib3w7AP2ksfVKNapLWQ4xqvI4NotIJ6BsNBcfoegBXpvK2vRPhDGxbHULDLyLtYS59q7bxuyJTVJPJuCI5WnqGqcRuQejmLYjjpvyubGn6LORVPAUNBkWUpF87DWhmTp9EUGFFmn68u3CMAAHcvZbnLMg41KCTSNEOUcg1JzTlzO3Aq80xD-FaAKbCOhZQhnCunYYCBFACTGHIHu0xAQEJXMdH+-8K6AOxgNSgFpkBQIzMgKadoWZLkkG5T4SgYQrhvg1a21grCwgFIMJQ3QjqS2-qEChUBK5AMIMgUg6YGFTiYXA0+4gXC6EEjfSSFgb44Rvn6FwZZPJCi+OGGYuEZ5+HLlASghlK5gH6gHCmwczIJFDl1Jxbdo4n1Zk0L4DYZQikBO0aQMpfTYJ7t3FQCNBhVm6C7DUkR7FgEcf1VW9dySN1pO4wynjMbeOsmo-xYhvgNkGCGLQAo4SKEiaCbyrRwpuRDEoKEcpC5fzWAkdJFEtY0Loco+Re9GKsXYiUth4V-KDB0PKAU9hSz32wTyfyNgXAQxPOFCKEi1jmTyEEABYcnEGUDpTXAao9kHMoUcsACBjI5HJE8CoEzIJiEHrgHQ3w4IEN0AwGEyFwpWAsBuTQXw3CjGOpcvg1yvEZLrurbJGULmMyuTIluTi7lBweQ6Z5vigZsN3Fo6UHlZJejmEhKJI9Ty-F6OuUYOc0aBCAhwAov4CiBDIPIxR9DnoqL3kBZAv4XmFTEJoASAoww9zDGMGVRi-nyHjjfHkThIw7JsUyllbKOVcrfDy7ewzcAWkoMKhBCk3SwUrA4KQMo6wuA+TCEKehfmuEhJ4K8GB7pwCEDiFhscRVImwoJRwnRvJSDDbUv0bxEJ1SVXbeJBDtnWLwEQUgvqO4iqcGWLQHQc6zD0IsBQkb7CcJvgwH4BCfikLVXgDE2Q4oxDTfA14Co1wuBUECYhAoJLWrXM6l0a0sKQtjKRBMZRG3qLBFMKw3kYS2B7i6WwWCarFRmC6P50oIauE-hc4d95sR13HaUyp0kbCyScGW35chkJhraPnMK1r6x2GOtFXYh6lw33kEKass7fkymquIAN8hNDCzhF8f4nRn2EWIreEdUA+nUjfZBLyrRbCyTkuLX5cxI1hhjR-UskkZCqETV0qKUG1K2LRH7RDhVx6foWG0mwKgXCwz5KDOYwZgPYS8kk2R2NqPzTDbIU2XoOOW0Ldglw2g+TSimHoaYY81A8aoQvXdfY7oPX440YxHypjtFlDoSEsIto9p7mMKYExwkQerSdXjV0db40JsrTTbMe2Eb+XMYR4lsFyn8t0Dca1vgwnEUmmzynTKaRhfPau1lnP+gsG6ds1gwqmfaA-DhLYxLTFhOoXQSmw5y2urBlea8N4k341ZNgIxnVWBXKeCwPwuPif2RSLAiBdwVJdPCMY+hpBYKKBwSyHAEMIDWZYIjdXZhILsMYEIUAAAWrWRuOA640vRPXFjGH-hALAc2RiSTXH8w7R2-k2GMHNsA3B5uLeDMYM+YUPmdey-M3rD9HA1c6MbBrUIFBkKkYc0uYBYuIOKhg420JfntBkFtJwbpXBO1NrMQYSTtipPSUD0YOFyyI3KtKU2FLQQEIErYRYqgCGzuDMdHp6KwDwaB7KQM1qkSbnXZJcTDSpIVShJ0Huegy2QpRdCtFNz0f4KDdK0N4a3JGKRIJY8FjNxhsmIysAzLWXssB-OVhryIYfMQl3PTswjHSA+SuMxHRs1jDde4IAA */
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
                    "modifyCurrentEventInContext"
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
          },

          entry: "openViewAttendanceModal"
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
          return new Promise((resolve, reject) => {
            const arr = event.excelStringArray;
            console.log("size", arr.length);
            if (arr.length === 0) {
              reject("Empty attendance, please check the sample format");
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
        addEventsListToContext: assign({
          events: (_, event) => event.data as EventType[],
        }),
        addErrorMsgToContext: assign({
          errorMsg: (_, event) => event.data.error ? (event.data.error) : event.data,
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
        modifyCurrentEventInContext: (context,event) => {
            console.log(event.data)
            context.currentEvent.attendance = event.data.newAttendance as Record<string, string>
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
