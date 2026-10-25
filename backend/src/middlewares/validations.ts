import { NextFunction, Request, Response } from 'express';
import { celebrate, Joi, Segments } from 'celebrate';
import { isValidObjectId } from 'mongoose';
import BadRequestError from '../errors/bad-request-error';

const objIdPattern = /^[0-9a-fA-F]{24}$/;

/// проверка id товара из параметров URL (PATCH и DELETE)
export const validateObjId = (req: Request, _res: Response, next: NextFunction) => {
  if (!isValidObjectId(req.params.productId)) {
    return next(new BadRequestError('Передан не валидный ID товара'));
  }
  return next();
};

// создание товара
export const validateProductBody = celebrate({
  [Segments.BODY]: Joi.object().keys({
    title: Joi.string().min(2).max(30).required(),
    image: Joi.object().keys({
      fileName: Joi.string().required(),
      originalName: Joi.string().required(),
    }).required(),
    category: Joi.string().required(),
    description: Joi.string(),
    price: Joi.number().allow(null),
  }),
});

// обновление товара (PATCH): все поля необязательные, но хотя бы одно нужно
export const validateProductUpdateBody = celebrate({
  [Segments.BODY]: Joi.object().keys({
    title: Joi.string().min(2).max(30),
    image: Joi.object().keys({
      fileName: Joi.string().required(),
      originalName: Joi.string().required(),
    }),
    category: Joi.string(),
    description: Joi.string(),
    price: Joi.number().allow(null),
  }).min(1),
});

// оформление заказа
export const validateOrderBody = celebrate({
  [Segments.BODY]: Joi.object().keys({
    payment: Joi.string().valid('card', 'online').required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    address: Joi.string().required(),
    total: Joi.number().required(),
    items: Joi.array().items(Joi.string().pattern(objIdPattern)).min(1).required(),
  }),
});

// регистрация пользователя
export const validateRegisterBody = celebrate({
  [Segments.BODY]: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),
});

// вход пользователя
export const validateLoginBody = celebrate({
  [Segments.BODY]: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
});
