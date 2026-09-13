import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { IconButton } from "@mui/material";
import Badge from "@mui/material/Badge";
import VideoCamIcon from "@mui/icons-material/Videocam";
import VideoCamOffIcon from "@mui/icons-material/VideocamOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import ChatIcon from "@mui/icons-material/Chat";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import StopCircleIcon from "@mui/icons-material/StopCircle";
import { io } from "socket.io-client";
import styles from "../styles/videoMeet.module.css";
import ChatBox from "../components/ChatBox";
import VideoComponent from "../components/VideoComponent";
import VideoLobby from "../components/videoLobby";
import { client } from "../contexts/AuthContext";


const server_url = "http://localhost:8000";

let connections = {};
let pendingCandidates = {};
let negotiating = {};

const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export default function VideoMeet() {
  var socketRef = useRef();
  let socketIdRef = useRef();
  let localVideoRef = useRef();
  let videoRef = useRef([]);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);

  let [videoAvailable, setVideoAvailable] = useState(true);
  let [audioAvailable, setAudioAvailable] = useState(true);
  let [video, setVideo] = useState(undefined);
  let [audio, setAudio] = useState(undefined);
  let isMediaLoaded = useRef(false);
  let [screen, setScreen] = useState();
  let [showChat, setShowChat] = useState(false);
  let [screenAvailable, setScreenAvailable] = useState();
  let [messages, setMessages] = useState([]);
  let [newMessages, setNewMessages] = useState(0);
  let [askForUsername, setAskForUsername] = useState(true);
  let [username, setUsername] = useState("");
  let [videos, setVideos] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const location = useLocation();
  const [meetingTitle, setMeetingTitle] = useState(location.state?.title || "Loading...");
  const [attendeesCount, setAttendeesCount] = useState(0);

  useEffect(() => {
    const fetchMeetingInfo = async () => {
      try {
        const meetingCode = window.location.pathname.split('/').pop();
        const response = await client.get(`/get_meeting_info/${meetingCode}`);

        setMeetingTitle(response.data.title);
        setAttendeesCount(response.data.attendeesCount);
      } catch (error) {
        console.log("Error fetching meeting info", error);
        if (meetingTitle === "Loading...") {
          setMeetingTitle("Instant Meeting");
        }
      }
    };

    fetchMeetingInfo();
  }, []);

  useEffect(() => {
    getPermissions();
  }, []);

  useEffect(() => {
    return () => {
      if (window.localStream) {
        window.localStream.getTracks().forEach((track) => track.stop());
      }
      for (let id in connections) {
        connections[id].close();
      }
      connections = {};
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (video !== undefined && audio !== undefined) {
      if (!isMediaLoaded.current) {
        isMediaLoaded.current = true;
        return;
      }
      getUserMedia();
    }
  }, [video, audio]);

  let makeOffer = (id) => {
    if (!connections[id]) {
      console.log("No connection found for id:", id);
      return;
    }
    if (negotiating[id] || connections[id].signalingState !== "stable") {
      console.log(
        "Skipping offer for",
        id,
        "| signalingState:",
        connections[id].signalingState,
        "| negotiating:",
        negotiating[id],
      );
      return;
    }
    negotiating[id] = true;
    connections[id]
      .createOffer()
      .then((description) => connections[id].setLocalDescription(description))
      .then(() => {
        socketRef.current.emit(
          "signal",
          id,
          JSON.stringify({ sdp: connections[id].localDescription }),
        );
      })
      .catch((e) => console.log("offer error:", e))
      .finally(() => {
        negotiating[id] = false;
      });
  };

  //getDisplayMedia

  const getPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      const hasVideo = stream.getVideoTracks().length > 0;
      const hasAudio = stream.getAudioTracks().length > 0;
      setVideoAvailable(hasVideo);
      setAudioAvailable(hasAudio);
      setScreenAvailable(!!navigator.mediaDevices.getDisplayMedia);

      window.localStream = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.log("getUserMedia failed:", err.name, err);
      setVideoAvailable(false);
      setAudioAvailable(false);

      let blackSilence = (...args) =>
        new MediaStream([black(...args), silence()]);
      window.localStream = blackSilence();
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = window.localStream;
      }
    }
  };

  let getMedia = async () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    connectToSocketServer();
  };

  let getUserMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }

    window.localStream = stream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

    for (let id in connections) {
      if (id === socketIdRef.current) continue;
      connections[id].addStream(window.localStream);
      makeOffer(id);
    }

    stream.getTracks().forEach(
      (track) =>
      (track.onended = () => {
        setVideo(false);
        setAudio(false);

        try {
          const currentVideo = localVideoRef.current;
          const currentStream = currentVideo?.srcObject;
          if (currentStream) {
            currentStream.getTracks().forEach((track) => track.stop());
          }
        } catch (e) {
          console.log(e);
        }

        let blackSilence = (...args) =>
          new MediaStream([black(...args), silence()]);
        window.localStream = blackSilence();
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = window.localStream;
        }

        for (let id in connections) {
          connections[id].addStream(window.localStream);
          makeOffer(id);
        }
      }),
    );
  };

  let getUserMedia = async () => {
    if (!localVideoRef.current) {
      return;
    }

    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices
        .getUserMedia({ video: video, audio: audio })
        .then(getUserMediaSuccess)
        .then((stream) => { })
        .catch((e) => console.log(e));
    } else {
      try {
        const currentStream = localVideoRef.current?.srcObject;
        if (currentStream) {
          currentStream.getTracks().forEach((track) => track.stop());
        }
      } catch (e) {
        console.log(e);
      }
    }
  };

  let getDisplayMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }
    window.localStream = stream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
    stream.getVideoTracks()[0].onended = () => {
      setScreen(false);
      getUserMedia();
    }
    for (let id in connections) {
      if (id === socketIdRef.current)
        continue;;
      const videoTrack = stream.getVideoTracks()[0];
      const senders = connections[id].getSenders();
      const sender = senders.find((s) => s.track && s.track.kind === "video");
      if (sender) {
        sender.replaceTrack(videoTrack);
      } else {
        connections[id].addStream(window.localStream);
        makeOffer(id);
      }
    }
  }

  let gotMessageFromServer = (fromId, message) => {
    var signal = typeof message === "string" ? JSON.parse(message) : message;
    console.log("Received signal from", fromId, ":", signal);
    if (fromId === socketIdRef.current) return;

    if (signal.sdp) {
      connections[fromId]
        .setRemoteDescription(new RTCSessionDescription(signal.sdp))
        .then(() => {
          if (pendingCandidates[fromId]) {
            pendingCandidates[fromId].forEach((c) =>
              connections[fromId]
                .addIceCandidate(c)
                .catch((e) => console.log(e)),
            );
            pendingCandidates[fromId] = [];
          }

          if (signal.sdp.type === "offer") {
            negotiating[fromId] = true;
            connections[fromId]
              .createAnswer()
              .then((description) =>
                connections[fromId].setLocalDescription(description),
              )
              .then(() => {
                socketRef.current.emit(
                  "signal",
                  fromId,
                  JSON.stringify({ sdp: connections[fromId].localDescription }),
                );
              })
              .catch((e) => console.log("Answer error:", e))
              .finally(() => {
                negotiating[fromId] = false;
              });
          }
        })
        .catch((e) => console.log("setRemoteDescription error:", e));
    }

    if (signal.ice) {
      const candidate = new RTCIceCandidate(signal.ice);
      if (
        connections[fromId].remoteDescription &&
        connections[fromId].remoteDescription.type
      ) {
        connections[fromId]
          .addIceCandidate(candidate)
          .catch((e) => console.log(e));
      } else {
        pendingCandidates[fromId] = pendingCandidates[fromId] || [];
        pendingCandidates[fromId].push(candidate);
      }
    }
  };

  let connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, { secure: false });
    socketRef.current.on("signal", gotMessageFromServer);
    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-call", window.location.href);
      socketIdRef.current = socketRef.current.id;
      socketRef.current.on("chat-message", addMessage);
      socketRef.current.on("user-left", (id) => {
        setVideos((videos) => videos.filter((video) => video.socketId != id));
        if (connections[id]) {
          connections[id].close();
          delete connections[id];
        }
      });
      socketRef.current.on("user-joined", (id, clients) => {
        clients.forEach((socketListId) => {
          if (connections[socketListId]) return;
          connections[socketListId] = new RTCPeerConnection(
            peerConfigConnections,
          );
          connections[socketListId].onicecandidate = (event) => {
            if (event.candidate != null) {
              socketRef.current.emit(
                "signal",
                socketListId,
                JSON.stringify({ ice: event.candidate }),
              );
            }
          };
          connections[socketListId].onaddstream = (event) => {
            setVideos((videos) => {
              let videoExists = videos.find(
                (video) => video.socketId === socketListId,
              );
              if (videoExists) {
                const updatedVideos = videos.map((video) =>
                  video.socketId === socketListId
                    ? { ...video, stream: event.stream }
                    : video,
                );
                videoRef.current = updatedVideos;
                return updatedVideos;
              } else {
                let newVideo = {
                  socketId: socketListId,
                  stream: event.stream,
                  autoPlay: true,
                  playsInline: true,
                };
                const updatedVideos = [...videos, newVideo];
                videoRef.current = updatedVideos;
                return updatedVideos;
              }
            });
          };
          if (window.localStream != undefined && window.localStream != null) {
            connections[socketListId].addStream(window.localStream);
          } else {
            let blackSilence = (...args) =>
              new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            connections[socketListId].addStream(window.localStream);
          }
        });
        if (id === socketIdRef.current) {
          for (let id2 in connections) {
            if (id2 === socketIdRef.current) continue;
            try {
              connections[id2].addStream(window.localStream);
            } catch (e) { }
            makeOffer(id2);
          }
        }
      });
    });
  };

  let silence = () => {
    let ctx = new AudioContext();
    let oscillator = ctx.createOscillator();
    let dst = oscillator.connect(ctx.createMediaStreamDestination());
    oscillator.start();
    ctx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  };

  let black = ({ width = 640, height = 480 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), {
      width,
      height,
    });
    canvas.getContext("2d").fillRect(0, 0, width, height);
    let stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0], { enabled: false });
  };

  let handleVideo = () => {
    setVideo(!video);
  }

  let handleAudio = () => {
    setAudio(!audio);
  }

  let handleScreen = () => {
    if (screen) {
      setScreen(false);
      getUserMedia();
    } else {
      navigator.mediaDevices.getDisplayMedia({ video: true, audio: false })
        .then((stream) => {
          setScreen(true);
          getDisplayMediaSuccess(stream);
        })
        .catch((error) => {
          console.log("screen share error", error);
        })
    }
  }
  // Format Duration of Recording
  const formatDuration = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  //Start Recording
  const startRecording = async () => {
    try {
      //ask user to select meeting tab with audio
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: { ideal: 30 } },
        audio: true,
      });
      //best supported video format
      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus") ? "video/webm;codecs=vp8,opus" : "video/webm";
      //initialize mediarecorder with the capture stream
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];
      //collect video chunks every 1 second
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
      //assemble blob and uppload recording to cloudinary
      mediaRecorder.onstop = async () => {
        clearInterval(recordingTimerRef.current);
        setIsRecording(false);
        setIsUploading(true);

        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
        const currentMeetingCode = window.location.pathname.split("/").pop();
        const currentUserId = localStorage.getItem("username") || username || "anonymous";
        const formData = new FormData();
        formData.append("video", blob, `recording-${currentMeetingCode}-${Date.now()}.webm`);
        formData.append("meeting_id", currentMeetingCode);
        formData.append("user_id", currentUserId);
        formData.append("title", meetingTitle || "Meeting Recording");
        formData.append("duration", formatDuration(recordingTime));

        try {
          await client.post("/upload_recording", formData);
          alert("Recording uploaded to cloudinary successfully");
        } catch (err) {
          console.error("Error uploading recording:", err);
          alert("Failed to upload recording to cloudinary.");
        } finally {
          setIsUploading(false);
          setRecordingTime(0);
        }
      };
      //if user stop sharing via browser
      stream.getVideoTracks()[0].onended = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
          mediaRecorderRef.current.stop();
        }
      };
      //start collecting data in 1-sec chunks
      mediaRecorder.start(1000);
      setIsRecording(true);
      //start timer
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Failed to start recording:", err);
    }
  };

  //stop recording manually
  const stopRecording = async () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      }
    }
  };

  //toggle button handler
  const handleToggleRecording = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  let handleEndCall = async () => {
    try {
      if (isRecording) {
        stopRecording();
      }
      let tracks = localVideoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }
    window.location.href = "/home";
  };

  let openChat = () => {
    setShowChat(true);
    setNewMessages(0);
  };

  let closeChat = () => {
    setShowChat(false);
  };


  let addMessage = (data, sender, socketIdSender) => {
    setMessages((prevMessages) => [
      ...prevMessages, { sender: sender, data: data, socketIdSender: socketIdSender }
    ]);
    if (socketIdSender !== socketIdRef.current) {
      setNewMessages((prevMessages) => prevMessages + 1);
    }
  };

  let connect = () => {
    setAskForUsername(false);
    getMedia();
  };

  return (
    <div>
      {askForUsername === true ? (
        <VideoLobby
          username={username}
          setUsername={setUsername}
          audioAvailable={audioAvailable}
          setAudioAvailable={setAudioAvailable}
          videoAvailable={videoAvailable}
          setVideoAvailable={setVideoAvailable}
          connect={connect}
          localVideoRef={localVideoRef}
          meetingTitle={meetingTitle}
          attendeesCount={attendeesCount}
        />
      ) : (
        <div className={styles.mainContainer}>
          <div className={styles.meetVideoContainer}>
            <div className={styles.buttonContainer}>
              {isRecording && (
                <div style={{
                  position: "absolute",
                  top: "-55px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  backgroundColor: "rgba(220, 38, 38, 0.95)",
                  color: "white",
                  padding: "6px 18px",
                  borderRadius: "20px",
                  fontWeight: "700",
                  fontSize: "0.9rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 0 15px rgba(239, 68, 68, 0.7)",
                  letterSpacing: "1px"
                }}>
                  <span style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    backgroundColor: "white",
                    display: "inline-block"
                  }}></span>
                  REC {formatDuration(recordingTime)}
                </div>
              )}
              {isUploading && (
                <div style={{
                  position: "absolute",
                  top: "-55px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  backgroundColor: "rgba(59, 130, 246, 0.95)",
                  color: "white",
                  padding: "6px 18px",
                  borderRadius: "20px",
                  fontWeight: "600",
                  fontSize: "0.9rem",
                  boxShadow: "0 0 15px rgba(59, 130, 246, 0.6)"
                }}>
                  Uploading to Cloudinary... ⏳
                </div>
              )}
              <IconButton onClick={handleVideo} style={{ color: "white" }}>
                {video === true ? <VideoCamIcon /> : <VideoCamOffIcon />}
              </IconButton>
              <IconButton onClick={handleEndCall} style={{ color: "red" }}>
                <CallEndIcon />
              </IconButton>
              <IconButton onClick={handleAudio} style={{ color: "white" }}>
                {audio === true ? <MicIcon /> : <MicOffIcon />}
              </IconButton>
              <IconButton
                onClick={handleToggleRecording}
                disabled={isUploading}
                style={{ color: isRecording ? "#ef4444" : "white" }}
                title={isRecording ? "Stop Recording" : "Start Recording"}
              >
                {isRecording ? <StopCircleIcon /> : <RadioButtonCheckedIcon />}
              </IconButton>
              {screenAvailable === true ? (
                <IconButton onClick={handleScreen} style={{ color: "white" }}>
                  {screen === true ? (
                    <ScreenShareIcon />
                  ) : (
                    <StopScreenShareIcon />
                  )}
                </IconButton>
              ) : (
                <></>
              )}
              <Badge badgeContent={newMessages} max={999} color="secondary">
                <IconButton onClick={openChat} style={{ color: "white" }}>
                  <ChatIcon />
                </IconButton>
              </Badge>
            </div>
            <VideoComponent localVideoRef={localVideoRef} videos={videos} />
          </div>
          {showChat && (
            <ChatBox
              closeChat={closeChat}
              messages={messages}
              socket={socketRef.current}
              username={username}
            />
          )}
        </div>
      )}
    </div>
  );
}
