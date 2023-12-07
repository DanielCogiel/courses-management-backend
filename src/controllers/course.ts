import { Request, Response } from "express";
import CourseDto, { Datetime } from "../dtos/course-dto";
import coursesDatabase from "../config/db-connection";
import fs from 'fs';
import { sortDatabaseLessons } from "../util/sort-database-lessons";
import { validateLessonOverlapping } from "../util/validate-lesson-overlap";

export const addCourse = (req: Request, res: Response) => {
    const data = req.body as CourseDto;
    const userId = res.locals.userId;

    coursesDatabase.query('SELECT Courses.title as course_title, Lessons.course_id, Lessons.title, Lessons.description, Lessons.date, Lessons.timeStart, Lessons.timeFinish FROM Lessons JOIN Courses ON Lessons.course_id = Courses.id WHERE Courses.trainer_id = ?', [data.trainer_id], (error, result) => {
        const validation = validateLessonOverlapping(result, JSON.parse(data.datetimes));
        if (error)
            return res.sendStatus(500);
        if (!validation.valid) {
            return res.status(500).json({
                message: validation.message
            })
        }

        coursesDatabase.query(
            'INSERT INTO Courses(owner_id, trainer_id, title, description, language, level, location, image_path) VALUES (?,?,?,?,?,?,?,?)',
            [userId, data.trainer_id, data.title, data.description, data.language, data.level, data.location, req.file?.path],
            (error, result) => {
                if (error || !result.affectedRows) {
                    if (req.file?.path)
                        fs.unlink(req.file?.path, error => console.log(error))
                    return res.sendStatus(500);
                }
                const courseId = result.insertId;

                JSON.parse(data.datetimes).forEach((dateObj: Datetime) => {
                    coursesDatabase.query(
                        'INSERT INTO Lessons(course_id, title, description, date, timeStart, timeFinish) VALUES(?,?,?,?,?,?)',
                        [courseId, dateObj.title, dateObj.description, dateObj.date, dateObj.timeStart, dateObj.timeFinish],
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
    })
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

        coursesDatabase.query('SELECT Courses.title as course_title, Lessons.course_id, Lessons.title, Lessons.description, Lessons.date, Lessons.timeStart, Lessons.timeFinish FROM Lessons JOIN Courses ON Lessons.course_id = Courses.id WHERE Courses.trainer_id = ? AND Lessons.course_id <> ?', [data.trainer_id, courseId], (error, result) => {
            const validation = validateLessonOverlapping(result, JSON.parse(data.datetimes));
            if (error) {
                if (req.file?.path) {
                    fs.unlink(req.file?.path, error => console.log(error));
                }
                return res.sendStatus(500);
            }
            if (!validation.valid) {
                if (req.file?.path) {
                    fs.unlink(req.file?.path, error => console.log(error));
                }
                return res.status(500).json({
                    message: validation.message
                })
            }

            coursesDatabase.query(
                'UPDATE Courses SET trainer_id = ?, title = ?, description = ?, language = ?, level = ?, location = ?, image_path = ? WHERE id = ?',
                [data.trainer_id, data.title, data.description, data.language, data.level, data.location, req.file?.path ? req.file.path : (originalImagePath ?? null), courseId],
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
                                'INSERT INTO Lessons(course_id, title, description, date, timeStart, timeFinish) VALUES(?,?,?,?,?,?)',
                                [courseId, dateObj.title, dateObj.description, dateObj.date, dateObj.timeStart, dateObj.timeFinish],
                                (error, result) => {
                                    if (error || !result.affectedRows) {
                                        if (req.file?.path)
                                            fs.unlink(req.file?.path, error => console.log(error))
                                        return res.sendStatus(500);
                                    }
                                }
                            )
                        })
                        if (req.file?.path && originalImagePath)
                            fs.unlink(originalImagePath, error => console.log(error));
                        return res.json({
                            message: 'Udało się zaktualizować kurs!'
                        })

                    })
                }
            )
        })
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
    coursesDatabase.query('SELECT Courses.id AS course_id, Enrolled.user_id AS enroll_id, Courses.owner_id AS owner_id, Courses.trainer_id AS trainer_id FROM Enrolled RIGHT JOIN Courses ON Enrolled.course_id = Courses.id WHERE Courses.owner_id = ? OR Enrolled.user_id = ? OR Courses.trainer_id = ?;',
        [userId, userId, userId], (error, bindedCoursesData) => {
            coursesDatabase.query('SELECT Courses.id, Courses.level, Users.firstName, Users.lastName, Courses.title, Courses.language, Courses.location, Courses.image_path FROM Courses JOIN Users ON Courses.trainer_id = Users.id', [],
                (error, result) => {
                if (error)
                    res.sendStatus(500);

                coursesDatabase.query('SELECT Lessons.course_id, Lessons.date, Lessons.timeStart, Lessons.timeFinish FROM Lessons', [], (error, lessons) => {
                    if (error)
                        return res.sendStatus(500);

                    const sortedLessons = sortDatabaseLessons(lessons);
                    result.map((course: any) => {
                        const filteredLessons = sortedLessons.filter(lesson => lesson.course_id === course.id);
                        data = [...data, {
                            ...course,
                            isEnrolled: !!bindedCoursesData.find((elem: any) => elem.course_id === course.id && elem.enroll_id === userId),
                            isOwner: !!bindedCoursesData.find((elem: any) => elem.course_id === course.id && elem.owner_id === userId),
                            isTrainer: !!bindedCoursesData.find((elem: any) => elem.course_id === course.id && elem.trainer_id === userId),
                            firstLesson: filteredLessons?.[0],
                            lastLesson: filteredLessons?.[filteredLessons.length - 1]
                        }]
                    })
                    return res.json(data);
                })
            })
        })
}
export const getPersonalCourses = (req: Request, res: Response) => {
    let data: any[] = [];
    const userId = res.locals.userId;
    coursesDatabase.query('SELECT Courses.id AS course_id, Enrolled.user_id AS enroll_id, Courses.owner_id AS owner_id, Courses.trainer_id AS trainer_id FROM Enrolled RIGHT JOIN Courses ON Enrolled.course_id = Courses.id WHERE Courses.owner_id = ? OR Enrolled.user_id = ? OR Courses.trainer_id = ?;',
        [userId, userId, userId], (error, bindedCoursesData) => {
            coursesDatabase.query('SELECT Courses.id, Courses.level, Users.firstName, Users.lastName, Courses.title, Courses.language, Courses.location, Courses.image_path FROM Courses JOIN Users ON Courses.trainer_id = Users.id', [],
                (error, result) => {
                    if (error)
                        return res.sendStatus(500);

                    coursesDatabase.query('SELECT Lessons.course_id, Lessons.date, Lessons.timeStart, Lessons.timeFinish FROM Lessons', [], (error, lessons) => {
                        if (error)
                            return res.sendStatus(500);

                        const sortedLessons = sortDatabaseLessons(lessons);
                        result.forEach((course: any) => {
                            const isEnrolled = !!bindedCoursesData.find((elem: any) => elem.course_id === course.id && elem.enroll_id === userId);
                            const isOwner = !!bindedCoursesData.find((elem: any) => elem.course_id === course.id && elem.owner_id === userId);
                            const isTrainer = !!bindedCoursesData.find((elem: any) => elem.course_id === course.id && elem.trainer_id === userId);
                            if (isEnrolled || isOwner || isTrainer) {
                                const filteredLessons = sortedLessons.filter(lesson => lesson.course_id === course.id);
                                data = [...data, {
                                    ...course,
                                    isEnrolled: isEnrolled,
                                    isOwner: isOwner,
                                    isTrainer: isTrainer,
                                    firstLesson: filteredLessons?.[0],
                                    lastLesson: filteredLessons?.[filteredLessons.length - 1]
                                }]
                            }
                        })
                        return res.json(data);
                    })
                })
        })
}

