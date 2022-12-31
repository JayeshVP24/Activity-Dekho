import { NextPage } from "next";
import { auth } from "../firebase/config";

const Club: NextPage = () => {

    if(!auth.currentUser) {
        return (
            <p>not allowed please login</p>
        )
    }

    return (
        <h1>
            Welcome to your dashboard
        </h1>
    )
}
export default Club