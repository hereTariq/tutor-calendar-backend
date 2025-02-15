import { google } from "googleapis"
import httpStatus from 'http-status';
import path from 'path';
import { config } from 'dotenv';
import User from "../models/user.js"
import catchAsyncError from '../middlewares/catchAsyncError.js';
config({ path: path.join(path.resolve(), 'config/config.env') });
// console.log(process.env.GOOGLE_REDIRECT_URI)
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

google.options({ auth: oauth2Client })

export const googleAuth = catchAsyncError(async (req, res, next) => {
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/userinfo.email'],
        prompt: 'consent'
    });
    res.status(httpStatus.OK).json({ success: true, url });
})

export const googleOAuthCallback = catchAsyncError(async (req, res) => {

    const { code } = req.query;
    console.log(code)
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info from Google
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();

    // Find or create user
    let user = await User.findOne({ email: data.email });
    if (!user) {
        user = new User({
            email: data.email,
            googleId: data.id
        });
    }

    // Update tokens
    user.accessToken = tokens.access_token;
    user.refreshToken = tokens.refresh_token || user.refreshToken;
    user.tokenExpiry = new Date(tokens.expiry_date);
    await user.save();

    const redirectUrl = `${process.env.FRONTEND_URL}/auth-success?userId=${user._id}&email=${encodeURIComponent(data.email)}`;
    res.redirect(redirectUrl)
})

export const verifyToken = catchAsyncError(async (req, res) => {

    const user = await User.findById(req.params.userId);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    if (new Date() >= user.tokenExpiry) {
        oauth2Client.setCredentials({
            refresh_token: user.refreshToken
        });

        const { tokens } = await oauth2Client.refreshAccessToken();
        user.accessToken = tokens.access_token;
        user.tokenExpiry = new Date(tokens.expiry_date);
        await user.save();
    }

    res.status(httpStatus.OK).json({ success: true });

})