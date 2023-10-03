import { Request, Response } from "express";
import generateToken from "../util/generate-token";
import RequestWithId from "../models/request-with-id";
export const getTest = (req: Request, res: Response) => {
    res.json({
        title: "App works"
    });
};
export const postTest = (req: Request, res: Response) => {
    return res.json(req.body);
}
export const tokenTestGenerate = (req: Request<{}, {}, {userId: number}>, res: Response) => {
    const token = generateToken(req.body.userId);
    return res.json({token: token});
}
export const tokenTestVerify = (req: Request, res: Response) => {
    const request: RequestWithId = req as RequestWithId;
    return res.json({message: `Verified token with User ID: ${request.userId}.`});
}
