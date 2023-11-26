import { dateFormatter } from "./date-formatter";
export const parseDateTimeStrings = (date: string, timeStr: string) => {
    const formattedDate = dateFormatter(new Date(date));
    const [year, month, day] = formattedDate.split('-').map(str => parseInt(str));
    const [hours, minutes] = timeStr.split(':').map(str => parseInt(str));
    return new Date(year, month - 1, day, hours, minutes);
}
export const parseDateTimeStringsFormatted = (date: string, timeStr: string) => {
    const [year, month, day] = date.split('-').map(str => parseInt(str));
    const [hours, minutes] = timeStr.split(':').map(str => parseInt(str));
    return new Date(year, month - 1, day, hours, minutes);
}
