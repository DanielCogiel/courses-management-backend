CREATE TABLE IF NOT EXISTS Lessons(
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(1000),
    date DATE NOT NULL,
    timeStart TIME NOT NULL,
    timeFinish TIME NOT NULL,
    FOREIGN KEY(course_id) REFERENCES Courses(id) ON DELETE CASCADE
);