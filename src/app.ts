import express, { Express } from "express";
import cors from 'cors';
import * as apiController from './controllers/api';
import * as authController from './controllers/auth';
import authenticateToken from "./middleware/authenticate-token";

//Create server
const app: Express = express();

//Configuration
app.use(express.json());
app.use(cors());

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
export default app;