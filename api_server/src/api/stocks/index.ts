import * as express from "express";
import { db, dbTransaction } from "../../utils/database";
import { fetchStockSymbol } from "../../utils/stocks";
import { sql } from "kysely";

const route = express.Router();

route.use(async (req, res, next) => {
    if (!req.userId) {
        res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
        return;
    }
    next();
});

route.get("/", async (req, res) => {
    const result = db
        .selectFrom(
            db
                .selectFrom("stocks")
                .innerJoin("watchlist", "stocks.symbol", "watchlist.symbol")
                .selectAll()
                .where("watchlist.user_id", "=", req.userId)
                .select(sql`ROW_NUMBER() OVER (PARTITION BY stocks.symbol ORDER BY stocks.timestamp DESC)`.as("rn"))
                .as("latest_stocks")
        )
        .selectAll()
        .where("latest_stocks.rn", "=", 1);
    const resp = await result.execute();
    console.log(resp);
    res.json({
        success: true,
        data: resp.map((r) => ({
            timestamp: r.timestamp.valueOf(),
            symbol: r.symbol,
            open: r.open,
            close: r.close,
            high: r.high,
            low: r.low,
        })),
    });
});

route.get("/symbols", async (req, res) => {
    const symbols = await db.selectFrom("watchlist").select("symbol").where("user_id", "=", req.userId).execute();
    res.json({
        success: true,
        data: symbols.map((s) => s.symbol),
    });
});

route.post("/symbols", async (req, res) => {
    const { symbol } = req.body as { symbol: string };
    if (!symbol) {
        res.status(500).json({
            success: false,
            message: "Missing symbol",
        });
        return;
    }
    try {
        await dbTransaction(async (trx) => {
            await trx
                .insertInto("watchlist")
                .values({
                    user_id: req.userId,
                    symbol: symbol,
                })
                .onConflict((oc) => oc.doNothing())
                .execute();

            const existing = await trx
                .selectFrom("stocks")
                .select("timestamp")
                .where("symbol", "=", symbol)
                .orderBy("timestamp asc")
                .limit(1)
                .executeTakeFirst();
            if (!existing) {
                const resp = await fetchStockSymbol(symbol);
                const inserted = await trx
                    .insertInto("stocks")
                    .values({
                        symbol: symbol,
                        volume: resp.volume,
                        low: resp.low,
                        high: resp.high,
                        open: resp.open,
                        close: resp.open,
                        timestamp: new Date(),
                    })
                    .returningAll()
                    .execute();
                console.log("inserted value", inserted);
            }
        });
        res.json({
            success: true,
        });
    } catch (er) {
        console.log("-=--", er);
        res.status(500).json({ success: false, message: er });
    }
});

route.delete("/symbols", async (req, res) => {
    const { symbol } = req.query as { symbol: string };
    if (!symbol) {
        res.status(500).json({
            success: false,
            message: "Missing symbol",
        });
        return;
    }
    await dbTransaction(async (trx) => {
        await trx.deleteFrom("watchlist").where("user_id", "=", req.userId).where("symbol", "=", symbol).execute();
        const all = await trx
            .selectFrom("watchlist")
            .select(trx.fn.countAll().as("count"))
            .where("symbol", "=", symbol)
            .execute();
        console.log(
            "-=-=-",
            all.length,
            trx.selectFrom("watchlist").select(trx.fn.countAll().as("count")).where("symbol", "=", symbol).compile()
        );
        if (all.length === 0) {
            await trx.deleteFrom("stocks").where("symbol", "=", symbol).execute();
        }
    });
    res.json({
        success: true,
    });
});

export default route;
