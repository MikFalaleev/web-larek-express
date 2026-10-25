import { NextFunction, Request, Response } from 'express';

type HttpError = Error & { statusCode?: number };

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default (err: HttpError, req: Request, res: Response, next: NextFunction) => {
  const { statusCode = 500, message } = err;
  res.status(statusCode).send({
    message: statusCode === 500 ? 'На сервере произошла ошибка' : message,
  });
};
