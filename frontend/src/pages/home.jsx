import React from 'react'
import { useState, useEffect, useContext } from 'react';
import withAuth from '../utils/withAuth';
import "../styles/home.css";
import "../styles/MeetFlow_DesignSystem.css";
import { useNavigate } from "react-router-dom";
import { AuthContext, client } from "../contexts/AuthContext";



function HomeComponent() {
    const navigate = useNavigate();

    const { userData } = useContext(AuthContext);
    const userId = userData?.username || localStorage.getItem("username");
    const userEmail = userData?.email || localStorage.getItem("email");

    const [joinCode, setJoinCode] = useState("");
    const [scheduleTitle, setScheduleTitle] = useState("");
    const [scheduleDate, setScheduleDate] = useState("");
    const [history, setHistory] = useState([]);
    const [meetingTitle, setMeetingTitle] = useState("");
    const [activeTab, setActiveTab] = useState("dashboard");
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [recordings, setRecordings] = useState([]);
    const [activeVideoModal, setActiveVideoModal] = useState(null);

    const fetchRecordings = async () => {
        try {
            const currentUserId = userId || localStorage.getItem("username");
            if (!currentUserId) {
                return;
            }
            const response = await client.get(`/get_recordings? user_id=${currentUserId}`);
            const data = Array.isArray(response.data) ? response.data : response.data.recordings;
            setRecordings(data || []);
        } catch (error) {
            console.error("Error fetching recordings: ", error);
        }
    };

    useEffect(() => {
        fetchRecordings();
    }, [userId]);

    const handleDeleteRecording = async (id) => {
        if (!window.confirm("Are you sure you want to delete this recording ?")) {
            return;
        }
        try {
            await client.delete(`/delete_recordings/${id}`);
            setRecordings((prev) => prev.filter((rec) => rec._id !== id));
        } catch (error) {
            console.error("Error deleting recording:", error);
            alert("failed to delete recording.");
        }
    };


    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

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
            fetchHistory();
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

    const upcomingMeetings = history.filter(m => {
        if (m.status !== 'scheduled') return false;
        return currentTime >= new Date(m.scheduled_for);
    });

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

                    {/* Notification Bell */}
                    <div className="profile-container">
                        <div className="notification-icon" onClick={() => {
                            setShowNotifications(!showNotifications);
                            setShowProfileMenu(false);
                        }}>
                            <i className="fa-solid fa-bell"></i>
                            {upcomingMeetings.length > 0 && (
                                <span className="notification-badge">{upcomingMeetings.length}</span>
                            )}
                        </div>
                        {showNotifications && (
                            <div className="profile-dropdown glass-panel notification-dropdown">
                                <div className="dropdown-header">
                                    <h4>Notifications</h4>
                                </div>
                                <hr className="dropdown-divider" />
                                <div className="notification-list">
                                    {upcomingMeetings.length === 0 ? (
                                        <p className="user-email" style={{ textAlign: 'center', padding: '1rem 0' }}>No upcoming meetings</p>
                                    ) : (
                                        upcomingMeetings.map(meeting => (
                                            <div key={meeting._id} className="notification-item" onClick={() => handleSidebarClick('scheduled')}>
                                                <div className="notification-dot"></div>
                                                <div className="notification-content">
                                                    <strong>{meeting.title}</strong>
                                                    <span>{new Date(meeting.scheduled_for).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="profile-container">
                        <div className="profile-avatar"
                            onClick={() => {
                                setShowProfileMenu(!showProfileMenu);
                                setShowNotifications(false);
                            }}
                        >
                            {userId ? userId.charAt(0).toUpperCase() : "U"}
                        </div>
                        {showProfileMenu && (
                            <div className="profile-dropdown glass-panel">
                                <div className="dropdown-header">
                                    <h4>{userId}</h4>
                                    <p className="user-email">{userEmail}</p>
                                </div>
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
                            style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                        >
                            <i class="fa-solid fa-house"></i>
                            Dashboard
                        </li>
                        <li
                            className={activeTab === "scheduled" ? "active" : ""}
                            onClick={() => handleSidebarClick("scheduled")}
                            style={{ display: 'flex', alignItems: 'center', gap: '10px', }}
                        >
                            <i className="fa-solid fa-calendar-days"></i>
                            Scheduled
                        </li>
                        <li
                            className={activeTab === "history" ? "active" : ""}
                            onClick={() => handleSidebarClick("history")}
                            style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                        >
                            <i className="fa-solid fa-clock-rotate-left"></i>
                            History
                        </li>
                        <li
                            className={activeTab === "recordings" ? "active" : ""}
                            onClick={() => handleSidebarClick("recordings")}
                            style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                        >
                            <i className="fa-solid fa-video"></i>
                            Recordings
                        </li>
                    </ul>

                    {/* Bottom Sidebar Actions */}
                    <ul className="sidebar-nav" style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        <li
                            className={activeTab === "settings" ? "active" : ""}
                            onClick={() => handleSidebarClick("settings")}
                            style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                        >
                            <i className="fa-solid fa-gear"></i>
                            Settings
                        </li>
                        <li
                            onClick={handleLogout}
                            style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ef4444' }}
                        >
                            <i className="fa-solid fa-right-from-bracket"></i>
                            Log Out
                        </li>
                    </ul>
                </aside>

                {/* Main Content on the Right */}
                <main className="home-content">
                    {/* Render Dashboard Tab */}
                    {activeTab === "dashboard" && (
                        <div className="dashboard-tab-content">
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
                            {/*Recent Activities section*/}
                            <div className="recent-activities-section">
                                {/* Up Next (Meetings) */}
                                <div className="recent-meetings-column">
                                    <h3 className="section-title-dash">UP NEXT</h3>
                                    <div className="vertical-meetings-list">
                                        {history.filter(m => m.status === "scheduled").slice(0, 2).length === 0 ? (
                                            <p className="empty-subtext">No upcoming meetings</p>
                                        ) : (
                                            history.filter(m => m.status === "scheduled").slice(0, 2).map(meeting => (
                                                <div key={meeting._id} className="dash-meeting-card light-card">
                                                    <div className="dash-meeting-info">
                                                        <h4>{meeting.title}</h4>
                                                        <p>
                                                            {new Date(meeting.scheduled_for || Date.now()).toLocaleDateString()} • {meeting.guests ? meeting.guests.length : 2} guests
                                                        </p>
                                                    </div>
                                                    <button className="join-now-btn" onClick={() => handleJoinMeeting(meeting.meeting_id, meeting.title)}>
                                                        Join
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                                {/* Recent Recordings */}
                                <div className="recent-recordings-column">
                                    <h3 className="section-title-dash">RECENT RECORDINGS</h3>
                                    <div className="horizontal-recordings-list">
                                        {recordings.length === 0 ? (
                                            <p className="empty-subtext"> No Recordings Yet</p>
                                        ) : (
                                            recordings.slice(0, 3).map((rec) => (
                                                <div key={rec._id}
                                                    className="dash-recording-card light-card"
                                                    style={{ cursor: "pointer" }}
                                                    onClick={() => setActiveVideoModal(rec.video_url)}
                                                >
                                                    <div className="recording-thumbnail">
                                                        <i className="fa-regular fa-circle-play"></i>
                                                    </div>
                                                    <div className="recording-details">
                                                        <h4>{rec.title}</h4>
                                                        <p>
                                                            {new Date(rec.date).toLocaleDateString()} • {rec.duration}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
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
                        <section className="history-section glass-panel">
                            <div className="history-header-bar">
                                <h2>My Meeting Recordings</h2>
                                <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                                    {recordings.length} {recordings.length === 1 ? "recording" : "recordings"} saved on Cloudinary
                                </span>
                            </div>
                            {recordings.length === 0 ? (
                                <div className="empty-history">
                                    <p>You haven't recorded any meetings yet.</p>
                                    <small style={{ color: "var(--text-muted)" }}>
                                        Click the Record button during any live meeting to save it here.
                                    </small>
                                </div>
                            ) : (
                                <div style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                                    gap: "1.5rem",
                                    marginTop: "1.5rem"
                                }}>
                                    {recordings.map((rec) => (
                                        <div
                                            key={rec._id}
                                            className="glass-panel"
                                            style={{
                                                padding: "1.2rem",
                                                borderRadius: "16px",
                                                display: "flex",
                                                flexDirection: "column",
                                                justifyContent: "space-between",
                                                border: "1px solid rgba(255, 255, 255, 0.1)"
                                            }}
                                        >
                                            <div>
                                                {/* Thumbnail Container */}
                                                <div
                                                    onClick={() => setActiveVideoModal(rec.video_url)}
                                                    style={{
                                                        height: "150px",
                                                        borderRadius: "12px",
                                                        backgroundColor: "rgba(0, 0, 0, 0.6)",
                                                        position: "relative",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        cursor: "pointer",
                                                        overflow: "hidden",
                                                        marginBottom: "1rem"
                                                    }}
                                                >
                                                    <video
                                                        src={rec.video_url}
                                                        style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.5 }}
                                                    />
                                                    <div style={{
                                                        position: "absolute",
                                                        width: "44px",
                                                        height: "44px",
                                                        borderRadius: "50%",
                                                        backgroundColor: "var(--primary-glow, #6366f1)",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        color: "white",
                                                        fontSize: "1.1rem",
                                                        boxShadow: "0 4px 15px rgba(99, 102, 241, 0.5)"
                                                    }}>
                                                        ▶
                                                    </div>
                                                    <span style={{
                                                        position: "absolute",
                                                        bottom: "8px",
                                                        right: "8px",
                                                        backgroundColor: "rgba(0,0,0,0.85)",
                                                        color: "white",
                                                        fontSize: "0.75rem",
                                                        padding: "2px 8px",
                                                        borderRadius: "4px"
                                                    }}>
                                                        {rec.duration}
                                                    </span>
                                                </div>
                                                {/* Title & Date */}
                                                <h4 style={{ color: "white", margin: "0 0 6px 0", fontSize: "1.05rem" }}>
                                                    {rec.title}
                                                </h4>
                                                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: "0 0 12px 0" }}>
                                                    Room: {rec.meeting_id} • {new Date(rec.date).toLocaleDateString()}
                                                </p>
                                            </div>
                                            {/* Action Buttons */}
                                            <div style={{ display: "flex", gap: "0.6rem", marginTop: "0.8rem" }}>
                                                <button
                                                    className="btn-primary"
                                                    style={{ flex: 1, padding: "8px 10px", fontSize: "0.85rem" }}
                                                    onClick={() => setActiveVideoModal(rec.video_url)}
                                                >
                                                    Watch
                                                </button>
                                                <a
                                                    href={rec.video_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    download={`recording-${rec.meeting_id}.webm`}
                                                    className="btn-outline"
                                                    style={{
                                                        textDecoration: "none",
                                                        padding: "8px 12px",
                                                        fontSize: "0.85rem",
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        justifyContent: "center"
                                                    }}
                                                    title="Download Video"
                                                >
                                                    ⬇
                                                </a>
                                                <button
                                                    className="delete-btn"
                                                    style={{ minWidth: "auto", padding: "8px 12px" }}
                                                    onClick={() => handleDeleteRecording(rec._id)}
                                                    title="Delete Recording"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    )}
                </main>
            </div>
            {/* Playback Modal */}
            {activeVideoModal && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        backgroundColor: "rgba(0, 0, 0, 0.85)",
                        backdropFilter: "blur(8px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 9999,
                    }}
                    onClick={() => setActiveVideoModal(null)}
                >
                    <div
                        style={{
                            width: "90%",
                            maxWidth: "900px",
                            backgroundColor: "#171827",
                            borderRadius: "16px",
                            overflow: "hidden",
                            boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
                            border: "1px solid rgba(255, 255, 255, 0.15)",
                            position: "relative",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "1rem 1.5rem",
                            borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
                        }}>
                            <h3 style={{ color: "white", margin: 0, fontSize: "1.1rem" }}>
                                Recording Playback
                            </h3>
                            <button
                                onClick={() => setActiveVideoModal(null)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    color: "white",
                                    fontSize: "1.5rem",
                                    cursor: "pointer",
                                    lineHeight: 1
                                }}
                            >
                                ✕
                            </button>
                        </div>
                        <video
                            src={activeVideoModal}
                            controls
                            autoPlay
                            style={{ width: "100%", maxHeight: "72vh", display: "block", backgroundColor: "black" }}
                        />
                    </div>
                </div>
            )}
        </div >
    );
}

export default withAuth(HomeComponent);