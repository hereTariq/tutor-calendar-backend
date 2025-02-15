import { Schema, model } from 'mongoose';

const userSchema = new Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        googleId: {
            type: String,
            unique: true
        },
        accessToken: {
            type: String
        },
        refreshToken: {
            type: String
        },
        tokenExpiry: {
            type: Date
        }
    },
    { timestamps: true }
);



export default model('User', userSchema);

