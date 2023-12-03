import { NextFunction, Response } from "express";
import jwt from 'jsonwebtoken';
import { TOKEN_KEY } from "../config/secrets";

//Verify if token sent in header is valid
const authenticateToken = (req: any, res: Response, next: NextFunction) => {
    const token = req.headers.token;

    if (!token)
        return res.sendStatus(401);

    jwt.verify(token as string, TOKEN_KEY as string, (err: any, tokenData: any) => {
        if (err)
            return res.sendStatus(401);

        res.locals.userId = tokenData.userId;
        next();
    })
}
export default authenticateToken;