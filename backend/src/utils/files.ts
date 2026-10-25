import fs from 'fs/promises';
import path from 'path';
import { TEMP_DIR, UPLOAD_DIR } from '../config';

// переносит файл из временной папки в постоянную; если файла во временной папке нет
// (например, картинка уже лежит на месте), ничего не делает
export const moveFileFromTemp = async (fileName: string) => {
  const name = path.basename(fileName);
  const tempPath = path.join(TEMP_DIR, name);

  try {
    await fs.access(tempPath);
  } catch (err) {
    return;
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  // copy + unlink, а не rename: временная и постоянная папки могут быть на разных дисках
  await fs.copyFile(tempPath, path.join(UPLOAD_DIR, name));
  await fs.unlink(tempPath);
};

export const removeUploadedFile = async (fileName: string) => {
  await fs.unlink(path.join(UPLOAD_DIR, path.basename(fileName))).catch(() => {});
};
