import { Request, Response } from "express";
import generateToken from "../util/generate-token";
import coursesDatabase from "../config/db-connection";

export const tokenTestGenerate = (req: Request<{}, {}, {userId: number}>, res: Response) => {
    const token = generateToken(req.body.userId);
    res.json({token: token});
}
export const tokenTestVerify = (req: Request, res: Response) => {
    res.json({
        token: res.locals.token,
        message: `Verified token with User ID: ${res.locals.userId}.`
    });
}
export const verifyDatabaseConnection = (req: Request, res: Response) => {
    coursesDatabase.query('SELECT 1', (error: any, data: any) => {
        if (error) res.json({error: 'Database connection not working.'});
        res.json(data);
    })
}