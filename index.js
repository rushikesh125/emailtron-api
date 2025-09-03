import express from "express"
import dotenv from "dotenv"
import userRouter from "./routes/userRoute.js";


dotenv.config();
const app = express();
const PORT = 3000 || process.env.PORT;

app.use(express.json())

app.get("/",(req,res)=>{
    res.json({msg:"Hello "})
})
app.use("/users",userRouter)


app.listen(PORT,()=>{
    console.log(`SERVER STARTED ON PORT:${PORT}`)
})