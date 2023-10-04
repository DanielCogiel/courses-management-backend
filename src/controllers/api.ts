import { Request, Response } from "express";
import generateToken from "../util/generate-token";
import RequestWithId from "../models/request-with-id";
import coursesDatabase from "../config/db-connection";
export const getTest = (req: Request, res: Response) => {
    res.json({
        title: "App works"
    });
};
export const postTest = (req: Request, res: Response) => {
    res.json(req.body);
}
export const tokenTestGenerate = (req: Request<{}, {}, {userId: number}>, res: Response) => {
    const token = generateToken(req.body.userId);
    res.json({token: token});
}
export const tokenTestVerify = (req: Request, res: Response) => {
    const request: RequestWithId = req as RequestWithId;
    res.json({message: `Verified token with User ID: ${request.userId}.`});
}
export const verifyDatabaseConnection = (req: Request, res: Response) => {
    coursesDatabase.query('SELECT 1', (error, data) => {
        if (error) res.json({error: 'Database connection not working.'});
        res.json(data);
    })
}
