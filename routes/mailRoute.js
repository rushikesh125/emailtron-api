import { Router } from "express";

import {getEmailsController, getEmailsWithFilters} from "../controllers/mailController.js";

export const mailRouter = Router();

// mailRouter.get("/",getEmailsController)
mailRouter.get("/",getEmailsWithFilters)