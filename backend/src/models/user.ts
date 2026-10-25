import mongoose, { HydratedDocument, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import validator from 'validator';
import {
  AUTH_ACCESS_TOKEN_EXPIRY,
  AUTH_ACCESS_TOKEN_SECRET,
  AUTH_REFRESH_TOKEN_EXPIRY,
  AUTH_REFRESH_TOKEN_SECRET,
} from '../config';
import UnauthorizedError from '../errors/unauthorized-error';

export interface IUser {
  name: string;
  email: string;
  password: string;
  tokens: { token: string }[];
}

interface IUserMethods {
  generateAccessToken(): string;
  generateRefreshToken(): string;
}

export type UserDocument = HydratedDocument<IUser, IUserMethods>;

interface IUserModel extends Model<IUser, object, IUserMethods> {
  findUserByCredentials(email: string, password: string): Promise<UserDocument>;
}

const userSchema = new mongoose.Schema<IUser, IUserModel, IUserMethods>(
  {
    name: {
      type: String,
      minlength: [2, 'Минимальная длина поля "name" – 2'],
      maxlength: [30, 'Максимальная длина поля "name" – 30'],
      default: 'Ё-мое',
    },
    email: {
      type: String,
      required: [true, 'Поле "email" должно быть заполнено'],
      unique: true,
      validate: {
        validator: (value: string) => validator.isEmail(value),
        message: 'Поле "email" должно быть валидным email-адресом',
      },
    },
    password: {
      type: String,
      required: [true, 'Поле "password" должно быть заполнено'],
      minlength: [6, 'Минимальная длина поля "password" – 6'],
      select: false,
    },
    tokens: {
      type: [new mongoose.Schema({ token: { type: String, required: true } }, { _id: false })],
      select: false,
      default: [],
    },
  },
  { versionKey: false },
);

// хешируем пароль после валидации (валидация проверяет длину исходного пароля)
userSchema.pre('save', async function hashPassword() {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

userSchema.methods.generateAccessToken = function generateAccessToken() {
  return jwt.sign({ _id: this._id.toString() }, AUTH_ACCESS_TOKEN_SECRET, {
    expiresIn: AUTH_ACCESS_TOKEN_EXPIRY as SignOptions['expiresIn'],
  });
};

userSchema.methods.generateRefreshToken = function generateRefreshToken() {
  return jwt.sign({ _id: this._id.toString() }, AUTH_REFRESH_TOKEN_SECRET, {
    expiresIn: AUTH_REFRESH_TOKEN_EXPIRY as SignOptions['expiresIn'],
  });
};

userSchema.statics.findUserByCredentials = async function findUserByCredentials(
  email: string,
  password: string,
) {
  const user = await this.findOne({ email }).select('+password');
  if (!user) {
    throw new UnauthorizedError('Неправильные почта или пароль');
  }
  const matched = await bcrypt.compare(password, user.password);
  if (!matched) {
    throw new UnauthorizedError('Неправильные почта или пароль');
  }
  return user;
};

export default mongoose.model<IUser, IUserModel>('user', userSchema);
