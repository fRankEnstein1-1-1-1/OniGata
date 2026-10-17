const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//register 

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required!"
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "User already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword
        });

        const token = jwt.sign(
            { userId: newUser._id },
            process.env.jwt,
            { expiresIn: "7d" }
        );

        return res.status(201).json({
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            token
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};
//login

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: "GO signup as*hole" });
        }
        else {
            const comparePassword = await bcrypt.compare(password, user.password);
            if (!comparePassword) {
                return res.status(400).json({ message: "This aint your password n!gga" });
            }
            else {
                const token = jwt.sign({
                    userId: user._id
                }, process.env.JWT, {
                    expiresIn: "7d"
                });
                return res.status(200).json({ message: "Here you go", token: `${token}` });
            }
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" })
    }
}

//me
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            user
        });

    } catch (error) {
        console.error("Get user error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

module.exports = {
    register,
    login,
    getMe
};
