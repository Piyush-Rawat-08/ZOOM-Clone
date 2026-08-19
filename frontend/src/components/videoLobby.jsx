import React from 'react';
import styles from '../styles/videoMeet.module.css';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';


export default function VideoLobby({
    username,
    setUsername,
    audioAvailable,
    setAudioAvailable,
    videoAvailable,
    setVideoAvailable,
    connect,
    localVideoRef
}) {

    const toggleAudio = () => {
        const newState = !audioAvailable;
        setAudioAvailable(newState);
        if (window.localStream) {
            window.localStream.getAudioTracks().forEach(track => {
                track.enabled = newState;
            });
        }
    }

    const toggleVideo = () => {
        const newState = !videoAvailable;
        setVideoAvailable(newState);
        if (window.localStream) {
            window.localStream.getVideoTracks().forEach(track => {
                track.enabled = newState;
            });
        }
    }

    return (
        <div className={styles.lobbyContainer}>
            <div className={styles.lobbyHeaderLogo}>MeetFlow</div>
            <div className={styles.lobbyCard}>
                <div className={styles.videoPreviewWrapper}>
                    <video className={styles.videoPreview}
                        ref={(ref) => {
                            if (ref) {
                                localVideoRef.current = ref;
                                if (ref.srcObject != window.localStream) {
                                    ref.srcObject = window.localStream;
                                }
                            }
                        }}
                        autoPlay
                        muted
                    ></video>
                </div>
                <div className={styles.controlButtons}>
                    <button className=
                        {`${styles.roundBtn} 
                      ${!audioAvailable ? styles.roundBtnDanger : ''}`}
                        onClick={toggleAudio}
                    >
                        {audioAvailable ? <MicIcon /> : <MicOffIcon />}
                    </button>

                    <button className=
                        {`${styles.roundBtn} 
                      ${!videoAvailable ? styles.roundBtnDanger : ''}`}
                        onClick={toggleVideo}
                    >
                        {videoAvailable ? <VideocamIcon /> : <VideocamOffIcon />}
                    </button>
                </div>

                <div className={styles.joinSection}>
                    <input
                        type="text"
                        className={styles.nameInput}
                        placeholder="Enter your name"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <button
                        className={styles.joinBtn}
                        onClick={connect}
                    >
                        Join Meeting
                    </button>
                </div>
            </div>
        </div>
    )

}
