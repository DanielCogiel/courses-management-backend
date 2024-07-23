# Courses' management application

## Description
This project is a backend for a course management application, built using Express.js and MySQL. It provides APIs for managing courses, including functionalities for creating, updating, deleting, and retrieving course information. Frontend for this API can be found [here](https://github.com/DanielCogiel/courses-management-frontend).

## Prerequisites
- **Node v16.18.0** or higher
- **Docker** and **Docker Compose** for fast database setup
- Defined environment variables (for example in _.env_ file placed in root of project)

## Environment
There are total of 7 environment variables used in this project that must be defined for project to run. See the full list below:
- ```DB_PASSWORD``` root user password to access database
- ```DB_NAME``` database's name
- ```DB_HOST``` database's host
- ```DB_PORT``` database's port
- ```SERVER_PORT``` server's port
- ```TOKEN_KEY``` encryption key for _Json Web Token_
- ```ALLOWED_ORIGIN``` origin allowed by server, likely address of frontend

##  Installation

### _Database_

For server to function properly, database must be set up first. It can be achieved fast using predefined _docker-compose.yml_ file. Just run:
```
docker-compose up -d
```
No additional configuration is required.

### _Server_

Use _Node Package Manager_ to install dependencies:
```
npm i
```

If you successfully set up MySQL database, use this command to run migrations:
```
npx db-migrate up
```

Eventually, run build and start server:
```
npm run build
npm start
```

To run project in development mode, use:
```
npm run dev
```

After steps above are completed, you should be able to send requests to server on **http://localhost:{$SERVER_PORT}.** Note that there is one default administrator account in database that can be accessed using username _admin_ with password _admin_.