import React from 'react'
import withAuth from '../utils/withAuth';
import { useNavigate } from "react-router-dom";
import { AuthContext, client } from "../contexts/AuthContext";


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

    const handleStartNewMeeting = async () => {
        const newMeetingId = generateMeetingId();
        try {
            await client.post('/add_to_activity', {
                user_id: userId,
                meeting_id: newMeetingId,
                title: "Instant Meeting",
                isScheduled: false,
                createdAt: new Date(),
            });
            navigate(`/${newMeetingId}`);
        }
        catch (e) {
            console.log("Error Starting Meeting", e);
        }
    };

    const handleJoinMeeting = async () => {
        try {
            if (joinCode.trim() === "") {
                alert("Please enter a meeting code first");
                return;
            };
            await client.post('/add_to_activity', {
                user_id: userId,
                meeting_id: joinCode,
                isScheduled: false,
                title: "Joined Meeting",
                createdAt: new Date(),
            });
            navigate(`/${joinCode}`);
        }
        catch (e) {
            console.log("Error Joining Meeting", e);
        }
    };

    const handleScheduleMeeting = async () => {
        try {
            if (scheduleTitle.trim() === "" || scheduleDate === "") {
                alert("Please enter both title and date for the meeting");
                return;
            }
            const meetingId = generateMeetingId();
            await client.post("/add_to_activity", {
                user_id: userId,
                meeting_id: meetingId,
                title: scheduleTitle,
                scheduled_for: scheduleDate,
                isScheduled: true,
                createdAt: new Date(),
            });
            setScheduleTitle("");
            setScheduleDate("");
            alert("Meeting Scheduled Successfully");

        }
        catch (e) {
            console.log("Error Scheduling Meeting", e);
        }
    };

    //handleLogout


    //handleToggleHistory

    return (
        <div>Home Component</div>
    )
}

export default withAuth(HomeComponent);