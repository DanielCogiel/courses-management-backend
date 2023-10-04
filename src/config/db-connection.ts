import mysql from "mysql";
import { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USER } from "./secrets";

const coursesDatabase = mysql.createConnection({
    host: DB_HOST,
    port: parseInt(DB_PORT || '3306'),
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME
})

export default coursesDatabase;