import { parseDateTimeStrings } from "./parse-datetime-strings";
import { dateFormatter } from "./date-formatter";
import { sortLessonsFormatted } from "./sort-database-lessons";

export const validateLessonOverlapping = (dbLessons: any [], newLessons: any []) => {
    let validObj: {
        valid: boolean,
        message: string | null
    } = {
        valid: true,
        message: null
    };

    const oldLessons = dbLessons.map(lesson => {
        return {
            ...lesson,
            date: dateFormatter(new Date(lesson.date))
        }
    });

    let lessons = [...oldLessons, ...newLessons];
    lessons = sortLessonsFormatted(lessons);

    for (let i = 0; i < lessons.length - 1; i++) {
        const currentLessonDatetime = parseDateTimeStrings(
            lessons[i].date, lessons[i].timeFinish
        );
        const nextLessonDatetime = parseDateTimeStrings(
            lessons[i + 1].date, lessons[i + 1].timeStart)
        if (currentLessonDatetime.getTime() > nextLessonDatetime.getTime()) {
            validObj.valid = false;
            validObj.message = `Lekcja ${'"' + lessons[i].title + '"'} ${lessons[i].course_id ? `z kursu ${'"' + lessons[i].course_title + '"'}` : ''} koliduje z lekcją ${'"' + lessons[i+1].title + '"'} ${lessons[i+1].course_id ? `z kursu ${ '"' + lessons[i+1].course_title + '"'}` : ''}`;
            break;
        }
    }
    return validObj;
}