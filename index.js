import express from 'express';
import path from 'path';
import { config } from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import passport from 'passport';
import httpStatus from 'http-status';
import errorMiddleware from './middlewares/errorMiddleware.js';
import connectDatabase from './config/database.js';
import ErrorHandler from './utils/errorHandler.js';
import authRouter from './routes/auth.js';
import eventRouter from './routes/event.js';
import logger from './config/logger.js';

config({ path: path.join(path.resolve(), 'config/config.env') });

const app = express();

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// gzip compression
app.use(compression());

// enable cors
app.use(cors());
app.options('*', cors());

// connect database
connectDatabase();

app.use(passport.initialize());

app.get('/', (req, res) => {
    res.status(httpStatus.OK).json({
        msg: 'server is working fine!',
        success: true,
    });
});

app.use('/auth', authRouter);
app.use('/api/events', eventRouter);

// 404 error middleware
app.use((req, res, next) => {
    logger.error('NotFound Error');
    next(new ErrorHandler(httpStatus.NOT_FOUND, 'Route Not Found'));
});

app.use(errorMiddleware);

const PORT = process.env.PORT || 6002;
app.listen(PORT, () =>
    logger.info('server is running on http://localhost:' + PORT)
);
