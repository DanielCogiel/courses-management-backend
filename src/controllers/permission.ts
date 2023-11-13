import { Request, Response } from "express";
import coursesDatabase from "../config/db-connection";

export const canAdminDeleteAccount = (req: Request, res: Response) => {
    coursesDatabase.query('SELECT * FROM Users WHERE Users.role = "ADMIN"', (error, result) => {
        if (error)
            return res.status(500).json({canDeleteAccount: false});
        if (result.length > 1)
            return res.json({canDeleteAccount: true});
        else
            return res.json({canDeleteAccount: false});
    })
}