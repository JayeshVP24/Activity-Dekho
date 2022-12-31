import { useInterpret } from "@xstate/react";
import { useRouter } from "next/router";
import React from "react";
import { createContext } from "react";
import { getClubsListQuery, validateAuthQuery } from "../firebase/Club";
import ClubAuthMachine, {ClubAuthActor} from "../machines/clubAuth";

export const GlobalStateContext = createContext<{
    clubAuthService: ClubAuthActor | undefined
}>({
    clubAuthService: undefined
});

const GlobalStateProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();

  const clubAuthService = useInterpret(ClubAuthMachine, {
    services: {
      getClubsList: async () => await getClubsListQuery(),
      validateAuth: async (context, event) =>
        validateAuthQuery(
          context.club.name,
          context.club.email,
          event.password
        ),
    },
    context: {
      modalOpen: false,
    },
    actions: {
      moveToDashboardPage: () => {
        router.push("/club");
      },
    },
  });
  return (
    <GlobalStateContext.Provider value={{ clubAuthService }}>
      {children}
    </GlobalStateContext.Provider>
  );
};
export default GlobalStateProvider;
