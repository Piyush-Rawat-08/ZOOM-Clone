import mongoose, { Schema } from "mongoose";

const recordingSchema = new Schema({
    user_id: {
        type: String,
        required: true,
    },
    meeting_id: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        default: "Meeting Recording",
    },
    video_url: {
        type: String,
        required: true,
    },
    cloudinary_id: {
        type: String,
        required: true,
    },
    duration: {
        type: String,
        default: "00:00",
    },
    size: {
        type: Number,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

const Recording = mongoose.model("Recording", recordingSchema);
export { Recording };
