import { NextFunction, Response } from "express";
import jwt from 'jsonwebtoken';
import { TOKEN_KEY } from "../config/secrets";
import generateToken from "../util/generate-token";

//Verify if token sent in header is valid
const authenticateToken = (req: any, res: Response, next: NextFunction) => {
    const token = req.headers.token;
    const refreshToken = req.cookies['refresh-token'];

    if (!token && !refreshToken)
        return res.sendStatus(401);

    jwt.verify(token as string, TOKEN_KEY as string, (err: any, tokenData: any) => {
        if (err) {
            if (!refreshToken)
                return res.status(401).json({message: 'Odmowa dostępu. Brak tokenu.'});
            try {
                const decodedRefreshToken: any = jwt.verify(refreshToken, TOKEN_KEY as string);
                res.locals.token  = generateToken(decodedRefreshToken?.userId) as string;
                res.locals.userId = decodedRefreshToken?.userId;
                next();
                return;
            } catch(error) {
                return res.status(401).send('Odmowa dostępu. Niewłaściwy token.');
            }
        }
        res.locals.userId = tokenData.userId;
        next();
    })
}
export default authenticateToken;