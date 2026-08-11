import React from 'react'
import withAuth from '../utils/withAuth';
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";


function HomeComponent() {
    const navigate = useNavigate();

    const [joinCode, setJoinCode] = useState("");
    const [scheduleTitle, setScheduleTitle] = useState("");
    const [scheduleDate, setScheduleDate] = useState("");
    const [history, setHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);

    const { userData } = useContext(AuthContext);
    const userId = userData?.username;

    const generateMeetingId = async () => {
        const random = Math.random().toString(36).substring(2, 7) + "-" + Math.random().toString(36).substring(2, 7);
        return random;
    };


    return (
        <div>Home Component</div>
    )
}

export default withAuth(HomeComponent);