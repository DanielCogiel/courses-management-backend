import Level from "../enums/level.enum";
import Language from "../enums/language.enum";
interface CourseDto {
    title: string,
    language: Language,
    level: Level,
    location: string,
    trainer: string,
    datetimes: {date: string, timeStart: string, timeFinish: string} [];
}
export default CourseDto;