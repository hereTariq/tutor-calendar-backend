import { Schema, model } from 'mongoose';

const eventSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    participants: [{
        type: String,
        required: true,
        trim: true
    }],
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true,
        min: 0
    },
    sessionNotes: {
        type: String,
        trim: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    googleCalendarEventId: {
        type: String
    }
}, { timestamps: true })

export default model('Event', eventSchema)