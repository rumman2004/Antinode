import mongoose, { Schema, type Document } from "mongoose";

export interface IFile extends Document {
  originalName: string;
  mimeType: string;
  size: number;
  storageKey: string;
  storageUrl: string;
  storageProvider: "s3" | "cloudinary";
  folder: mongoose.Types.ObjectId | null;
  owner: string;
  createdAt: Date;
  updatedAt: Date;
}

const FileSchema = new Schema<IFile>(
  {
    originalName: {
      type: String,
      required: [true, "File name is required"],
      trim: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    storageKey: {
      type: String,
      required: true,
    },
    storageUrl: {
      type: String,
      required: true,
    },
    storageProvider: {
      type: String,
      enum: ["s3", "cloudinary"],
      required: true,
    },
    folder: {
      type: Schema.Types.ObjectId,
      ref: "Folder",
      default: null,
      index: true,
    },
    owner: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

FileSchema.index({ owner: 1, folder: 1 });

const File = mongoose.model<IFile>("File", FileSchema);

export default File;
