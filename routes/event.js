import { Router } from 'express';
import { createEvent, deleteEvent, getEvents, updateEvent } from '../controllers/event.js';
import validate from '../middlewares/validate.js';
import { eventValidation } from '../validations/eventValidation.js';
const eventRouter = Router();

eventRouter.post('/', validate(eventValidation), createEvent)
eventRouter.get('/user/:userId', getEvents)
eventRouter.put('/:id', validate(eventValidation), updateEvent);
eventRouter.delete('/:id', deleteEvent)
export default eventRouter;