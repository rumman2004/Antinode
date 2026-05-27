import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGO_URI;

async function checkDb() {
  await mongoose.connect(uri!);
  const Folder = mongoose.model('Folder', new mongoose.Schema({ name: String, parent: mongoose.Schema.Types.ObjectId, owner: String, createdAt: Date }));
  const folders = await Folder.find({});
  console.log('Folders in DB:');
  folders.forEach(f => console.log(`- ${f.name} (Parent: ${f.parent})`));
  mongoose.disconnect();
}
checkDb();
