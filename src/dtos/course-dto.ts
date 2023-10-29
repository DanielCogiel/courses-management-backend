import Level from "../enums/level.enum";
import Language from "../enums/language.enum";
export interface Datetime {
    date: string,
    timeStart: string,
    timeFinish: string
}
interface CourseDto {
    title: string,
    language: Language,
    level: Level,
    location: string,
    trainer: string,
    datetimes: string;
}
export default CourseDto;