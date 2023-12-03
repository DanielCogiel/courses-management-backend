import express, { Express } from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";
import * as apiController from './controllers/api';
import * as authController from './controllers/auth';
import * as userController from './controllers/user';
import * as courseController from './controllers/course';
import * as enrollController from './controllers/enroll';
import * as permissionController from './controllers/permission';
import authenticateToken from "./middleware/authenticate-token";
import { ALLOWED_ORIGIN } from "./config/secrets";
import upload from "./config/multer";
import { uploadImage } from "./middleware/upload-image";

//Create server
const app: Express = express();

//Configuration
app.use(express.json());
app.use(cors({
    origin: ALLOWED_ORIGIN
}));
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));

//Endpoints

//Tests
app.post('/test/token/generate', apiController.tokenTestGenerate);
app.post('/test/token/verify', authenticateToken, apiController.tokenTestVerify);
app.get('/test/db', apiController.verifyDatabaseConnection);

//AUTH
app.post('/api/register', authController.registerUser);
app.post('/api/login', authController.loginUser);
app.put('/api/changePassword/mine', authenticateToken, authController.changeMyPassword);
app.put('/api/changePassword/:username', authenticateToken, authController.changeUsersPassword);
app.put('/api/changeRole/:username', authenticateToken, authController.changeUserRole);

//USER
app.get('/api/users/me', authenticateToken, userController.getUser);
app.get('/api/users/creators', authenticateToken, userController.getAllCreators);
app.get('/api/users', authenticateToken, userController.getAllUsers);
app.delete('/api/users/delete/me', authenticateToken, userController.deleteMyUser);
app.delete('/api/users/delete/:id', authenticateToken, userController.deleteUser);

//COURSE
app.get('/api/courses/all', authenticateToken, courseController.getAllCourses);
app.get('/api/courses/personal', authenticateToken, courseController.getPersonalCourses);
app.get('/api/courses/:id', authenticateToken, courseController.getCourse);
app.post('/api/courses/add', authenticateToken, uploadImage, courseController.addCourse);
app.put('/api/courses/edit/:id', authenticateToken, uploadImage, courseController.updateCourse);
app.delete('/api/courses/delete/:id', authenticateToken, courseController.deleteCourse);
app.get('/api/courses/details/:id', authenticateToken, courseController.getCourseDetails);
app.get('/api/courses/attendants/:id', authenticateToken, courseController.getCourseAttendants);
app.get('/api/courses/lessons/:id', authenticateToken, courseController.getCourseLessons);

//ENROLLED
app.post('/api/enroll/:id', authenticateToken, enrollController.addUserAsAttendant);
app.delete('/api/leave/:id', authenticateToken, enrollController.leaveCourse);

//PERMISSIONS
app.get('/api/permissions/deleteAccount', authenticateToken, permissionController.canAdminDeleteAccount);
export default app;