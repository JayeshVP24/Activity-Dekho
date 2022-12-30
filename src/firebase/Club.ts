import { collection, getDocs } from "firebase/firestore";
import { signInWithEmailAndPassword } from "firebase/auth";
import { ClubType } from "../../types";
import { auth, firedb } from "./config";

// export const getClubsListQuery = () => {
//   return new Promise<{ clubs: ClubType[]; error?: string }>(
//     (resolve, reject) => {
//       setTimeout(() => {
//         reject({error: "failed"});
//         resolve({
//           clubs: [
//             {
//               id: "1",
//               name: "SORT",
//             },
//             {
//               id: "2",
//               name: "GDSC",
//             },
//           ],
//           error: "ph noo",
//         });
//       }, 1000);
//     }
//   );
// };

export const getClubsListQuery = async () => {
  const clubList: ClubType[] = [];
  let errorMsg: string = "";
  await getDocs(collection(firedb, "clubs"))
    .then((data) => {
      data.forEach((doc) => {
        clubList.push({
          id: doc.id,
          ...doc.data(),
        } as ClubType);
      });
    })
    .catch((error) => (errorMsg = error));
  return {
    clubs: clubList,
    error: errorMsg,
  };
};

export const validateAuthQuery = (name: string, email: string, password: string) => {
  return new Promise<{
    club: ClubType
  } | {
    error: string
  }>((resolve, reject)=> {
    console.log({email, password})
    signInWithEmailAndPassword(auth, email, password)
      .then((userCred) => {
        resolve({
          club: {
            name,
            email: userCred.user.email,
            id: userCred.user.uid
          }
        })
      })
      .catch((err) => {
        reject({
          error: err.message
        })
      })
  })
}

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
//           console.log(err);
//           // reject({ error });
//           return {
//             error: err.message
//           }
//         });
//    ;
  // console.log({ club, error });
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
