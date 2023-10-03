import express, { Express } from "express";
import cors from 'cors';
import * as apiController from './controllers/api';
import authenticateToken from "./middleware/authenticate-token";

//Create server
const app: Express = express();

//Configuration
app.use(express.json());
app.use(cors());

//Endpoints
app.get('/test/get', apiController.getTest);
app.post('/test/post', apiController.postTest);
app.post('/test/token/generate', apiController.tokenTestGenerate);
app.post('/test/token/verify', authenticateToken, apiController.tokenTestVerify);

export default app;