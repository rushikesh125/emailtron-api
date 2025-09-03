import { Router } from "express";
import { addUsers } from "../controllers/userController.js";
const userRouter = Router();

userRouter.post("/",addUsers)
export default userRouter;