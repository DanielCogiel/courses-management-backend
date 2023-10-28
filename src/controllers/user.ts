import { Request, Response } from "express";
import coursesDatabase from "../config/db-connection";

export const getUser = (req: Request, res: Response) => {
    const id = res.locals.userId;
    coursesDatabase.query('SELECT * FROM Users WHERE id = ?', [id], (error, result) => {
        if (error)
            return res.sendStatus(404);

        const {id, password, ...user} = result[0];
        return res.json({
            data: user,
            token: res.locals.token
        });
    });
}
//TODO only for creators
export const getAllCreators = (req: Request, res: Response) => {
    coursesDatabase.query('SELECT * FROM Users WHERE role = "CREATOR"', (error, result) => {
        return res.json(result.map((creator: any) => {
            return {
                id: creator.id,
                firstName: creator.firstName,
                lastName: creator.lastName,
                username: creator.username
            }
        }));
    })
}