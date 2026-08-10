import mongoose, { Schema } from 'mongoose';

const meetingSchema = new Schema({
    user_id: {
        type: String
    },
    meeting_id: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        default: "Instant Meeting",
    },
    date: {
        type: Date,
        default: Date.now,
        required: true,
    },
    status: {
        type: String,
        enum: ['scheduled', 'ongoing', 'completed'],
        default: 'ongoing',
    },
    scheduled_for: {
        type: Date,
    },
    ended_at: {
        type: Date,
    }
});

const Meeting = mongoose.model('Meeting', meetingSchema);
export { Meeting };