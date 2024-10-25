import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";

import { addWatchingSymbol, removeWatchingSymbol } from "@/utils/api";
import { Button, Input, Stack, Table, Typography } from "@mui/joy";
import { useRouter } from "next/router";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import stocks from "../dummy_data/stocks.json";
import { SessionContext } from "./SessionContext";

const columnHelper = createColumnHelper<{
    Name: string;
    Symbol: string;
    watching: boolean;
}>();

const columns = (watchStock: (sym: string) => void, unWatchStock: (sym: string) => void) => {
    return [
        columnHelper.accessor("watching", {
            cell: ({ row }) => {
                const { watching, Symbol } = row.original;
                return (
                    <Button
                        variant={watching ? "outlined" : "solid"}
                        onClick={() => {
                            if (watching) {
                                unWatchStock(Symbol);
                            } else {
                                watchStock(Symbol);
                            }
                        }}
                    >
                        {watching ? "Unwatch" : "Watch"}
                    </Button>
                );
            },
        }),
        columnHelper.accessor("Symbol", { maxSize: 50, enableResizing: false }),
        columnHelper.accessor("Name", {}),
    ];
};
const AllStocks = ({ watching, reload }: { watching: string[]; reload: () => void }) => {
    const [search, setSearch] = useState("");
    const router = useRouter();
    const { page } = router.query as { page?: string };
    const [pagination, setPagination] = useState({
        pageIndex: 0, //initial page index
        pageSize: 20, //default page size
    });
    const session = useContext(SessionContext);
    const data = useMemo(() => {
        // fast lookup:
        const map: { [sym: string]: true } = {};
        for (let i = 0; i < watching.length; i++) {
            map[watching[i]] = true;
        }
        return stocks.map((stock) => ({ ...stock, watching: Boolean(map[stock.Symbol]) }));
    }, [watching]);

    const watchStock = useCallback(
        (sym: string) => {
            addWatchingSymbol(session.sessionId, sym).then((res) => {
                if (res.success) {
                    reload();
                }
            });
        },
        [session.sessionId]
    );

    const unWatchStock = useCallback(
        (sym: string) => {
            removeWatchingSymbol(session.sessionId, sym).then((res) => {
                if (res.success) {
                    reload();
                }
            });
        },
        [session.sessionId]
    );

    useEffect(() => {
        router.replace("/?tab=1&page=" + pagination.pageIndex);
    }, [pagination.pageIndex]);

    useEffect(() => {
        if (page != null) {
            setPagination({ ...pagination, pageIndex: parseInt(page) });
        }
    }, [page]);

    const table = useReactTable({
        data,
        columns: columns(watchStock, unWatchStock),
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onPaginationChange: setPagination,
        state: {
            pagination: pagination,
        },
    });

    return (
        <Stack>
            <Typography>Search</Typography>
            <Input
                value={search}
                onChange={(e) => {
                    setSearch(e.target.value);
                }}
            />
            <Table stickyHeader>
                <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th key={header.id}>
                                    <Typography onClick={header.column.getToggleSortingHandler()}>
                                        {header.isPlaceholder ? null : (
                                            <>
                                                {flexRender(header.column.columnDef.header, header.getContext())}{" "}
                                                {{
                                                    asc: " 🔼",
                                                    desc: " 🔽",
                                                }[header.column.getIsSorted() as string] ?? null}
                                            </>
                                        )}
                                    </Typography>
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table
                        .getRowModel()
                        .rows.filter((row) => {
                            if (search === "") return true;
                            return (
                                (row.original.Symbol + " " + row.original.Name)
                                    .toLowerCase()
                                    .indexOf(search.toLowerCase()) > -1
                            );
                        })
                        .map((row) => (
                            <tr key={row.id}>
                                {row.getVisibleCells().map((cell) => (
                                    <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                                ))}
                            </tr>
                        ))}
                </tbody>
            </Table>
            <Stack direction="row" spacing={1} alignItems="center">
                <Typography>
                    Page
                    <strong>
                        {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                    </strong>
                </Typography>
                <Button variant="plain" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                    {"<"}
                </Button>
                <Button variant="plain" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                    {">"}
                </Button>
            </Stack>
        </Stack>
    );
};

export default AllStocks;
