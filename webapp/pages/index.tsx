import AllStocks from "@/components/AllStocks";
import { SessionContext } from "@/components/SessionContext";
import WatchList from "@/components/WatchList";
import { fetchLatestStockPrices, fetchWatchingSymbols, LatestStockPrice, login, logout } from "@/utils/api";
import { Container, Stack, Typography, useTheme, Tabs, TabList, Tab, TabPanel, Button } from "@mui/joy";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState, useRef } from "react";
import relativeTime from "dayjs/plugin/relativeTime";
import { io, Socket } from "socket.io-client";

dayjs.extend(relativeTime);

const useSocket = (refresh: () => void, sessionId?: string) => {
    const socket = useRef<Socket | null>(null);
    useEffect(() => {
        if (!sessionId) return;

        if (socket.current == null) {
            socket.current = io("http://localhost:1985/", {
                auth: {
                    token: sessionId,
                },
            });
        }
        socket.current.on("refresh", refresh);
    }, [sessionId, refresh]);
};

export default function App() {
    const router = useRouter();
    const theme = useTheme();

    const [session, setSession] = useState<{
        sessionId: string;
        userId: number;
        fullname: string;
        email: string;
    }>();

    const [watching, setWatching] = useState<string[]>([]);
    const [watchList, setWatchlist] = useState<LatestStockPrice[]>([]);

    useEffect(() => {
        if (session?.sessionId) {
            reload();
        }
    }, [session?.sessionId]);

    useEffect(() => {
        const sess = localStorage.getItem("session");
        if (sess) {
            setSession(JSON.parse(sess));
        } else {
            router.replace("/login");
        }
    }, []);

    const reload = useCallback(() => {
        if (!session?.sessionId) return;
        fetchWatchingSymbols(session.sessionId).then((res) => {
            if ("data" in res) {
                setWatching([...res.data]);
            }
        });
        fetchLatestStockPrices(session.sessionId).then((res) => {
            if ("data" in res) {
                setWatchlist(res.data);
            }
        });
    }, [session?.sessionId]);

    useSocket(reload, session?.sessionId);
    if (!session) {
        return null;
    }

    return (
        <SessionContext.Provider value={session}>
            <main>
                <Stack direction="row" height={60} bgcolor={theme.palette.primary.plainColor} alignItems="center">
                    <Typography sx={{ color: "white", ml: 2, flexGrow: 1 }}>Stock Trader</Typography>
                    <Button
                        onClick={() => {
                            logout().then(() => {
                                localStorage.removeItem("session");
                                router.reload();
                            });
                        }}
                    >
                        Logout
                    </Button>
                </Stack>
                <Container sx={{ mt: 2, mb: 2 }}>
                    <Tabs defaultValue={0}>
                        <TabList>
                            <Tab>My Watchlist</Tab>
                            <Tab>All Stocks</Tab>
                        </TabList>
                        <TabPanel value={0}>
                            <WatchList watchList={watchList} />
                        </TabPanel>
                        <TabPanel value={1}>
                            <AllStocks watching={watching} reload={reload} />
                        </TabPanel>
                    </Tabs>
                </Container>
            </main>
        </SessionContext.Provider>
    );
}
