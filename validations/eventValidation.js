import Joi from 'joi';

export const eventValidation = Joi.object({
    title: Joi.string().min(3).max(100).required().messages({
        "string.empty": "Title is required.",
        "string.min": "Title must be at least 3 characters.",
        "string.max": "Title must not exceed 100 characters."
    }),
    description: Joi.string().max(500).allow("").optional().messages({
        "string.max": "Description must not exceed 500 characters."
    }),
    participants: Joi.array().items(Joi.string().email()).optional().messages({
        "array.includes": "Each participant must be a valid email address."
    }),
    date: Joi.date().iso().required().messages({
        "date.base": "Date must be a valid date.",
        "any.required": "Date is required."
    }),
    time: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required().messages({
        "string.pattern.base": "Time must be in HH:mm format (24-hour).",
        "any.required": "Time is required."
    }),
    duration: Joi.number().min(0.5).max(24).required().messages({
        "number.base": "Duration must be a valid number.",
        "number.min": "Duration must be at least 0.5 hours.",
        "number.max": "Duration cannot exceed 24 hours."
    }),
    sessionNotes: Joi.string().allow("").max(1000).optional().messages({
        "string.max": "Session notes must not exceed 1000 characters."
    }),
    userId: Joi.string().required().messages({
        "any.required": "User ID is required."
    })
});