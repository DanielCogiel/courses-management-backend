import { parseDateTimeStrings, parseDateTimeStringsFormatted } from "./parse-datetime-strings";
export const sortDatabaseLessons = (lessons: any []) => {
    return lessons.sort((lessonA, lessonB) => {
        return parseDateTimeStrings(lessonA.date, lessonA.timeStart).getTime() - parseDateTimeStrings(lessonB.date, lessonB.timeStart).getTime();
    })
}
export const sortLessonsFormatted = (lessons: any []) => {
    return lessons.sort((lessonA, lessonB) => {
        return parseDateTimeStringsFormatted(lessonA.date, lessonA.timeStart).getTime() - parseDateTimeStringsFormatted(lessonB.date, lessonB.timeStart).getTime();
    })
}