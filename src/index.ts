import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import authRouter from "./routes/auth";
import surveysRouter from "./routes/surveys";
import { errorHandler } from "./middleware/errorHandler";


const app = express();

const port = process.env.PORT||3000;

app.use(cors());

app.use(express.json());

app.get("/", (_req, res) => {
    res.send("Hello Waterlily");
});

app.get("/health", (_req, res) => {
    res.status(200).json({
        status: "ok",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
});
app.use("/auth", authRouter);
app.use("/surveys", surveysRouter);


app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);

});