import { NextFunction, Request } from "express";
import upload from "../config/multer";
import multer from "multer";

export const uploadImage = (req: Request, res: any, next: NextFunction) => {
    upload.single('image') (req, res, error => {
        if (error instanceof multer.MulterError) {
            if (error.code === 'LIMIT_FILE_SIZE')
                return res.status(400).json({message: 'Przekroczono limit rozmiaru pliku.'})
            else
                return res.sendStatus(500);
        } else if (error && error instanceof Error)
            return res.status(400).json({ message: 'Niedozwolone rozszerzenie pliku.' });
        else if (error)
            return res.sendStatus(500);
        next();
    })
}