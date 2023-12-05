import Role from "../enums/role.enum";
import { NextFunction, Request, Response } from "express";
import coursesDatabase from "../config/db-connection";

const verifyRole = (roles: Role[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const userId = res.locals.userId;
        coursesDatabase.query('SELECT Users.role from Users WHERE Users.id = ?', [userId], (error, result) => {
            if (error)
                return res.sendStatus(500);

            const role = result[0].role;
            if (result.length && roles.includes(role)) {
                res.locals.role = role;
                next();
                return;
            } else {
                return res.status(403).json({ message: 'Nie posiadasz uprawnień do tego zasobu.' });
            }
        })
    }
}
export default verifyRole;