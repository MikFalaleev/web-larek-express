import mongoose from 'mongoose';

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
      required: true,
      unique: true,
      minlength: 2,
      maxlength: 30,
    },
    image: {
      fileName: { type: String, required: true },
      originalName: { type: String, required: true },
    },
    category: { type: String, required: true },
    description: { type: String },
    price: { type: Number, default: null },
  },
  { versionKey: false },
);

export default mongoose.model<IProduct>('product', productSchema);
