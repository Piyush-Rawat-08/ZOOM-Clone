import React from 'react'
import { useState, useEffect, useContext } from 'react';
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
    const [meetingTitle, setMeetingTitle] = useState("");
    const [activeTab, setActiveTab] = useState("dashboard");
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const { userData } = useContext(AuthContext);
    const userId = userData?.username || localStorage.getItem("username");
    const userEmail = userData?.email || localStorage.getItem("email");

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

    const handleJoinMeeting = async (codeToJoin = joinCode, titleToJoin = "Joined Meeting", scheduledFor = null) => {
        try {
            if (codeToJoin.trim() === "") {
                alert("Please enter a meeting code first");
                return;
            };

            if (scheduledFor) {
                const now = new Date();
                const scheduledTime = new Date(scheduledFor);
                if (now < scheduledTime) {
                    alert(`This meeting hasn't started yet!`);
                    return;
                }
            }
            await client.post('/add_to_activity', {
                user_id: userId,
                meeting_id: codeToJoin,
                isScheduled: false,
                title: titleToJoin,
                createdAt: new Date(),
            });
            navigate(`/${codeToJoin}`, {
                state: { title: titleToJoin }
            });
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
                scheduledDate: scheduleDate,
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
        if (tab === "history" || tab === "scheduled") {
            fetchHistory();
        }
    };


    return (
        <div className="home-minimal-container">
            {/* --- Top Header --- */}
            <header className="home-header">
                <div className="logo-container">
                    <span><img src="/meetflow_logo.png" className="brand-logo-img" alt="logo" /></span>
                    <div className="logo-text">MeetFlow</div>
                </div>

                <div className="header-actions">
                    <span className="welcome-text">Welcome back, {userId}!</span>
                    <div className="profile-container">
                        <div className="profile-avatar"
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                        >
                            {userId ? userId.charAt(0).toUpperCase() : "U"}
                        </div>
                        {showProfileMenu && (
                            <div className="profile-dropdown glass-panel">
                                <div className="dropdown-header">
                                    <h4>{userId}</h4>
                                    <p className="user-email">{userEmail}</p>
                                </div>
                                <hr className="dropdown-divider" />
                                <button className="btn-outline logout-btn-full" onClick={handleLogout}>
                                    Log Out
                                </button>
                            </div>
                        )}
                    </div>
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
                            className={activeTab === "scheduled" ? "active" : ""}
                            onClick={() => handleSidebarClick("scheduled")}
                        >
                            Scheduled Meetings
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
                                <button className="btn-primary" onClick={() => handleJoinMeeting(joinCode)}>
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

                    {/* Render Scheduled Meetings Tab */}
                    {activeTab === "scheduled" && (
                        <section className="history-section glass-panel">
                            <div className="history-header-bar">
                                <h2>Upcoming Scheduled Meetings</h2>
                            </div>
                            <div className="history-table-container">
                                {history.filter(m => m.status === 'scheduled').length === 0 ?
                                    (
                                        <p className="empty-history">No upcoming meetings scheduled.</p>
                                    ) : (
                                        <table className="custom-table">
                                            <thead>
                                                <tr>
                                                    <th>Date & time</th>
                                                    <th>Title</th>
                                                    <th>Status</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {history.filter(m => m.status === "scheduled").map((meeting) => (
                                                    <tr key={meeting._id}>
                                                        <td>
                                                            <strong>{new Date(meeting.scheduled_for).toLocaleDateString()}</strong>
                                                            <br />
                                                            <small style={{ color: 'var(--text-muted)' }}>
                                                                {new Date(meeting.scheduled_for).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </small>
                                                        </td>
                                                        <td>
                                                            <strong>{meeting.title}</strong>
                                                            <br />
                                                            <small style={{ color: 'var(--text-muted)' }}>
                                                                ID: {meeting.meeting_id}
                                                            </small>
                                                        </td>
                                                        <td>
                                                            <span className={`status-badge ${meeting.status}`}>
                                                                {meeting.status}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            {currentTime < new Date(meeting.scheduled_for) ? (
                                                                <button
                                                                    onClick={() => handleDeleteMeeting(meeting.meeting_id)}
                                                                    className="btn-outline delete-btn"
                                                                >
                                                                    Delete
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleJoinMeeting(meeting.meeting_id, meeting.title, meeting.scheduled_for)}
                                                                    className="btn-outline join-now-btn"
                                                                >
                                                                    Join Now
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )
                                }
                            </div>
                        </section>
                    )}


                    {/* Render History Tab */}
                    {activeTab === "history" && (
                        <section className="history-section glass-panel">
                            <div className="history-header-bar">
                                <h2>Your Activities</h2>
                            </div>

                            <div className="history-table-container">
                                {history.filter(m => m.status !== "scheduled").length === 0 ? (
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
                                            {history.filter(m => m.status !== "scheduled").map((meeting) => (
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
                                                                    handleJoinMeeting(meeting.meeting_id, meeting.title);
                                                                }}
                                                                className="btn-outline join-now-btn"
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