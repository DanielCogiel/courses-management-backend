import multer from "multer";
import path from "path";
const upload = multer({
    dest: 'uploads/',
    fileFilter: (req, file, callback) => {
        const ext = path.extname(file.originalname);
        if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg')
            return callback(new Error('Niedozwolone rozszerzenie pliku.'));
        callback(null, true);
    },
    limits: {
        fileSize: 1024 * 1024 * 5
    },
});
export default upload;