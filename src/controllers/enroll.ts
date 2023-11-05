import { Request, Response } from "express";
import coursesDatabase from "../config/db-connection";
export const addUserAsAttendant = (req: Request, res: Response) => {
    const userId = res.locals.userId;
    const courseId = req.params.id;

    coursesDatabase.query('SELECT * FROM Enrolled WHERE user_id = ? AND course_id = ?', [userId, courseId], (error, result) => {
        if (error)
            return res.sendStatus(500);
        if (result.length)
            return res.status(500).json({message: 'Jesteś już zapisany do tego kursu.'})

        coursesDatabase.query('INSERT INTO Enrolled(user_id, course_id) VALUES(?,?)', [userId, courseId], (error, result) => {
            if (error)
                return res.sendStatus(500);
            return res.json({message: 'Pomyślnie zapisano Cię do kursu.'});
        });
    })
}

export const leaveCourse = (req: Request, res: Response) => {
    const userId = res.locals.userId;
    const courseId = req.params.id;

    coursesDatabase.query('DELETE FROM Enrolled WHERE user_id = ? AND course_id = ?', [userId, courseId], (error, result) => {
        if (error || !result.affectedRows)
            return res.sendStatus(500);
        return res.json({message: 'Pomyślnie wypisano Cię z kursu.'});
    })
}