import { Request, Response } from "express";
import UserDto from "../dtos/user-dto";
import coursesDatabase from "../config/db-connection";
import bcrypt from 'bcrypt';
import formatUser from "../util/format-user";
import { hashPassword } from "../util/bcrypt";
import generateToken from "../util/generate-token";
import jwt, { JwtPayload } from "jsonwebtoken";
import { TOKEN_KEY } from "../config/secrets";

export const registerUser = (req: Request, res: Response) => {
    const user: UserDto = req.body;

    if (user.password !== user.confirmPassword)
        return res.status(422).json({message: 'Hasła nie są takie same.'});

    hashPassword(user.password, (hashError, hashedPassword) => {
        if (!hashedPassword)
            return res.sendStatus(500);

        coursesDatabase.query('SELECT * FROM Users WHERE username = ?', [user.username], ((error, results) => {
            if (error)
                return res.sendStatus(500);
            if (results.length > 0)
                return res.status(409).json({message: `Użytkownik ${user.username} już istnieje.`})

            const userData = formatUser(user, hashedPassword);
            coursesDatabase.query('INSERT INTO Users(username, password, firstName, lastName, email, role) VALUES (?, ?, ?, ?, ?, ?)',
                [...userData], (error, result) => {
                    if (error)
                        return res.sendStatus(500);
                    return res.json({message: 'Pomyślnie zarejestrowano użytkownika.'})
                })
        }));
    })
}

export const loginUser = (req: Request, res: Response) => {
    const {username, password} = req.body;

    coursesDatabase.query('SELECT * FROM Users WHERE username = ? COLLATE utf8_bin', [username], (error, result) => {
        if (error) return res.status(500).json({
            message: 'Błąd podczas logowania.',
            token: null
        })
        if (!result.length) return res.status(404).json({
            message: 'Użytkownik o podanej nazwie nie istnieje.',
            token: null,
        })

        bcrypt.compare(password, result[0].password, (error, isAuthenticated) => {
            if (!isAuthenticated) return res.status(401).json({
                message: 'Podano złe hasło.',
                token: null
            })

            return res
                .cookie('refresh-token', generateToken(result[0].id, '1d'), {secure: true, sameSite: 'none'})
                .json({
                    message: `Witamy, ${username}!`,
                    token: generateToken(result[0].id),
                    role: result[0].role
            });
        })
    })
}

export const refreshToken = (req: Request, res: Response) => {
    const refreshToken = req.cookies['refresh-token'];
    if (!refreshToken) return res.status(401).json({message: 'Odmowa dostępu. Brak tokenu.'});

    try {
        const decodedRefreshToken: any = jwt.verify(refreshToken, TOKEN_KEY as string);
        const newAccessToken = generateToken(decodedRefreshToken.userId);

        return res.json({
            token: newAccessToken
        })
    } catch (error) {
        return res.status(400).json({message: 'Odmowa dostępu. Niewłaściwy token.'});
    }
}

export const changeUsersPassword = (req: Request, res: Response) => {
    const username = req.params.username;
    const passwordData: {password: string, confirmPassword: string} = req.body;

    if (passwordData.password !== passwordData.confirmPassword)
        return res.status(422).json({message: 'Hasła nie są takie same.'});

    hashPassword(passwordData.password, (hashError, hashedPassword) => {
        if (!hashedPassword)
            return res.sendStatus(500);
        coursesDatabase.query(
            'UPDATE Users SET password = ? WHERE Users.username = ?', [hashedPassword, username],
            (error, result) => {
                if (error || !result.affectedRows)
                    return res.sendStatus(500);
                return res.json({message: 'Zmieniono hasło użytkownika.'})
            })
    })
}