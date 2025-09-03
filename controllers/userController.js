import { PrismaClient } from "@prisma/client";

const Prisma = new PrismaClient();


const addUsers = async (req,res)=>{
    try {
        
        if(!req.body.email || !req.body.password){
            return res.status(400).json({error:"Email and Password is Required"})
        }
        const {email,password} = req.body;
        const newUser =await Prisma.user.create({
            data:{
                email:email,
                password:password
            }
        })
        return res.status(201).json({newUser,msg:"User Created"})
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


export {addUsers}