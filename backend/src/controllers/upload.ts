import { NextFunction, Request, Response } from 'express';
import { UPLOAD_PATH } from '../config';
import BadRequestError from '../errors/bad-request-error';

const uploadFile = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return next(new BadRequestError('Файл не загружен'));
  }
  return res.send({
    fileName: `/${UPLOAD_PATH}/${req.file.filename}`,
    // multer читает имя как latin1, возвращаем кириллицу
    originalName: Buffer.from(req.file.originalname, 'latin1').toString('utf8'),
  });
};

export default uploadFile;
