import { Meeting } from '../models/meetingModel.js';


const add_to_activity = async (req, res) => {
    try {
        const {
            user_id,
            meeting_id,
            title,
            date,
            status,
            isScheduled,
            scheduledDate
        } = req.body;
        const meetingStatus = isScheduled ? 'scheduled' : 'ongoing';
        const newMeeting = new Meeting({
            user_id: user_id,
            meeting_id: meeting_id,
            title: title || "Instant Meeting",
            date: date,
            status: meetingStatus,
            scheduled_for: scheduledDate || null,
        })
        await newMeeting.save();
        return res.status(201).json({ message: "Meeting added to activity", meeting: newMeeting });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Something went wrong", error: err });
    }
};

/*const update_activity_end = async (req, res) => {
    try {
        const { meeting_id } = req.body;

        const updatedMeeting = await Meeting.updateMany(
            { meeting_id: meeting_id },
            { status: 'completed', ended_at: Date.now() }
        );
        return res.status(200).json({ message: "meeting completed", meeting: updatedMeeting });
    }
    catch (err) {
        return res.status(500).json({ message: "Error updating meeting", error: err });
    }
};*/

const get_all_activity = async (req, res) => {
    try {
        const { user_id } = req.query;

        const history = await Meeting.find({ user_id: user_id }).sort({ date: -1 });

        return res.status(200).json({ message: "History fetched successfully", history: history });
    }
    catch (e) {
        return res.status(500).json({ message: "Error fetching history", error: e });
    }
};

export { add_to_activity, update_activity_end, get_all_activity };
