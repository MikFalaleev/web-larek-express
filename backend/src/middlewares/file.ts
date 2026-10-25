import { randomUUID } from 'crypto';
import fs from 'fs';
import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import { TEMP_DIR } from '../config';
import BadRequestError from '../errors/bad-request-error';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 МБ

// допустимые типы изображений и расширения, которые мы сами назначаем файлам
const ALLOWED_TYPES: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
    cb(null, TEMP_DIR);
  },
  // уникальное имя, не зависящее от имени файла пользователя
  filename: (_req, file, cb) => cb(null, `${randomUUID()}${ALLOWED_TYPES[file.mimetype]}`),
});

const fileFilter = (_req: Request, file: { mimetype: string }, cb: FileFilterCallback) => {
  if (!ALLOWED_TYPES[file.mimetype]) {
    return cb(new BadRequestError('Недопустимый тип файла. Разрешены png, jpg, gif и svg'));
  }
  return cb(null, true);
};

export default multer({ storage, fileFilter, limits: { fileSize: MAX_FILE_SIZE } });
