import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable,
} from "@tanstack/react-table";

import { LatestStockPrice } from "@/utils/api";
import { Button, Stack, Table, Typography } from "@mui/joy";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";

const columnHelper = createColumnHelper<LatestStockPrice>();

const columns = [
    columnHelper.accessor("symbol", {
        header: "Symbol",
    }),
    columnHelper.accessor("timestamp", {
        header: "Updated",
        cell: ({ row }) => {
            return dayjs(new Date(row.original.timestamp)).fromNow();
        },
    }),
    columnHelper.accessor("open", {
        header: "Open",
    }),
    columnHelper.accessor("close", {
        header: "Close",
    }),
    columnHelper.accessor("high", {
        header: "High",
    }),
    columnHelper.accessor("low", {
        header: "Low",
    }),
];

const WatchList = ({ watchList }: { watchList: LatestStockPrice[] }) => {
    const [now, setNow] = useState(Date.now());
    const interval = useRef<NodeJS.Timeout | null>(null);
    const table = useReactTable({
        data: watchList,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    useEffect(() => {
        interval.current = setInterval(() => {
            setNow(Date.now());
        }, 5000);
    }, []);

    return (
        <Stack>
            <Table stickyHeader>
                <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th key={header.id}>
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(header.column.columnDef.header, header.getContext())}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map((row) => (
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

export default WatchList;
