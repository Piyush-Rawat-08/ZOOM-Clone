# Add Sidebar and Zoom Features (History, Recordings, Schedule)

This plan outlines the architecture, logic, and flow for implementing a new sidebar on the home page with History, Recordings, and Schedule Meeting features, along with Cloudinary integration for recording storage.

## User Review Required

> [!IMPORTANT]
> **Cloudinary Integration Strategy**: Do you want the video recording to be uploaded to Cloudinary directly from the frontend (using Cloudinary Upload Widget/unsigned uploads) or uploaded via the backend server? Client-side is better for large video files so we don't overload your Node.js backend server, but server-side is typically more secure. The current plan assumes we will send the recorded `Blob` from the frontend to the backend, which will then stream it to Cloudinary.

## Open Questions

- **Attendees Count**: Should this be calculated by tracking every user who joins the socket room during the meeting, and then saving that final number to the meeting database when the meeting ends?
- **Recording Source**: How will the meeting recording be generated? Usually, we use the `MediaRecorder` API on the frontend to record the screen and audio, capture the resulting `Blob` when the meeting ends, and then upload it. Is this the intended approach?

## Proposed Changes

### Frontend Component Structure

#### [MODIFY] `frontend/src/pages/home.jsx`
- Wrap the main content in a parent layout container (`display: flex`).
- Add a new Sidebar section on the left side with 3 feature buttons: **Recordings**, **History**, **Schedule Meeting**.
- Introduce an `activeTab` state (e.g., `'history'`, `'recordings'`, `'schedule'`) to track which feature the user has selected.
- Keep the "Start New Meeting" and "Join Meeting" action boxes permanently visible at the top of the main content area.
- Below the action boxes, add conditional rendering based on `activeTab`:
  - **History**: Fetch and map over past meetings. Display Date, Meeting Title, Attendees Count, and Status.
  - **Recordings**: Fetch meetings that have a `recordingUrl`. Display Date, Meeting Title, Duration, and a "View Recording" button that opens a video player modal or navigates to the Cloudinary URL.
  - **Schedule Meeting**: Display a calendar/form to pick a date and time, and side-by-side display a list of only *upcoming* scheduled meetings.

#### [MODIFY] `frontend/src/styles/home.css`
- Add CSS for the new flexbox layout: Sidebar on the left (`width: 250px`, fixed position or flex column) and the main dashboard on the right (`flex: 1`).
- Style the active state of the sidebar buttons to show which tab is currently selected.

### Backend Data Models

#### [MODIFY] `backend/src/models/meetingModel.js`
Add new fields to the schema to support the new features:
```javascript
  attendeesCount: { type: Number, default: 0 },
  recordingUrl: { type: String }, // Stores the Cloudinary video URL
  duration: { type: Number } // Duration of the meeting/recording in seconds
```

### Backend Cloudinary Integration

#### [NEW] `backend/src/utils/cloudinary.js`
- Install `cloudinary` and `multer` in the backend.
- Configure Cloudinary using credentials from environment variables (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`).

#### [MODIFY] `backend/src/routes/...`
- Create a new endpoint `POST /upload_recording` that accepts a video file (using Multer).
- The endpoint will upload the file to Cloudinary, retrieve the URL, and update the corresponding Meeting document with `recordingUrl` and `duration`.

## Verification Plan

### Manual Verification
- Start the frontend and backend servers.
- Verify the layout correctly places the sidebar on the left and the main actions on the right.
- Click each sidebar button and ensure the dynamic content area (below Start/Join Meeting) changes correctly.
- Verify that scheduling a new meeting immediately updates the side-by-side scheduled list.
- (Execution phase) Test a dummy video upload to ensure Cloudinary correctly stores the file and the database saves the URL.
