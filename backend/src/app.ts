/* eslint-disable no-console */
import path from 'path';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { errors } from 'celebrate';
import productRouter from './routes/product';
import orderRouter from './routes/order';
import errorHandler from './middlewares/error-handler';
import { requestLogger, errorLogger } from './middlewares/logger';
import NotFoundError from './errors/not-found-error';

import { PORT, DB_ADDRESS } from './config';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(requestLogger);

app.use('/product', productRouter);
app.use('/order', orderRouter);

app.use((_req, _res, next) => next(new NotFoundError('Маршрут не найден')));

app.use(errorLogger);
app.use(errors());
app.use(errorHandler);

mongoose.connect(DB_ADDRESS)
  .then(() => {
    console.log('Подключено к MongoDB');
    app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));
  })
  .catch((err) => console.error('Ошибка подключения к MongoDB:', err));
