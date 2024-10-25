import * as express from "express";
import { db, dbTransaction } from "../../utils/database";

const uuidv4 = () => {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
        (+c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))).toString(16)
    );
};

const route = express.Router();

route.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const resp = await dbTransaction(async (trx) => {
            const user = await trx
                .selectFrom("users")
                .select(["id", "fullname"])
                .where("users.email", "=", email)
                .where("password", "=", password)
                .executeTakeFirstOrThrow();
            const sessionId = uuidv4();
            await trx
                .insertInto("sessions")
                .values({
                    user_id: user.id,
                    session_id: sessionId,
                })
                .execute();

            return {
                sessionId,
                userId: user.id,
                fullname: user.fullname,
            };
        });
        res.json({
            success: true,
            data: resp,
        });
    } catch (er) {
        res.status(500).json({
            success: false,
            message: "Wrong email and/or password",
        });
    }
});

route.post("/create", async (req, res) => {
    const { email, password, fullname } = req.body;
    try {
        const resp = await dbTransaction(async (trx) => {
            const user = await trx
                .insertInto("users")
                .values({
                    fullname,
                    email,
                    password,
                })
                .returning("id")
                .executeTakeFirstOrThrow();
            const sessionId = uuidv4();
            console.log("2", user.id);
            await trx
                .insertInto("sessions")
                .values({
                    user_id: user.id,
                    session_id: sessionId,
                })
                .execute();

            return {
                sessionId,
                userId: user.id,
            };
        });
        res.json({
            success: true,
            data: resp,
        });
    } catch (er) {
        console.log("error --->", er);
        res.status(500).json({
            success: false,
            message: "User already exists",
        });
    }
});

route.get("/logout", async (req, res) => {
    if (!req.sessionId && !req.userId) {
        res.status(500).json({
            success: false,
            message: "Missing session id",
        });
    }

    await db.deleteFrom("sessions").where("session_id", "=", req.sessionId).where("user_id", "=", req.userId).execute();
    res.json({
        success: true,
    });
});

export default route;
