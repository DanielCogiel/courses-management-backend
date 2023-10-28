import { Request, Response } from "express";
import CourseDto from "../dtos/course-dto";
import coursesDatabase from "../config/db-connection";

export const addCourse = (req: Request, res: Response) => {
    const data = req.body as CourseDto;
    const userId = res.locals.userId;

    coursesDatabase.query(
        'INSERT INTO Courses(owner_id, trainer_id, title, language, level, location) VALUES (?,?,?,?,?,?)',
        [userId, data.trainer, data.title, data.language, data.level, data.location],
        (error, result) => {
            if (error || !result.affectedRows) return res.sendStatus(500);

            const courseId = result.insertId;
            data.datetimes.forEach(dateObj => {
                coursesDatabase.query(
                    'INSERT INTO Lessons(course_id, date, timeStart, timeFinish) VALUES(?,?,?,?)',
                    [courseId, dateObj.date, dateObj.timeStart, dateObj.timeFinish],
                    (error, result) => {
                        if (error || !result.affectedRows) {
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