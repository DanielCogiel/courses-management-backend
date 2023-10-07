import { Request, Response } from "express";
import UserDto from "../dtos/user-dto";
import coursesDatabase from "../config/db-connection";
import bcrypt from 'bcrypt';
import formatUser from "../util/format-user";
import { hashPassword } from "../util/bcrypt";

export const registerUser = (req: Request, res: Response) => {
    const user: UserDto = req.body;

    if (user.password !== user.confirmPassword)
        return res.status(422).send('Passwords do not match.');

    hashPassword(user.password, (hashError, hashedPassword) => {
        if (!hashedPassword)
            return res.status(500).send('Internal server error.')

        coursesDatabase.query('SELECT * FROM Users WHERE username = ?', [user.username], ((error, results) => {
            if (error)
                return res.status(500).send('Internal server error.')
            if (results.length > 0)
                return res.status(409).send(`User ${user.username} already exists.`)

            const userData = formatUser(user, hashedPassword);
            coursesDatabase.query('INSERT INTO Users(username, password, firstName, lastName, email, role) VALUES (?, ?, ?, ?, ?, ?)',
                [...userData], (error, result) => {
                    if (error)
                        return res.status(500).send('Error inserting user into database.');
                    return res.send('User added succesfully.')
                })
        }));
    })
}