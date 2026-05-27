import mongoose, { Schema, type Document } from "mongoose";

export interface IFolder extends Document {
  name: string;
  parent: mongoose.Types.ObjectId | null;
  owner: string;
  createdAt: Date;
  updatedAt: Date;
}

const FolderSchema = new Schema<IFolder>(
  {
    name: {
      type: String,
      required: [true, "Folder name is required"],
      trim: true,
      maxlength: [255, "Folder name cannot exceed 255 characters"],
    },
    parent: {
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

// Compound index for fast lookups: "all folders owned by X inside folder Y"
FolderSchema.index({ owner: 1, parent: 1 });

const Folder = mongoose.model<IFolder>("Folder", FolderSchema);

export default Folder;
