import React from 'react'
import { useState, useContext } from 'react';
import withAuth from '../utils/withAuth';
import "../styles/home.css";
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

    const generateMeetingId = () => {
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


    let handleToggleHistory = async () => {
        try {
            if (!showHistory) {
                const res = await client.get(`get_all_activity?user_id=${userId}`);
                setHistory(res.data.history || []);
            }
        }
        catch (e) {
            console.log("error in fetching history", e);
        }
        finally {
            setShowHistory(!showHistory);
        }
    };

    return (
        <div className="homeContainer">
            <h1 className="headerTitle">Dashboard</h1>
            <div className="actionSection">
                <div className="actionBox">
                    <h3 className="actionTitle ">Start New Meeting</h3>
                    <button className="btn btn-primary" onClick={handleStartNewMeeting}>
                        Start New Meeting
                    </button>
                </div>

                <div className="actionBox">
                    <h3 className="actionTitle">Join Meeting</h3>
                    <div className="inputGroup">
                        <input className="inputField"
                            type="text"
                            placeholder="Enter Meeting Code"
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value)}
                        />
                        <button className="btn btn-primary" onClick={handleJoinMeeting}>
                            Join Meeting
                        </button>
                    </div>
                </div>
            </div>
            <div className="scheduleSection">
                <h3 className="actionTitle"> Schedule Your Meeting </h3>
                <form className="scheduleForm" onSubmit={handleScheduleMeeting}>
                    <input
                        type="text"
                        className="inputField scheduleInput"
                        placeholder="Meeting Title"
                        value={scheduleTitle}
                        onChange={(e) => setScheduleTitle(e.target.value)}
                    />
                    <input
                        type="datetime-local"
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        className="inputField scheduleInput"
                    />
                    <button type="submit" className="btn btn-primary">
                        Schedule Meeting
                    </button>
                </form>
            </div>
            <div className="history-section">
                <div className="history-header">
                    <h3 className="history-title">Your Activities</h3>
                    <button onClick={handleToggleHistory} className="btn btn-secondary">
                        {showHistory ? "Hide History" : "Show History"}
                    </button>
                </div>
                {showHistory && (
                    <div className="history-container">
                        {history.length === 0 ? (
                            <p className="empty-history">No past or scheduled meetings found.</p>
                        ) : (
                            <ul className="history-list">
                                {history.map((meeting) => (
                                    <li key={meeting._id} className="history-item">
                                        <div className="history-item-details">
                                            <h4 className="item-title">{meeting.title}</h4>
                                            <p className="item-text">
                                                Code: <strong>{meeting.meeting_id}</strong> | Status: <em>{meeting.status}</em>
                                            </p>

                                            {meeting.status === 'scheduled' && (
                                                <small className="item-dates">Scheduled for: {new Date(meeting.scheduled_for).toLocaleString()}</small>
                                            )}
                                            {meeting.status === 'completed' && meeting.ended_at && (
                                                <small className="item-dates">Ended at: {new Date(meeting.ended_at).toLocaleString()}</small>
                                            )}
                                        </div>

                                        {meeting.status !== 'completed' && (
                                            <button
                                                onClick={() => {
                                                    setJoinCode(meeting.meeting_id);
                                                    handleJoinMeeting();
                                                }}
                                                className="btn btn-info"
                                            >
                                                Join Now
                                            </button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default withAuth(HomeComponent);