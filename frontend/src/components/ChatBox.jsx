import React, { useRef } from 'react';
import { IconButton, TextField, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import styles from '../styles/videoMeet.module.css';

export default function ChatBox({ closeChat, messages, socket, username }) {
  const messageRef = useRef();

  const sendMessage = () => {
    const msg = messageRef.current.value;
    if (msg.trim() !== "") {
      socket.emit("chat-message", msg, username);
      messageRef.current.value = "";
    }
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader}>
        <span style={{ color: "white" }}>
          Chat with Friends <span style={{ color: "red", fontSize: "1.8rem" }}>&hearts;</span>
        </span>
        <IconButton onClick={closeChat}>
          <CloseIcon />
        </IconButton>
      </div>
      <div className={styles.chatMessages}>
        {messages.length === 0 ? (
          <p style={{ margin: 0, fontSize: "0.9rem", color: "#666" }}>Welcome to the chat!</p>
        ) : (
          messages.map((msg, index) => (
            <div key={index} style={{ marginBottom: "10px" }}>
              <span style={{ fontWeight: "bold", fontSize: "0.9rem" }}>{msg.sender}</span>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.9rem",
                  color: "black",
                  backgroundColor: "#f0f0f0",
                  padding: "5px 10px",
                  borderRadius: "8px",
                  display: "inline-block",
                }}
              >
                {msg.data}
              </p>
            </div>
          ))
        )}
      </div>
      <div className={styles.chatInputContainer}>
        <TextField
          inputRef={messageRef}
          variant="outlined"
          size="small"
          placeholder="Type a message..."
          fullWidth
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              sendMessage();
            }
          }}
        />
        <Button onClick={sendMessage} variant="contained" color="primary">
          Send
        </Button>
      </div>
    </div>
  );
}
