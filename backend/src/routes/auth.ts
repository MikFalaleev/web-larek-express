import { Router } from 'express';
import {
  getCurrentUser, login, logout, refreshAccessToken, register,
} from '../controllers/auth';
import auth from '../middlewares/auth';
import { validateLoginBody, validateRegisterBody } from '../middlewares/validations';

const router = Router();

router.post('/login', validateLoginBody, login);
router.post('/register', validateRegisterBody, register);
router.get('/token', refreshAccessToken);
router.get('/logout', logout);
router.get('/user', auth, getCurrentUser);

export default router;
