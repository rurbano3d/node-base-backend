import multer from 'multer';
import crypto from 'crypto'; // native library of node to generate random caracters
import { extname, resolve } from 'path';

export default {
  // save file into a folder function
  storage: multer.diskStorage({
    // path of file, using resolve
    destination: resolve(__dirname, '..', '..', 'tmp', 'uploads'),
    // name of file with crypto random characters
    filename: (req, file, cb) => {
      crypto.randomBytes(16, (err, res) => {
        if (err) return cb(err);
        // return something like ja45s8fd4f.jpg
        return cb(null, res.toString('hex') + extname(file.originalname));
      });
    },
  }),
};
