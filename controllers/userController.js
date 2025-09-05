import { prisma } from "../index.js";

const addUsers = async (req, res) => {
  try {
    if (!req.body.email || !req.body.userId) {
      return res.status(400).json({ error: "Email and userId are required" });
    }

    const { userId, email, fullName, photoURL } = req.body;

    // Check if user already exists by email or userId
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { userId: userId }
        ]
      }
    });

    if (existingUser) {
      return res.status(200).json({ 
        user: existingUser, 
        msg: "User already exists" 
      });
    }

    const userData = {
      userId,
      email,
      fullName,
      photoURL: photoURL || "/profile.png",
    };

    const newUser = await prisma.user.create({
      data: userData
    });

    return res.status(201).json({ 
      user: newUser, 
      msg: "User created successfully" 
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export { addUsers };
