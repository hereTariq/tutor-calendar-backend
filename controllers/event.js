
import httpStatus from 'http-status';
import User from "../models/user.js"
import Event from "../models/event.js"
import { google } from "googleapis"
import catchAsyncError from "../middlewares/catchAsyncError.js";


const getCalendar = async (userId) => {
    const user = await User.findById(userId);
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
        access_token: user.accessToken,
        refresh_token: user.refreshToken
    });
    return google.calendar({ version: 'v3', auth: oauth2Client });
};

export const createEvent = catchAsyncError(async (req, res) => {

    const { title, description, participants, date, time, duration, sessionNotes, userId } = req.body;

    const event = new Event({
        title,
        description,
        participants,
        date,
        time,
        duration,
        sessionNotes,
        userId
    });

    const calendar = await getCalendar(userId);
    const startDateTime = new Date(`${date}T${time}`);
    const endDateTime = new Date(startDateTime.getTime() + duration * 60 * 60 * 1000);

    const googleEvent = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: {
            summary: title,
            description: description,
            start: {
                dateTime: startDateTime.toISOString()
            },
            end: {
                dateTime: endDateTime.toISOString()
            },
            attendees: participants.map(email => ({ email }))
        }
    });

    event.googleCalendarEventId = googleEvent.data.id;
    await event.save();

    res.status(httpStatus.CREATED).json({ success: true, message: "Event created successfullu." });

})

export const getEvents = catchAsyncError(async (req, res, next) => {
    const events = await Event.find({ userId: req.params.userId });
    res.status(httpStatus.OK).json({ success: true, message: "Events fetched successfully.", events });
})

export const updateEvent = catchAsyncError(async (req, res, next) => {
    const event = await Event.findById(req.params.id);
    const calendar = await getCalendar(event.userId);

    const startDateTime = new Date(`${req.body.date}T${req.body.time}`);
    const endDateTime = new Date(startDateTime.getTime() + req.body.duration * 60 * 60 * 1000);

    await calendar.events.update({
        calendarId: 'primary',
        eventId: event.googleCalendarEventId,
        requestBody: {
            summary: req.body.title,
            description: req.body.description,
            start: {
                dateTime: startDateTime.toISOString()
            },
            end: {
                dateTime: endDateTime.toISOString()
            },
            attendees: req.body.participants.map(email => ({ email }))
        }
    });

    const updatedEvent = await Event.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );

    res.status(httpStatus.OK).json({ success: true, message: "Event updated successfully." });
})

export const deleteEvent = catchAsyncError(async (req, res, next) => {
    const event = await Event.findById(req.params.id);
    const calendar = await getCalendar(event.userId);

    await calendar.events.delete({
        calendarId: 'primary',
        eventId: event.googleCalendarEventId
    });

    await event.deleteOne();

    res.status(httpStatus.OK).json({ success: true, message: 'Event deleted successfully.' });
})