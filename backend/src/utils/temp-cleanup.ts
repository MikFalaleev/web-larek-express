import { CronJob } from 'cron';
import fs from 'fs/promises';
import path from 'path';
import { TEMP_DIR } from '../config';

const MAX_AGE_MS = 60 * 60 * 1000; // файлы старше часа удаляем

const cleanTempDir = async () => {
  try {
    const names = await fs.readdir(TEMP_DIR);
    await Promise.all(names.map(async (name) => {
      const filePath = path.join(TEMP_DIR, name);
      const { mtimeMs } = await fs.stat(filePath);
      if (Date.now() - mtimeMs > MAX_AGE_MS) {
        await fs.unlink(filePath);
      }
    }));
  } catch (err) {
    // папки ещё нет или файл уже удалён — чистить нечего
  }
};

// запуск раз в час
export default () => CronJob.from({ cronTime: '0 * * * *', onTick: cleanTempDir, start: true });
