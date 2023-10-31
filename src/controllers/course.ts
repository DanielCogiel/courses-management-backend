import { Request, Response } from "express";
import CourseDto, { Datetime } from "../dtos/course-dto";
import coursesDatabase from "../config/db-connection";
import fs from 'fs';

export const addCourse = (req: Request, res: Response) => {
    const data = req.body as CourseDto;
    const userId = res.locals.userId;

    coursesDatabase.query(
        'INSERT INTO Courses(owner_id, trainer_id, title, language, level, location, image_path) VALUES (?,?,?,?,?,?,?)',
        [userId, data.trainer_id, data.title, data.language, data.level, data.location, req.file?.path],
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
        if (error) {
            if (req.file?.path) {
                fs.unlink(req.file?.path, error => console.log(error));
            }
            return res.sendStatus(500);
        }
        const originalImagePath = result[0].image_path;

        coursesDatabase.query(
            'UPDATE Courses SET trainer_id = ?, title = ?, language = ?, level = ?, location = ?, image_path = ? WHERE id = ?',
            [data.trainer_id, data.title, data.language, data.level, data.location, req.file?.path ? req.file.path : originalImagePath, courseId],
            (error, result) => {
                if (error) {
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
                    if (req.file?.path)
                        fs.unlink(originalImagePath, error => console.log(error));
                    return res.json({
                        message: 'Udało się zaktualizować kurs!'
                    })

                })
            }
        )
    })
}

export const getCourse = (req: Request, res: Response) => {
    const courseId = req.params.id;

    coursesDatabase.query('SELECT * FROM Courses WHERE id = ?', [courseId], (error, result) => {
        if (error) return res.sendStatus(500);

        let {id, owner_id, image_path, ...data} = result[0];
        coursesDatabase.query('SELECT * FROM Lessons WHERE course_id = ?', [courseId], (error, result) => {
            if (error) return res.sendStatus(500);

            data = {...data, datetimes: result};
            return res.json(data);
        })
    })
}

export const getAllCourses = (req: Request, res: Response) => {
    let data: any[] = [];
    const userId = res.locals.userId;
    coursesDatabase.query('SELECT Courses.id AS course_id, Enrolled.user_id AS enroll_id, Courses.owner_id AS owner_id FROM Enrolled RIGHT JOIN Courses ON Enrolled.course_id = Courses.id WHERE Courses.owner_id = ? OR Enrolled.user_id = ?;',
        [userId, userId], (error, bindedCoursesData) => {
            coursesDatabase.query('SELECT Courses.id, Courses.level, Users.firstName, Users.lastName, Courses.title, Courses.language, Courses.location, Courses.image_path FROM Courses JOIN Users ON Courses.trainer_id = Users.id', [],
                (error, result) => {
                if (error)
                    res.sendStatus(500);

                result.map((course: any) => {
                    data = [...data, {
                        ...course,
                        isEnrolled: !!bindedCoursesData.find((elem: any) => elem.course_id === course.id && elem.enroll_id === userId),
                        isOwner: !!bindedCoursesData.find((elem: any) => elem.course_id === course.id && elem.owner_id === userId),
                    }]
                })
                res.json(data);
            })
        })
}