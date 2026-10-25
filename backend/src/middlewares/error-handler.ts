import { NextFunction, Request, Response } from 'express';
import multer from 'multer';

type HttpError = Error & { statusCode?: number };

export default (err: HttpError, _req: Request, res: Response, _next: NextFunction) => {
  // ошибки multer (например, слишком большой файл) — это ошибки клиента
  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE'
      ? 'Файл слишком большой. Максимальный размер – 10 МБ'
      : err.message;
    return res.status(400).send({ message });
  }

  const statusCode = err.statusCode ?? 500;
  return res.status(statusCode).send({
    message: statusCode === 500 ? 'На сервере произошла ошибка' : err.message,
  });
};
