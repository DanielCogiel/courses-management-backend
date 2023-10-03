import { Request, Response } from "express";
export const getTest = (req: Request, res: Response) => {
    res.json({
        title: "App works"
    });
};
export const postTest = (req: Request, res: Response) => {
    return res.json(req.body);
}
export const tokenTest = (req: Request, res: Response) => {

}