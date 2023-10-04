import app from "./app";
import { DB_PORT, PORT } from "./config/secrets";
import coursesDatabase from "./config/db-connection";
coursesDatabase.connect(error => {
    if (error) console.log(`Error connecting to the database (${error})`);
    else console.log(`Connection with the database has been established. Database running on port ${DB_PORT}.`);
})
app.listen(PORT, ()=> {
    console.log(`[Server]: Running on port ${PORT}.`);
});