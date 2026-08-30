# Meeting Recordings Feature Architecture

This document outlines the complete logic, workflow, and technology stack required to implement a "Meeting Recordings" feature for MeetFlow.

> [!NOTE]
> As requested, there is **no code** here. This is a high-level architectural blueprint to help you understand exactly how the system will work before we build it.

---

## 1. The Technology Stack

Since you are already using a MERN stack (MongoDB, Express, React, Node.js) with WebRTC for video, here is the specific tech we will add to handle recordings:

*   **Frontend Recording:** `MediaRecorder API` (This is built directly into modern browsers. It captures audio/video streams in real-time).
*   **File Transport:** `FormData` (Used to send large binary video files from React to your Node.js server).
*   **Backend File Handling:** `Multer` (A Node.js middleware that catches the uploaded video files).
*   **Storage (Database vs Cloud):** 
    *   *Metadata (MongoDB):* We will store the meeting ID, user ID, date, and the *URL* of the video.
    *   *Video Files (Cloud/Local):* Videos are huge. We should NOT store them in MongoDB. We will store the actual `.webm` or `.mp4` files.

---

## 2. The Complete Workflow (Step-by-Step)

Here is exactly what happens from the moment a user clicks "Record" to the moment they watch the playback.

### Phase A: Capturing the Video (Frontend)
1. **The Trigger:** A user clicks the "Start Recording" button in the `videoMeet.jsx` UI.
2. **The Capture:** We initialize the browser's `MediaRecorder API`. We feed it the combined video/audio stream (the user's camera + microphone, and the remote peers' audio/video).
3. **The Buffer:** As the meeting happens, `MediaRecorder` silently collects the video data in small chunks (e.g., every 1 second) and stores them in the browser's temporary memory.
4. **The Stop:** The user clicks "Stop Recording" (or leaves the meeting). The browser takes all those tiny chunks and stitches them together into a single playable Video `Blob` (usually in `.webm` format).

### Phase B: Uploading & Storing (Backend)
1. **The Upload:** React takes that Video `Blob`, packages it into a `FormData` object, and sends a `POST` request to a new backend endpoint: `/api/upload-recording`.
2. **The Processing:** Your Node.js server receives the file using `Multer`.
3. **The Storage:** Node.js uploads the heavy video file to your Storage. 
4. **The Database:** Node.js creates a new document in MongoDB inside a `Recordings` collection. It saves:
    *   `userId`: The person who recorded it.
    *   `meetingId`: The room they were in.
    *   `videoUrl`: The link to the saved file.
    *   `timestamp`: When it was recorded.

### Phase C: Viewing the Recordings (Dashboard)
1. **The Fetch:** When the user goes to their Home Dashboard, React sends a `GET` request to `/api/get-recordings?userId=123`.
2. **The Display:** The backend searches MongoDB and returns the list of `videoUrls`. 
3. **The Playback:** We build a new section on your Dashboard UI called "My Recordings". We map through the database results and display standard `<video src="...">` tags so the user can click play right in the browser!

---

## 3. Strategic Decisions & Q&A

### A. The Best/Free Storage for Beginners
**Recommendation:** Start with **Local Server Storage (Disk).**
For a beginner project, you should just save the video files directly into an `/uploads` folder on your Node.js backend server. 
*   **Why it's best:** It is 100% free, requires zero setup, no API keys, and no credit cards. 
*   **The Catch:** If you ever deploy this app to a free hosting service (like Heroku or Render), they usually delete local files when the server restarts. 
*   **The Plan:** Build it using Local Storage first. Once the recording logic works perfectly on your machine, we can swap it to **Cloudinary** (which has a fantastic free tier for video hosting) before you show it off to the world!

### B. Individual Control & Privacy
*Because the user wants complete control over their own recordings and should only see their own videos.*
*   This is perfectly handled by **Client-Side Recording**. Because the `MediaRecorder` runs entirely inside the user's personal browser (Chrome/Edge), it only starts recording when *they* click the button, and only stops when *they* want.
*   When they upload it, we tag the video file in MongoDB with their specific `userId`. 
*   When they load their Dashboard, the backend will only return videos where `userId === their_user_id`. They will never see anyone else's recordings!

### C. Performance Impact (Multiple Users Recording)
*What happens if 3 users in the same meeting are recording simultaneously?*
*   **During the meeting: ZERO impact on your server.** Because the recording is happening on the *Client-Side* (inside their browser), the heavy lifting of processing the video is being done by the user's own laptop (CPU/RAM). Your Node.js server doesn't even know they are recording! The live video chat will remain perfectly fast and smooth.
*   **After the meeting: A small spike in network traffic.** The only time your server will feel any load is the moment they click "Stop Recording". At that exact second, all 3 browsers will try to send a heavy video file to your Node.js server to be saved. It might take a few seconds to upload depending on their internet speed, but because it happens *after* the recording is done, it won't interrupt the live meeting at all!

---

## 4. Next Steps

When you are ready to begin, we can tackle this in three stages:
1. **Frontend UI:** Adding the Record button and state to `videoMeet.jsx`.
2. **Browser Logic:** Writing the `MediaRecorder` logic to capture the streams.
3. **Backend Storage:** Setting up Multer and the MongoDB models to save and retrieve the files.
