import { Request, Response } from "express";
import UserDto from "../dtos/user-dto";
import coursesDatabase from "../config/db-connection";
import bcrypt from 'bcrypt';
import formatUser from "../util/format-user";
import { hashPassword } from "../util/bcrypt";
import generateToken from "../util/generate-token";

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

export const loginUser = (req: Request, res: Response) => {
    const {username, password} = req.body;

    coursesDatabase.query('SELECT * FROM Users WHERE username = ? COLLATE utf8_bin', [username], (error, result) => {
        if (error) return res.status(500).json({
            token: null
        })
        if (!result.length) return res.status(404).json({
            token: null,
        })

        bcrypt.compare(password, result[0].password, (error, isAuthenticated) => {
            if (!isAuthenticated) return res.status(401).json({
                token: null
            })

            return res.json({
                token: generateToken(result[0].id),
                role: result[0].role
            });
        })
    })
}