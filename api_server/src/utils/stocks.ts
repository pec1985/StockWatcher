const randomBetween = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const fetchStockSymbol = async (symbol: string) => {
    try {
        // call some API and get values back:

        return {
            symbol,
            open: randomBetween(100, 145),
            close: randomBetween(160, 185),
            high: randomBetween(160, 185),
            low: randomBetween(100, 145),
            volume: 123123,
        };
    } catch (error) {
        console.error(error);
    }
};
