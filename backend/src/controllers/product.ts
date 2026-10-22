import { NextFunction, Request, Response } from 'express';
import { Error as MongooseError } from 'mongoose';
import Product from '../models/product';
import BadRequestError from '../errors/bad-request-error';
import ConflictError from '../errors/conflict-error';

export const getProducts = (_req: Request, res: Response, next: NextFunction) => Product.find({})
  .then((items) => res.send({ items, total: items.length }))
  .catch(next);

export const createProduct = (req: Request, res: Response, next: NextFunction) => {
  const {
    title, image, category, description, price,
  } = req.body;

  return Product.create({
    title, image, category, description, price,
  })
    .then((product) => res.send(product))
    .catch((err) => {
      if (err instanceof MongooseError.ValidationError) {
        return next(new BadRequestError(err.message));
      }
      if (err instanceof Error && 'code' in err && err.code === 11000) {
        return next(new ConflictError('Товар с таким заголовком уже существует'));
      }
      return next(err);
    });
};
