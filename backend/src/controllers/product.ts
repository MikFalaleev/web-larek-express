import { NextFunction, Request, Response } from 'express';
import { Error as MongooseError } from 'mongoose';
import Product from '../models/product';
import BadRequestError from '../errors/bad-request-error';
import ConflictError from '../errors/conflict-error';
import NotFoundError from '../errors/not-found-error';
import { moveFileFromTemp } from '../utils/files';

// единая обработка ошибок записи товара в базу
const handleSaveError = (err: unknown, next: NextFunction) => {
  if (err instanceof MongooseError.ValidationError) {
    return next(new BadRequestError(err.message));
  }
  if (err instanceof Error && 'code' in err && err.code === 11000) {
    return next(new ConflictError('Товар с таким заголовком уже существует'));
  }
  return next(err);
};

export const getProducts = (_req: Request, res: Response, next: NextFunction) => Product.find({})
  .then((items) => res.send({ items, total: items.length }))
  .catch(next);

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      title, image, category, description, price,
    } = req.body;

    // сначала переносим картинку из временной папки в постоянную
    await moveFileFromTemp(image.fileName);

    const product = await Product.create({
      title, image, category, description, price,
    });
    return res.status(201).send(product);
  } catch (err) {
    return handleSaveError(err, next);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params;

    if (req.body.image) {
      await moveFileFromTemp(req.body.image.fileName);
    }

    const product = await Product.findByIdAndUpdate(
      productId,
      { $set: req.body },
      { new: true, runValidators: true },
    );
    if (!product) {
      throw new NotFoundError('Нет товара по заданному id');
    }
    return res.send(product);
  } catch (err) {
    return handleSaveError(err, next);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.productId);
    if (!product) {
      throw new NotFoundError('Нет товара по заданному id');
    }
    return res.send(product);
  } catch (err) {
    return next(err);
  }
};
