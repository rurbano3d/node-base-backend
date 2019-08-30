import File from '../models/File';

class FileController {
  async store(req, res) {
    // get data from req.file
    const { originalname: name, filename: path } = req.file;

    // Insert this data into BD table
    const file = await File.create({
      name,
      path,
    });

    return res.json(file);
  }
}

export default new FileController();
