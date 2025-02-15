import { Router } from 'express';
import { googleAuth, googleOAuthCallback, verifyToken } from '../controllers/auth.js';
const authRouter = Router();

authRouter.get('/google', googleAuth)
authRouter.get('/google/callback', googleOAuthCallback)
authRouter.get('/verify/:userId', verifyToken)

export default authRouter;
