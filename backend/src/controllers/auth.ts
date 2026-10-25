import {
  CookieOptions, NextFunction, Request, Response,
} from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Error as MongooseError } from 'mongoose';
import ms from 'ms';
import User, { UserDocument } from '../models/user';
import { AUTH_REFRESH_TOKEN_EXPIRY, AUTH_REFRESH_TOKEN_SECRET } from '../config';
import BadRequestError from '../errors/bad-request-error';
import ConflictError from '../errors/conflict-error';
import NotFoundError from '../errors/not-found-error';
import UnauthorizedError from '../errors/unauthorized-error';

const REFRESH_COOKIE_NAME = 'refreshToken';

const baseCookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: false,
  path: '/',
};

const issueTokens = async (user: UserDocument) => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  await User.updateOne({ _id: user._id }, { $push: { tokens: { token: refreshToken } } });
  return { accessToken, refreshToken };
};

const sendAuthResponse = (
  res: Response,
  status: number,
  user: UserDocument,
  tokens: { accessToken: string; refreshToken: string },
) => {
  res.cookie(REFRESH_COOKIE_NAME, tokens.refreshToken, {
    ...baseCookieOptions,
    maxAge: ms(AUTH_REFRESH_TOKEN_EXPIRY as ms.StringValue),
  });
  return res.status(status).send({
    user: { email: user.email, name: user.name },
    success: true,
    accessToken: tokens.accessToken,
  });
};

const verifyRefreshToken = (token: unknown, ignoreExpiration = false) => {
  if (typeof token !== 'string') {
    return null;
  }
  try {
    return jwt.verify(token, AUTH_REFRESH_TOKEN_SECRET, { ignoreExpiration }) as JwtPayload;
  } catch (err) {
    return null;
  }
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.create({ name, email, password });
    const tokens = await issueTokens(user);
    return sendAuthResponse(res, 201, user, tokens);
  } catch (err) {
    if (err instanceof MongooseError.ValidationError) {
      return next(new BadRequestError(err.message));
    }
    if (err instanceof Error && 'code' in err && err.code === 11000) {
      return next(new ConflictError('Пользователь с таким email уже существует'));
    }
    return next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const user = await User.findUserByCredentials(email, password);
    const tokens = await issueTokens(user);
    return sendAuthResponse(res, 200, user, tokens);
  } catch (err) {
    return next(err);
  }
};

export const refreshAccessToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const oldToken = req.cookies[REFRESH_COOKIE_NAME];
    const payload = verifyRefreshToken(oldToken);
    if (!payload) {
      return next(new UnauthorizedError('Не валидный токен'));
    }

    // забираем пользователя и сразу удаляем использованный refresh-токен
    const user = await User.findOneAndUpdate(
      { _id: payload._id, 'tokens.token': oldToken },
      { $pull: { tokens: { token: oldToken } } },
    );
    if (!user) {
      throw new UnauthorizedError('Не валидный токен');
    }

    const tokens = await issueTokens(user);
    return sendAuthResponse(res, 200, user, tokens);
  } catch (err) {
    return next(err);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const oldToken = req.cookies[REFRESH_COOKIE_NAME];
    const payload = verifyRefreshToken(oldToken, true);
    if (!payload) {
      return next(new UnauthorizedError('Не валидный токен'));
    }

    const user = await User.findByIdAndUpdate(payload._id, {
      $pull: { tokens: { token: oldToken } },
    });
    if (!user) {
      throw new NotFoundError('Пользователь по заданному id отсутствует в базе');
    }

    res.clearCookie(REFRESH_COOKIE_NAME, baseCookieOptions);
    return res.send({ success: true });
  } catch (err) {
    return next(err);
  }
};

export const getCurrentUser = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(res.locals.user._id);
    if (!user) {
      throw new NotFoundError('Пользователь по заданному id отсутствует в базе');
    }
    return res.send({ user: { email: user.email, name: user.name }, success: true });
  } catch (err) {
    return next(err);
  }
};
