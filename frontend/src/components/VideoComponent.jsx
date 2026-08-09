import React from 'react';
import styles from '../styles/videoMeet.module.css';

export default function VideoComponent({ localVideoRef, videos }) {
  return (
    <>
      <video
        className={styles.meetUserVideo}
        ref={(ref) => {
          if (ref) {
            localVideoRef.current = ref;
            if (ref.srcObject !== window.localStream) {
              ref.srcObject = window.localStream;
            }
          }
        }}
        autoPlay
        muted
      ></video>
      <div className={styles.conferenceView}>
        {videos.map((video) => (
          <div key={video.socketId}>
            <video
              className={videos.length === 1 ? styles.expandedVideo : styles.conferenceVideo}
              data-socket={video.socketId}
              ref={(ref) => {
                if (ref && video.stream) {
                  ref.srcObject = video.stream;
                }
              }}
              autoPlay
              playsInline
            ></video>
          </div>
        ))}
      </div>
    </>
  );
}
