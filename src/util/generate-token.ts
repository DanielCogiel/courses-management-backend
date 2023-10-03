import * as jwt from 'jsonwebtoken';
import { TOKEN_KEY } from "../config/secrets";

//Generate JWT Token for authentication
const generateToken = (userId: string | number, expirationTime: string = '3600s'): string | null => {
    if (TOKEN_KEY && userId)
        return jwt.sign({userId: userId}, TOKEN_KEY, {expiresIn: expirationTime});
    else
        return null;
}
export default generateToken;