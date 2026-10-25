import { NextFunction, Request, Response } from 'express';
import { faker } from '@faker-js/faker';
import Product from '../models/product';
import BadRequestError from '../errors/bad-request-error';

const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { items, total } = req.body as { items: string[]; total: number };
    const products = await Product.find({ _id: { $in: items } });

    const sum = items.reduce((acc, id) => {
      const product = products.find((item) => item.id === id);
      if (!product) {
        throw new BadRequestError(`Товар с id ${id} не найден`);
      }
      if (product.price === null) {
        throw new BadRequestError(`Товар с id ${id} не продается`);
      }
      return acc + product.price;
    }, 0);

    if (sum !== total) {
      throw new BadRequestError('Неверная сумма заказа');
    }

    return res.send({ id: faker.string.uuid(), total });
  } catch (err) {
    return next(err);
  }
};

export default createOrder;
