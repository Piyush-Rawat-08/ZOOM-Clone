import multer from "multer";
import crypto from "crypto";
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

        // Step 1: Prepare the upload parameters
        const timestamp = Math.round(Date.now() / 1000);
        const folder = "meetflow_recordings";

        // Step 2: Generate the cryptographic signature
        const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
        const signature = crypto
            .createHash("sha1")
            .update(paramsToSign + process.env.CLOUDINARY_API_SECRET)
            .digest("hex");

        // Step 3: Build the FormData with file + signed credentials
        const formData = new FormData();
        const videoBlob = new Blob([req.file.buffer], { type: req.file.mimetype || "video/webm" });
        formData.append("file", videoBlob, req.file.originalname || "recording.webm");
        formData.append("folder", folder);
        formData.append("timestamp", timestamp.toString());
        formData.append("api_key", process.env.CLOUDINARY_API_KEY);
        formData.append("signature", signature);

        // Step 4: Upload via fetch (bypasses SDK's blocked HTTP client)
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        const cloudinaryResponse = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
            { method: "POST", body: formData }
        );

        const result = await cloudinaryResponse.json();

        if (!cloudinaryResponse.ok || result.error) {
            console.error("Cloudinary upload error:", result.error || result);
            return res.status(500).json({
                message: "Cloudinary upload failed",
                error: result.error
            });
        }

        // Step 5: Save recording metadata to MongoDB
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

    } catch (err) {
        console.error("Server upload error:", err);
        return res.status(500).json({
            message: "Server error during upload",
            error: err.message
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
        return res.status(200).json({ recordings });
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