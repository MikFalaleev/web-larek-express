import { Router } from 'express';
import { celebrate, Joi, Segments } from 'celebrate';
import { createProduct, getProducts } from '../controllers/product';

const router = Router();

router.get('/', getProducts);

router.post(
  '/',
  celebrate({
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
  }),
  createProduct,
);

export default router;
