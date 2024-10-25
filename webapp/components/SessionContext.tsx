import { createContext } from "react";

export const SessionContext = createContext({
    sessionId: "",
    userId: 0,
    fullname: "",
    email: "",
});
