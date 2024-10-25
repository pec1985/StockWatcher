import { createAccount } from "@/utils/api";
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
    const [fullname, setFullname] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const doLogin = () => {
        setLoading(true);
        createAccount(fullname, email, password).then((resp) => {
            if ("data" in resp) {
                const { data } = resp;
                localStorage.setItem(
                    "session",
                    JSON.stringify({
                        sessionId: data.sessionId,
                        userId: data.userId,
                        fullname: fullname,
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
                <DialogTitle>Create an account in Stock Watcher</DialogTitle>
                <DialogContent>
                    <Stack spacing={1}>
                        {error && <Typography color="danger">{error}</Typography>}
                        <Stack>
                            <Typography>Full Name</Typography>
                            <Input value={fullname} onChange={(e) => setFullname(e.target.value)} />
                        </Stack>
                        <Stack>
                            <Typography>Email</Typography>
                            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </Stack>
                        <Stack>
                            <Typography>Password</Typography>
                            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </Stack>
                        <Stack>
                            <Typography>Repeat Password</Typography>
                            <Input type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} />
                            <Typography level="body-sm">
                                password is encrypted on the client and never sent in plain text
                            </Typography>
                            {password !== password2 && (
                                <Typography color="warning" level="body-sm">
                                    passwords dont match
                                </Typography>
                            )}
                        </Stack>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button
                        type="submit"
                        disabled={!validateEmail(email) || password === "" || password !== password2 || fullname === ""}
                    >
                        Create Account
                    </Button>
                </DialogActions>
            </form>
        </ModalDialog>
    );
};

export default Page;
