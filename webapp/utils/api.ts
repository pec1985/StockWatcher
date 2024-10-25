export const API_ENDPOINT = "http://localhost:1985";

export type BadResoonse = {
    success: false;
    message: string;
};

export type BasicResponse = {
    success: true;
};

export type LoginResponse =
    | BadResoonse
    | {
          success: true;
          data: {
              sessionId: string;
              userId: number;
              fullname: string;
          };
      };

export type CreateResponse =
    | BadResoonse
    | {
          success: true;
          data: {
              sessionId: string;
              userId: number;
          };
      };

export type WatchingSymbolsResponse =
    | BadResoonse
    | {
          success: true;
          data: string[];
      };

export type LatestStockPrice = {
    symbol: string;
    timestamp: number;
    open: number;
    close: number;
    high: number;
    low: number;
};

export type LatestStockPrices =
    | BadResoonse
    | {
          data: LatestStockPrice[];
      };

export const login = async (email: string, password: string) => {
    try {
        const resp = await fetch(`${API_ENDPOINT}/auth/login`, {
            method: "post",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                password,
            }),
        })
            .then((r) => r.json())
            .then((r) => r as LoginResponse);
        return resp;
    } catch (er: any) {
        return {
            success: false,
            message: er.toString(),
        };
    }
};

export const logout = async () => {
    try {
        const resp = await fetch(`${API_ENDPOINT}/auth/logout`, {
            method: "post",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((r) => r.json())
            .then((r) => r as BasicResponse);
        return resp;
    } catch (er: any) {
        return {
            success: false,
            message: er.toString(),
        };
    }
};

export const createAccount = async (fullname: string, email: string, password: string) => {
    try {
        const resp = await fetch(`${API_ENDPOINT}/auth/create`, {
            method: "post",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ fullname, email, password }),
        })
            .then((r) => r.json())
            .then((r) => r as CreateResponse);
        return resp;
    } catch (er: any) {
        return {
            success: false,
            message: er.toString(),
        };
    }
};

export const fetchWatchingSymbols = async (sessionId: string) => {
    try {
        const resp = await fetch(`${API_ENDPOINT}/stocks/symbols`, {
            method: "get",
            headers: {
                "Content-Type": "application/json",
                "x-session": sessionId,
            },
        })
            .then((r) => r.json())
            .then((r) => r as WatchingSymbolsResponse);
        return resp;
    } catch (er: any) {
        return {
            success: false,
            message: er.toString(),
        };
    }
};

export const addWatchingSymbol = async (sessionId: string, symbol: string) => {
    try {
        const resp = await fetch(`${API_ENDPOINT}/stocks/symbols`, {
            method: "post",
            headers: {
                "Content-Type": "application/json",
                "x-session": sessionId,
            },
            body: JSON.stringify({ symbol }),
        })
            .then((r) => r.json())
            .then((r) => r as BasicResponse);
        return resp;
    } catch (er: any) {
        return {
            success: false,
            message: er.toString(),
        };
    }
};

export const removeWatchingSymbol = async (sessionId: string, symbol: string) => {
    try {
        const resp = await fetch(`${API_ENDPOINT}/stocks/symbols?symbol=${symbol}`, {
            method: "delete",
            headers: {
                "Content-Type": "application/json",
                "x-session": sessionId,
            },
        })
            .then((r) => r.json())
            .then((r) => r as BasicResponse);
        return resp;
    } catch (er: any) {
        return {
            success: false,
            message: er.toString(),
        };
    }
};

export const fetchLatestStockPrices = async (sessionId: string) => {
    try {
        const resp = await fetch(`${API_ENDPOINT}/stocks`, {
            method: "get",
            headers: {
                "Content-Type": "application/json",
                "x-session": sessionId,
            },
        })
            .then((r) => r.json())
            .then((r) => r as LatestStockPrices);
        return resp;
    } catch (er: any) {
        return {
            success: false,
            message: er.toString(),
        };
    }
};
