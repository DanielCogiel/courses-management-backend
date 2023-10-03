import { Request } from "express";
interface RequestWithId extends Request {
    userId: string;
}
export default RequestWithId;