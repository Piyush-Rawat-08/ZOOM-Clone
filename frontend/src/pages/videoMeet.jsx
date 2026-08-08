import React from "react";
import { useEffect, useRef, useState } from "react";
import { Button, IconButton, TextField } from "@mui/material";
import Badge from "@mui/material/Badge";
import VideoCamIcon from "@mui/icons-material/Videocam";
import VideoCamOffIcon from "@mui/icons-material/VideocamOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import ChatIcon from "@mui/icons-material/Chat";
import { io } from "socket.io-client";
import styles from "../styles/videoMeet.module.css";

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

  let [videoAvailable, setVideoAvailable] = useState(true);
  let [audioAvailable, setAudioAvailable] = useState(true);
  let [video, setVideo] = useState(undefined);
  let [audio, setAudio] = useState(undefined);
  let isMediaLoaded = useRef(false);
  let [screen, setScreen] = useState();
  let [showModal, setShowModal] = useState();
  let [screenAvailable, setScreenAvailable] = useState();
  let [messages, setMessages] = useState([]);
  let [message, setMessage] = useState("");
  let [newMessages, setNewMessages] = useState(3);
  let [askForUsername, setAskForUsername] = useState(true);
  let [username, setUsername] = useState("");
  let [videos, setVideos] = useState([]);

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
      //socketRef.current.on("chat-message", addMessage);
      socketRef.current.on("user-left", (id) => {
        setVideos((videos) => videos.filter((video) => video.socketId != id));
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

  //handleEndCall

  //openChat

  //closeChat

  //handleMessage

  //addMessage

  //sendMessage

  let connect = () => {
    setAskForUsername(false);
    getMedia();
  };

  return (
    <div>
      {askForUsername === true ? (
        <div>
          <h1>Video Lobby</h1>
          <TextField
            id="outlined-basic"
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            variant="outlined"
          />
          <br />
          <Button variant="contained" onClick={connect}>
            Connect
          </Button>

          <div>
            <video
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
          </div>
        </div>
      ) : (
        <div className={styles.meetVideoContainer}>
          <div className={styles.buttonContainer}>
            <IconButton onClick={handleVideo} style={{ color: "white" }}>
              {video === true ? <VideoCamIcon /> : <VideoCamOffIcon />}
            </IconButton>
            <IconButton style={{ color: "red" }}>
              <CallEndIcon />
            </IconButton>
            <IconButton onClick={handleAudio} style={{ color: "white" }}>
              {audio === true ? <MicIcon /> : <MicOffIcon />}
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
              <IconButton style={{ color: "white" }}>
                <ChatIcon />
              </IconButton>
            </Badge>
          </div>
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
                  className={styles.conferenceVideo}
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
        </div>
      )}
    </div>
  );
}
