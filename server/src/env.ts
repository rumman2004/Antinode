import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Override any system-level environment variables with what's in our .env file.
dotenv.config({ 
  path: path.resolve(__dirname, '../.env'), // point to server/.env
  override: true 
});

// Fallback if the path above was slightly off depending on dist/src
dotenv.config({ override: true });
