import cors from "cors";
import express from "express";
import socketio from "socket.io";
import { createServer } from "http";

import users from "./api/users";
import auth from "./api/auth";
import stocks from "./api/stocks";

import { db } from "./utils/database";
import { initSocket } from "./socket";

declare global {
    namespace Express {
        export interface Request {
            userId?: number;
            sessionId?: string;
        }
    }
}

const app = express();
const httpServer = createServer(app);
const io = new socketio.Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(async (req, res, next) => {
    // log incoming requests
    console.log("==>", req.method, req.url, req.params, req.query);

    const sessionId = req.headers["x-session"] as string;
    // TODO: User some type of in memory cache so we don't hit the db all the time
    if (sessionId) {
        const resp = await db
            .selectFrom("sessions")
            .select("user_id")
            .where("session_id", "=", sessionId)
            .executeTakeFirst();
        // could be null
        req.userId = resp?.user_id;
        req.sessionId = sessionId;
    }

    next();
});

app.use("/users", users);
app.use("/auth", auth);
app.use("/stocks", stocks);

initSocket(io);

httpServer.listen(1985);
