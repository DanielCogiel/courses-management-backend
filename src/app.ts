import express, { Express } from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";
import * as apiController from './controllers/api';
import * as authController from './controllers/auth';
import * as userController from './controllers/user';
import authenticateToken from "./middleware/authenticate-token";
import { ALLOWED_ORIGIN } from "./config/secrets";

//Create server
const app: Express = express();

//Configuration
app.use(express.json());
app.use(cors({
    credentials: true,
    origin: ALLOWED_ORIGIN
}));
app.use(cookieParser());

//Endpoints

//Tests
app.get('/test/get', apiController.getTest);
app.post('/test/post', apiController.postTest);
app.post('/test/token/generate', apiController.tokenTestGenerate);
app.post('/test/token/verify', authenticateToken, apiController.tokenTestVerify);
app.get('/test/db', apiController.verifyDatabaseConnection);

//AUTH
app.post('/api/register', authController.registerUser);
app.post('/api/login', authController.loginUser);
app.post('/api/refreshToken', authController.refreshToken);

//USER
app.get('/api/users/me', authenticateToken, userController.getUser);
export default app;