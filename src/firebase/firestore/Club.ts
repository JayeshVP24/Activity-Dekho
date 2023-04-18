import { collection, getDocs } from "firebase/firestore";
import { browserSessionPersistence, setPersistence, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { ClubType } from "../../utils/types";
import { auth, firedb } from "../config";

// export const getClubsListQuery1 = () => {
//   return new Promise<ClubType[] | string>((resolve, reject) => {
//     setTimeout(() => {
//       reject("failed");
//       resolve([
//         {
//           id: "1",
//           name: "SORT-TCET",
//           email: "sort.tcet@gmail.com",
//           photoUrl: "/sort-logo.png",
//         },
//         {
//           id: "2",
//           name: "GDSC-TCET",
//           email: "gdsc.tcet@gmail.com",
//           photoUrl: "/sort-logo.png",
//         },
//         {
//           id: "1",
//           name: "SORT-TCET",
//           email: "sort.tcet@gmail.com",
//           photoUrl: "/sort-logo.png",
//         },
//         {
//           id: "2",
//           name: "GDSC-TCET",
//           email: "gdsc.tcet@gmail.com",
//           photoUrl: "/sort-logo.png",
//         },
//         {
//           id: "1",
//           name: "SORT-TCET",
//           email: "sort.tcet@gmail.com",
//           photoUrl: "/sort-logo.png",
//         },
//         {
//           id: "2",
//           name: "GDSC-TCET",
//           email: "gdsc.tcet@gmail.com",
//           photoUrl: "/sort-logo.png",
//         },
//         {
//           id: "1",
//           name: "SORT-TCET",
//           email: "sort.tcet@gmail.com",
//           photoUrl: "/sort-logo.png",
//         },
//         {
//           id: "2",
//           name: "GDSC-TCET",
//           email: "gdsc.tcet@gmail.com",
//           photoUrl: "/sort-logo.png",
//         },
//         {
//           id: "1",
//           name: "SORT-TCET",
//           email: "sort.tcet@gmail.com",
//           photoUrl: "/sort-logo.png",
//         },
//         {
//           id: "2",
//           name: "GDSC-TCET",
//           email: "gdsc.tcet@gmail.com",
//           photoUrl: "/sort-logo.png",
//         },
//       ]);
//     }, 100);
//   });
// };

// class Clubs {

// }

export const getClubsListQuery = async () => {
  return await getDocs(collection(firedb, "clubs"))
    .then((data) => {
      const clubList: ClubType[] = [];
      data.forEach((doc) => {
        clubList.push({
          id: doc.id,
          ...doc.data(),
        } as ClubType);
        // console.log(clubList);
      });
      return clubList;
    })
    .catch((error) => {
      // // console.log(error)
      return error.message as string;
    });
};

export const validateAuthQuery = (
  name: string,
  email: string,
  password: string
) => {
  return new Promise<ClubType | string>((resolve, reject) => {
    setPersistence(auth, browserSessionPersistence).then(() => {

      signInWithEmailAndPassword(auth, email, password)
      .then((userCred) => {
        const club: ClubType = {
          name,
          email: userCred.user.email,
          id: userCred.user.uid,
          photoUrl: userCred.user.photoURL,
        }
        sessionStorage.setItem("club", JSON.stringify(club))
        resolve(club);
      })
      .catch((err) => {
        reject(err.message as string);
      });
    })
  });
};

// export const sessionSignOut = () => {
//   signOut(auth).then(() => {
//     sessionStorage.removeItem("club")
//   })
// }

// export const validateAuthQuery =  (
//   name: string,
//   email: string,
//   password: string
// ) =>  signInWithEmailAndPassword(auth, email, password)
//         .then((userCred) => {
//           return {
//               club: {
//                 name,
//                 email: userCred.user.email,
//                 id: userCred.user.uid
//               }
//           }
//           // resolve({
//           //     club: {
//           //       name,
//           //       email: userCred.user.email,
//           //       id: userCred.user.uid
//           //     }
//           //   })
//         })
//         // .then(() => resolve({ club }))
//         .catch((err) => {
//           // error = err.code + "\t" + err.message;
//           // console.log(err);
//           // reject({ error });
//           return {
//             error: err.message
//           }
//         });
//    ;
// // console.log({ club, error });
// return {
//   club,
//   error,
// };
// };
// export const validateAuthQuery = () => {
//   return new Promise<{ club: ClubType; error?: string }>(
//     (resolve, reject) => {
//       setTimeout(() => {
//         reject({
//           error: "ohnoo"
//         });
//         resolve({
//           club:
//             {
//               id: "1",
//               email: "sort.tcet@gmail.com",
//               name: "SORT",
//             },
//           error: "ph noo",
//         });
//       }, 1000);
//     }
//   );
// };
