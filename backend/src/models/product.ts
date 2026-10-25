import mongoose from 'mongoose';
import { removeUploadedFile } from '../utils/files';

export interface IProduct {
  title: string;
  image: {
    fileName: string;
    originalName: string;
  };
  category: string;
  description?: string;
  price: number | null;
}

const productSchema = new mongoose.Schema<IProduct>(
  {
    title: {
      type: String,
      unique: true,
      required: [true, 'Поле "title" должно быть заполнено'],
      minlength: [2, 'Минимальная длина поля "title" – 2'],
      maxlength: [30, 'Максимальная длина поля "title" – 30'],
    },
    image: {
      fileName: {
        type: String,
        required: [true, 'Поле "fileName" должно быть заполнено'],
      },
      originalName: {
        type: String,
        required: [true, 'Поле "originalName" должно быть заполнено'],
      },
    },
    category: {
      type: String,
      required: [true, 'Поле "category" должно быть заполнено'],
    },
    description: { type: String },
    price: { type: Number, default: null },
  },
  { versionKey: false },
);

// после удаления товара чистим файл картинки (если ею не пользуется другой товар)
productSchema.post('findOneAndDelete', async (doc) => {
  if (!doc) {
    return;
  }
  const { fileName } = doc.image;
  const stillUsed = await mongoose.model('product').exists({ 'image.fileName': fileName });
  if (!stillUsed) {
    await removeUploadedFile(fileName);
  }
});

export default mongoose.model<IProduct>('product', productSchema);
