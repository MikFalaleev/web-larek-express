import { config } from 'dotenv';
import express from 'express';
import cors from 'cors';

config();

const { PORT = 3000 } = process.env;

const app = express();

app.use(cors());
app.use(express.json());

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Сервер запущен на порту ${PORT}`);
});
