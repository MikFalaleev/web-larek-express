import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { AUTH_ACCESS_TOKEN_SECRET } from '../config';
import UnauthorizedError from '../errors/unauthorized-error';

export default (req: Request, res: Response, next: NextFunction) => {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Необходима авторизация'));
  }

  const token = authorization.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, AUTH_ACCESS_TOKEN_SECRET) as JwtPayload;
    res.locals.user = { _id: payload._id };
    return next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return next(new UnauthorizedError('Истек срок действия токена'));
    }
    return next(new UnauthorizedError('Необходима авторизация'));
  }
};
