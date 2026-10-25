import { Router } from 'express';
import {
  createProduct, deleteProduct, getProducts, updateProduct,
} from '../controllers/product';
import auth from '../middlewares/auth';
import {
  validateObjId, validateProductBody, validateProductUpdateBody,
} from '../middlewares/validations';

const router = Router();

router.get('/', getProducts);
router.post('/', auth, validateProductBody, createProduct);
router.delete('/:productId', auth, validateObjId, deleteProduct);
router.patch('/:productId', auth, validateObjId, validateProductUpdateBody, updateProduct);

export default router;
