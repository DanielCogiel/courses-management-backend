import { parseDateTimeStrings } from "./parse-datetime-strings";
import { dateFormatter } from "./date-formatter";
import { sortLessonsFormatted } from "./sort-database-lessons";

const validateLessonOverlapping = (dbLessons: any [], newLessons: any []) => {
    let valid = true;
    const oldLessons = dbLessons.map(lesson => dateFormatter(lesson));
    let lessons = [...oldLessons, ...newLessons];
    lessons = sortLessonsFormatted(lessons);

    for (let i = 0; i < lessons.length - 1; i++) {
        const currentLessonDatetime = parseDateTimeStrings(
            lessons[i].date, lessons[i].timeFinish
        );
        const nextLessonDatetime = parseDateTimeStrings(
            lessons[i + 1].date, lessons[i + 1].timeStart)
        if (currentLessonDatetime.getTime() > nextLessonDatetime.getTime()) {
            valid = false;

            break;
        }
    }
    return valid;
}