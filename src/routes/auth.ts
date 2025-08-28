import { Router} from "express";
import {z} from "zod";
import { register, login } from "../services/authService";

const router = Router();

const creds = z.object ({
    email: z.string().email(),
    password: z.string().min(6),
});

router.post("/register", async (req, res, next) => {
    try {
        const { email, password} = creds.parse(req.body);
        const user = await register (email, password);
        res.status(201).json({ user});
    } catch (err) { next(err); }
});

router.post("/login", async (req, res, next) => {
    try {
        const { email, password} = creds.parse(req.body);
        const result = await login (email, password);
        res.json(result);
    } catch (err) { next(err); }
});

export default router;