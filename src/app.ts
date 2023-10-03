import express, { Express } from "express";
import cors from 'cors';
import * as apiController from './controllers/api';

//Create server
const app: Express = express();

//Configuration
app.use(express.json())
app.use(cors())

//Endpoints
app.get('/test/get', apiController.getTest);
app.post('/test/post', apiController.postTest);

export default app;