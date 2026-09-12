import multer from "multer";
import { Readable } from "stream";
import cloudinary from "../config/cloudinary.js";
import { Recording } from "../models/recordingModel.js";

const storage = multer.memoryStorage();
export const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 * 10 },
});

//Upload video to Cloudinary & Save to MongoDB
export const uploadRecording = async (req, res) => {
    try {
        const { user_id, meeting_id, title, duration } = req.body;
        if (!req.file) {
            return res.status(400).json({
                message: "No video file provided"
            });
        }
        // Stream buffer directly to cloudinary
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type: "video",
                folder: "meetflow_recordings",
            },
            async (error, result) => {
                if (error) {
                    console.error("cloudinary upload error:", error);
                    return res.status(500).json({ message: "cloudinary upload failed", error });
                }
                try {
                    const newRecording = new Recording({
                        user_id: user_id,
                        meeting_id: meeting_id,
                        title: title || "Meeting Recording",
                        video_url: result.secure_url,
                        cloudinary_id: result.public_id,
                        duration: duration || (result.duration ? `${Math.round(result.duration)}s` : "00:00"),
                        size: result.bytes,
                        date: new Date(),
                    });
                    await newRecording.save();
                    return res.status(201).json({
                        message: "Recording Uploaded Successfully",
                        recording: newRecording
                    });
                } catch (dbError) {
                    console.error("Database save error:", dbError);
                    return res.status(500).json({ message: "Database save failed", error: dbError });
                }
            }
        );
        Readable.from(req.file.buffer).pipe(uploadStream);
    } catch (err) {
        console.log("server upload error", err);
        return res.status(500).json({
            message: "server error during uppload",
            error: err
        });
    }
};

//Fetch all recordigs for a specific user
export const getUserRecordings = async (req, res) => {
    try {
        const { user_id } = req.query;
        if (!user_id) {
            return res.status(400).json({
                message: "user_id is required"
            });
        }
        const recordings = await Recording.find({ user_id }).sort({ date: -1 });
        return res.status(200).json((recordings));
    } catch (err) {
        console.error("Error Fetching Recordings", err);
        return res.status(500).json({ message: "error fetching recordings", error: err });
    }
};

//Delete Recording From Cloudinary and MongoDB

export const deleteRecording = async (req, res) => {
    try {
        const { id } = req.params;
        const recording = await Recording.findById(id);
        if (!recording) {
            return res.status(404).json({
                message: "Recording not found",
            });
        }
        //Delete video from cloudinary
        if (recording.cloudinary_id) {
            await cloudinary.uploader.destroy(recording.cloudinary_id, { resource_type: "video" });
        }
        //Delete from MongoDB
        await Recording.findByIdAndDelete(id);
        return res.status(200).json({
            message: "Recording deleted successfully"
        });
    }
    catch (error) {
        console.error("Error Deleting Recording", error);
        return res.status(500).json({
            message: "Failed to delete recording",
            error: error
        });
    }
};