export const deleteCourse = (req: Request, res: Response) => {
    const userId = res.locals.userId;
    const courseId = req.params.id;

    coursesDatabase.query('SELECT Courses.image_path FROM Courses WHERE id = ?', [courseId], (error, result) => {
        if (error || !result.length)
            return res.sendStatus(500);
        const imagePath = result[0].image_path;

        coursesDatabase.query('DELETE FROM Courses WHERE id = ? AND owner_id = ?', [courseId, userId], (error, result) => {
            if (error || !result.affectedRows)
                return res.sendStatus(500);
            if (imagePath)
                fs.unlink(imagePath, error => console.log(error));
            return res.json({message: 'Pomyślnie usunięto kurs.'});
        })
    })
}

export const getCourseDetails = (req: Request, res: Response) => {
    const courseId = req.params.id;
    coursesDatabase.query(
        'SELECT Courses.title, Courses.description, Courses.language, Courses.level, Courses.location, Courses.image_path, Owners.firstName as ownerFirstName, Owners.lastName as ownerLastName, Trainers.firstName as trainerFirstName, Trainers.lastName as trainerLastName \n' +
        'FROM Courses AS Courses\n' +
        'JOIN Users as Owners ON Courses.owner_id = Owners.id \n' +
        'JOIN Users as Trainers ON Courses.trainer_id = Trainers.id \n' +
        'WHERE Courses.id = ?', [courseId], (error, result) => {
        if (error)
            return res.sendStatus(500);
        return res.json(result[0]);
    })
}

export const getCourseAttendants = (req: Request, res: Response) => {
    const courseId = req.params.id;
    coursesDatabase.query('SELECT Users.username, Users.firstName, Users.lastName FROM Users \n' +
        'JOIN Enrolled ON Users.id = Enrolled.user_id \n' +
        'WHERE Enrolled.course_id = ?', [courseId], (error, result) => {
        if (error)
            return res.sendStatus(500);
        return res.json(result);
    })
}

export const getCourseLessons = (req: Request, res: Response) => {
    const courseId = req.params.id;
    coursesDatabase.query('SELECT * FROM Lessons WHERE Lessons.course_id = ?', [courseId], (error, result) => {
        if (error)
            return res.sendStatus(500);
        return res.json(result.map((lesson: any) => {
            const {id, course_id, ...data} = lesson;
            return data;
        }));
    })
}