import { Meeting } from '../models/meetingModel.js';
import { connections } from './socketManager.js';


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

const get_meeting_info = async (req, res) => {
    try {
        const { meetingId } = req.params;

        const meeting = await Meeting.findOne({ meeting_id: meetingId });
        const title = meeting ? meeting.title : "Instant Meeting";
        let attendeesCount = 0;

        for (const key in connections) {
            if (key.endsWith(meetingId)) {
                attendeesCount = connections[key].length;
                break;
            }
        }
        return res.status(200).json({ title, attendeesCount });
    } catch (err) {
        console.log("error getting meeting info:", err);
        return res.status(500).json({ message: "Failed to fetch meeting info" });
    }
};

export { add_to_activity, get_all_activity, get_meeting_info };
