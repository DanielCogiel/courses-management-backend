import { Request, Response } from "express";
import CourseDto, { Datetime } from "../dtos/course-dto";
import coursesDatabase from "../config/db-connection";
import fs from 'fs';

export const addCourse = (req: Request, res: Response) => {
    const data = req.body as CourseDto;
    const userId = res.locals.userId;

    coursesDatabase.query(
        'INSERT INTO Courses(owner_id, trainer_id, title, language, level, location, image_path) VALUES (?,?,?,?,?,?,?)',
        [userId, data.trainer, data.title, data.language, data.level, data.location, req.file?.path],
        (error, result) => {
            if (error || !result.affectedRows) {
                if (req.file?.path)
                    fs.unlink(req.file?.path, error => console.log(error))
                return res.sendStatus(500);
            }

            const courseId = result.insertId;
            JSON.parse(data.datetimes).forEach((dateObj: Datetime) => {
                coursesDatabase.query(
                    'INSERT INTO Lessons(course_id, date, timeStart, timeFinish) VALUES(?,?,?,?)',
                    [courseId, dateObj.date, dateObj.timeStart, dateObj.timeFinish],
                    (error, result) => {
                        if (error || !result.affectedRows) {
                            if (req.file?.path)
                                fs.unlink(req.file?.path, error => console.log(error))
                            return res.sendStatus(500);
                        }
                    }
                )
            })
            return res.json({
                message: 'Udało się dodać kurs!'
            })
        }
    )
}

export const updateCourse = (req: Request, res: Response) => {
    const courseId = req.params.id;
    const data = req.body as CourseDto;
    coursesDatabase.query('SELECT * FROM Courses WHERE id = ?', [courseId], (error, result) => {
        if (error) return res.sendStatus(500);
        const originalImagePath = result[0].image_path;

        coursesDatabase.query(
            'UPDATE Courses SET trainer_id = ?, title = ?, language = ?, level = ?, location = ?, image_path = ?) WHERE id = ?',
            [data.trainer, data.title, data.language, data.level, data.location, req.file?.path, courseId],
            (error, result) => {
                if (error || !result.affectedRows) {
                    if (req.file?.path)
                        fs.unlink(req.file?.path, error => console.log(error));
                    return res.sendStatus(500);
                }

                coursesDatabase.query('DELETE FROM Lessons WHERE course_id = ?', [courseId], (error, result) => {
                    if (error) {
                        if (req.file?.path)
                            fs.unlink(req.file?.path, error => console.log(error));
                        return res.sendStatus(500);
                    }

                    JSON.parse(data.datetimes).forEach((dateObj: Datetime) => {
                        coursesDatabase.query(
                            'INSERT INTO Lessons(course_id, date, timeStart, timeFinish) VALUES(?,?,?,?)',
                            [courseId, dateObj.date, dateObj.timeStart, dateObj.timeFinish],
                            (error, result) => {
                                if (error || !result.affectedRows) {
                                    if (req.file?.path)
                                        fs.unlink(req.file?.path, error => console.log(error))
                                    return res.sendStatus(500);
                                }
                            }
                        )
                    })
                    fs.unlink(originalImagePath, error => console.log(error));
                    return res.json({
                        message: 'Udało się dodać kurs!'
                    })

                })
            }
        )
    })
}