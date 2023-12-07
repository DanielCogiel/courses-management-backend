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
import verifyRole from "./middleware/verify-role";
import Role from "./enums/role.enum";

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
//Registers user
app.post('/api/register', authController.registerUser);
//Logs user in
app.post('/api/login', authController.loginUser);
//Changes user's password (triggered by user himself)
app.put('/api/changePassword/mine', authenticateToken, authController.changeMyPassword);
//Changes user's password (triggered by someone else)
app.put('/api/changePassword/:username', authenticateToken, authController.changeUsersPassword);
//Changes user's role (triggered by someone else)
app.put('/api/changeRole/:username', authenticateToken, authController.changeUserRole);

//USER
//Gets specific user
app.get('/api/users/me', authenticateToken, userController.getUser);
//Gets all creators
app.get('/api/users/creators', authenticateToken, verifyRole([Role.CREATOR, Role.ADMIN]), userController.getAllCreators);
//Gets all users
app.get('/api/users', authenticateToken, verifyRole([Role.ADMIN]), userController.getAllUsers);
//Deletes account (User deletes himself)
app.delete('/api/users/delete/me', authenticateToken, userController.deleteMyUser);
//Deletes account (User deletion triggered by someone else)
app.delete('/api/users/delete/:id', authenticateToken, verifyRole([Role.ADMIN]), userController.deleteUser);

//COURSE
//Gets all courses
app.get('/api/courses/all', authenticateToken, courseController.getAllCourses);
//Gets personal courses (courses in which user attends or is owner of)
app.get('/api/courses/personal', authenticateToken, courseController.getPersonalCourses);
//Gets specific course (for edit)
app.get('/api/courses/:id', authenticateToken, verifyRole([Role.CREATOR, Role.ADMIN]), courseController.getCourse);
//Creates new course
app.post('/api/courses/add', authenticateToken, verifyRole([Role.CREATOR, Role.ADMIN]), uploadImage, courseController.addCourse);
//Edits specific course
app.put('/api/courses/edit/:id', authenticateToken, verifyRole([Role.CREATOR, Role.ADMIN]), uploadImage, courseController.updateCourse);
//Deletes specific course
app.delete('/api/courses/delete/:id', authenticateToken, verifyRole([Role.CREATOR, Role.ADMIN]), courseController.deleteCourse);
//Gets course details (for view)
app.get('/api/courses/details/:id', authenticateToken, courseController.getCourseDetails);
//Gets all attendants of course
app.get('/api/courses/attendants/:id', authenticateToken, courseController.getCourseAttendants);
//Gets all lessons of course
app.get('/api/courses/lessons/:id', authenticateToken, courseController.getCourseLessons);

//ENROLLED
//Registers user as attendant of course
app.post('/api/enroll/:id', authenticateToken, enrollController.addUserAsAttendant);
//Unregisters user from course
app.delete('/api/leave/:id', authenticateToken, enrollController.leaveCourse);

//PERMISSIONS
//Checks if user can delete his account
app.get('/api/permissions/deleteAccount', authenticateToken, permissionController.canAdminDeleteAccount);
export default app;