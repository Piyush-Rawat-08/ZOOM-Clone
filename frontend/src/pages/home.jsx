import React from 'react'
import { useState, useContext } from 'react';
import withAuth from '../utils/withAuth';
import "../styles/home.css";
import "../styles/MeetFlow_DesignSystem.css";
import { useNavigate } from "react-router-dom";
import { AuthContext, client } from "../contexts/AuthContext";



function HomeComponent() {
    const navigate = useNavigate();

    const [joinCode, setJoinCode] = useState("");
    const [scheduleTitle, setScheduleTitle] = useState("");
    const [scheduleDate, setScheduleDate] = useState("");
    const [history, setHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [meetingTitle, setMeetingTitle] = useState("");
    const [activeTab, setActiveTab] = useState("dashboard");

    const { userData } = useContext(AuthContext);
    const userId = userData?.username || localStorage.getItem("username");

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
                title: meetingTitle || "Instant Meeting",
                isScheduled: false,
                createdAt: new Date(),
            });
            navigate(`/${newMeetingId}`, {
                state: {
                    title: meetingTitle || "Instant Meeting"
                }
            });
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

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        navigate("/");
    };

    const fetchHistory = async () => {
        try {
            const res = await client.get(`get_all_activity?user_id=${userId}`);
            setHistory(res.data.history || []);
        }
        catch (e) {
            console.log("error in fetching history", e);
        }
    };

    const handleDeleteMeeting = async (meetingId) => {
        try {
            if (!window.confirm("Are you sure you want to delete this meeting from history?")) return;
            await client.delete(`/delete_activity?meeting_id=${meetingId}&user_id=${userId}`);
            setHistory(prevHistory => prevHistory.filter(m => m.meeting_id !== meetingId));
        } catch (e) {
            console.log("Error deleting meeting", e);
            alert("Failed to delete meeting.");
        }
    };


    const handleSidebarClick = (tab) => {
        setActiveTab(tab);
        if (tab === "history") {
            fetchHistory();
        }
    };


    return (
        <div className="home-minimal-container">
            {/* --- Top Header --- */}
            <header className="home-header">
                <div className="logo-text">MeetFlow</div>
                <div className="header-actions">
                    <span className="welcome-text">Welcome back, {userId}!</span>
                    <button className="btn-outline logout-btn" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </header>

            {/* --- 2. Split Screen Layout --- */}
            <div className="dashboard-layout">

                {/* Sidebar on the Left */}
                <aside className="sidebar glass-panel">
                    <ul className="sidebar-nav">
                        <li
                            className={activeTab === "dashboard" ? "active" : ""}
                            onClick={() => handleSidebarClick("dashboard")}
                        >
                            Dashboard
                        </li>
                        <li
                            className={activeTab === "history" ? "active" : ""}
                            onClick={() => handleSidebarClick("history")}
                        >
                            Meeting History
                        </li>
                        <li
                            className={activeTab === "recordings" ? "active" : ""}
                            onClick={() => handleSidebarClick("recordings")}
                        >
                            My Recordings
                        </li>
                    </ul>
                </aside>

                {/* Main Content on the Right */}
                <main className="home-content">
                    {/* Render Dashboard Tab */}
                    {activeTab === "dashboard" && (
                        <div className="actions-grid">
                            <div className="action-box start-box glass-panel">
                                <h3>Start New Meeting</h3>
                                <p className="box-subtext">Create an instant meeting</p>
                                <input
                                    type="text"
                                    className="glass-input"
                                    placeholder="Enter Meeting Title"
                                    value={meetingTitle}
                                    onChange={(e) => setMeetingTitle(e.target.value)}
                                />
                                <button className="btn-primary" onClick={handleStartNewMeeting}>
                                    Start Meeting
                                </button>
                            </div>
                            <div className="action-box join-box glass-panel">
                                <h3>Join Meeting</h3>
                                <p className="box-subtext">Enter code to join a room</p>
                                <input
                                    type="text"
                                    className="glass-input"
                                    placeholder="Enter Meeting Code"
                                    value={joinCode}
                                    onChange={(e) => setJoinCode(e.target.value)}
                                />
                                <button className="btn-primary" onClick={handleJoinMeeting}>
                                    Join Meeting →
                                </button>
                            </div>
                            <div className="action-box schedule-box glass-panel">
                                <h3>Schedule Meeting</h3>
                                <p className="box-subtext">Plan a future meeting</p>
                                <input
                                    type="text"
                                    className="glass-input"
                                    placeholder="Meeting Title"
                                    value={scheduleTitle}
                                    onChange={(e) => setScheduleTitle(e.target.value)}
                                />
                                <input
                                    type="datetime-local"
                                    className="glass-input"
                                    value={scheduleDate}
                                    onChange={(e) => setScheduleDate(e.target.value)}
                                />
                                <button className="btn-primary" onClick={handleScheduleMeeting}>
                                    Schedule
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Render History Tab */}
                    {activeTab === "history" && (
                        <section className="history-section glass-panel">
                            <div className="history-header-bar">
                                <h2>Your Activities</h2>
                            </div>

                            <div className="history-table-container">
                                {history.length === 0 ? (
                                    <p className="empty-history">No past or scheduled meetings found.</p>
                                ) : (
                                    <table className="custom-table">
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Meeting Title</th>
                                                <th>Status</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {history.map((meeting) => (
                                                <tr key={meeting._id}>
                                                    <td>
                                                        {meeting.status === 'scheduled'
                                                            ? new Date(meeting.scheduled_for).toLocaleDateString()
                                                            : new Date(meeting.createdAt || Date.now()).toLocaleDateString()
                                                        }
                                                    </td>
                                                    <td>
                                                        <strong>{meeting.title}</strong>
                                                        <br />
                                                        <small style={{ color: 'var(--text-muted)' }}>ID: {meeting.meeting_id}</small>
                                                    </td>
                                                    <td>
                                                        <span className={`status-badge ${meeting.status}`}>
                                                            {meeting.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {meeting.status !== 'completed' ? (
                                                            <button
                                                                onClick={() => {
                                                                    setJoinCode(meeting.meeting_id);
                                                                    handleJoinMeeting();
                                                                }}
                                                                className="btn-outline join-now-btn"
                                                                style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                                                            >
                                                                Join Now
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleDeleteMeeting(meeting.meeting_id)}
                                                                className="btn-outline delete-btn"
                                                            >
                                                                Delete
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </section>
                    )}


                    {/* Render Recordings Tab Placeholder */}
                    {activeTab === "recordings" && (
                        <section className="glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>
                            <h2 style={{ color: 'white', marginBottom: '1rem' }}>My Recordings</h2>
                            <p style={{ color: 'var(--text-muted)' }}>You haven't recorded any meetings yet. This feature is coming soon!</p>
                        </section>
                    )}
                </main>
            </div>
        </div >
    );
}

export default withAuth(HomeComponent);