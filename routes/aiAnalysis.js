import { Router } from "express";
import { getEmailAnalysis } from "../controllers/emailProcessController.js";

const aiAnalysisRouter = Router();

aiAnalysisRouter.post("/",getEmailAnalysis)
export default aiAnalysisRouter;