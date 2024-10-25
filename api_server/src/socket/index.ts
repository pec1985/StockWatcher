import { Server, Socket } from "socket.io";
import { db, dbTransaction } from "../utils/database";
import { fetchStockSymbol } from "../utils/stocks";

const sleep = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

export const initSocket = (io: Server) => {
    const clientsConnected: { [id: string]: Socket } = {};

    io.use(async (socket, next) => {
        const token = socket.handshake.auth.token as string;
        if (!token) {
            // unauthorized
            socket.disconnect();
            return;
        }
        const auth = await db.selectFrom("sessions").select("user_id").where("session_id", "=", token).execute();
        if (!auth) {
            // unauthorized
            socket.disconnect();
            return;
        }
        next();
    });

    io.on("connection", (socket: Socket) => {
        console.log("socket connected");
        clientsConnected[socket.id] = socket;

        socket.on("disconnect", () => {
            console.log("socket disconnected");
            delete clientsConnected[socket.id];
        });
    });

    (async () => {
        while (true) {
            const started = Date.now();

            await dbTransaction(async (trx) => {
                const resp = await trx.selectFrom("watchlist").select("symbol").distinct().execute();
                const promises = resp.map((r) => fetchStockSymbol(r.symbol));
                const results = await Promise.all(promises);
                await trx
                    .insertInto("stocks")
                    .values(
                        results.map((resp) => ({
                            symbol: resp.symbol,
                            volume: resp.volume,
                            low: resp.low,
                            high: resp.high,
                            open: resp.open,
                            close: resp.open,
                            timestamp: new Date(),
                        }))
                    )
                    .execute();

                for (const socketId in clientsConnected) {
                    clientsConnected[socketId].emit("refresh");
                }
                console.log("fetched new prices and sent message to clients");
            });
            // sleep for one minute
            await sleep(60_000 - (Date.now() - started));
        }
    })();
};
