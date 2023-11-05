import Level from "../enums/level.enum";
import Language from "../enums/language.enum";
export interface Datetime {
    title: string,
    description: string,
    date: string,
    timeStart: string,
    timeFinish: string
}
interface CourseDto {
    title: string,
    language: Language,
    level: Level,
    location: string,
    trainer_id: string,
    datetimes: string;
}
export default CourseDto;