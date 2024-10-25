import { login } from "@/utils/api";
import { validateEmail } from "@/utils/utils";
import {
    Button,
    DialogActions,
    DialogContent,
    DialogTitle,
    Input,
    Modal,
    ModalDialog,
    Stack,
    Typography,
} from "@mui/joy";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

const Page = () => {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const doLogin = () => {
        setLoading(true);
        login(email, password).then((resp) => {
            if ("data" in resp) {
                const { data } = resp;
                localStorage.setItem(
                    "session",
                    JSON.stringify({
                        sessionId: data.sessionId,
                        userId: data.userId,
                        fullname: data.fullname,
                        email: email,
                    })
                );
                router.replace("/");
            } else {
                setError(resp.message);
            }
            setLoading(false);
        });
    };

    return (
        <ModalDialog minWidth="sm">
            <form
                style={{ display: "contents" }}
                onSubmit={(e) => {
                    e.preventDefault();
                    doLogin();
                }}
            >
                <DialogTitle>Welcom to your Stock Watcher</DialogTitle>
                <DialogContent>
                    <Stack spacing={1}>
                        {error ? (
                            <Typography color="danger">{error}</Typography>
                        ) : (
                            <Typography>Please login to continue</Typography>
                        )}

                        <Stack>
                            <Typography>Email</Typography>
                            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </Stack>
                        <Stack>
                            <Typography>Password</Typography>
                            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                            <Typography level="body-sm">
                                password is encrypted on the client and never sent in plain text
                            </Typography>
                        </Stack>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button type="submit" disabled={!validateEmail(email) || password === ""}>
                        Login
                    </Button>
                </DialogActions>
                <Typography>
                    {"Don't have an account? "}
                    <Link href="/create_account">create one, it's free!</Link>
                </Typography>
            </form>
        </ModalDialog>
    );
};

export default Page;
