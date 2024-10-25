import { Generated, Kysely, PostgresDialect, Transaction } from "kysely";
import pg from "pg";

const LOCAL = process.env.LOCAL;

// ========================================
// CRITICAL these should be env vars!!
// ========================================
const PG_DATABASE = "stocks";
const PG_HOST = LOCAL ? "localhost" : "postgres";
const PG_PASSWORD = "password";
const PG_USER = "pedro";
const PG_PORT = 5432;

export type UserTable = {
    id: Generated<number>;
    created_at: Generated<Date>;
    fullname: string;
    email: string;
    password: string; //md5
};

export type StocksTable = {
    id: Generated<number>;
    timestamp: Date;
    symbol: string;
    open: number;
    close: number;
    high: number;
    low: number;
    volume: number;
};

export type Wachlist = {
    id: Generated<number>;
    created_at: Generated<Date>;
    user_id: number;
    symbol: string;
};

export type Sessions = {
    id: Generated<number>;
    created_at: Generated<Date>;
    user_id: number;
    session_id: string;
};

type DatabaseSchema = {
    users: UserTable;
    stocks: StocksTable;
    watchlist: Wachlist;
    sessions: Sessions;
};

export type Database = Transaction<DatabaseSchema>;

export const db = new Kysely<DatabaseSchema>({
    dialect: new PostgresDialect({
        pool: new pg.Pool({
            host: PG_HOST,
            database: PG_DATABASE,
            user: PG_USER,
            password: PG_PASSWORD,
            port: PG_PORT,
            ssl: LOCAL ? false : true,
        }),
    }),
});

export const dbTransaction = async <T>(callback: (_trx: Database) => Promise<T>) => {
    try {
        return db.transaction().execute((trx) => callback(trx));
    } catch (err) {
        throw err;
    }
};
