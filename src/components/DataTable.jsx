import { Pagination, Tooltip } from "flowbite-react";
import { SyncLoader } from "react-spinners";
import { usePaginationStore } from "../store/paginationStore";

const DataTable = ({
  tableHead,
  tableData,
  columnMapping = {},
  columnAlignment = {},
  actionButtonsConfig = [],
  headerConfig = {
    title: "Table",
    searchPlaceholder: "Search...",
  },
  loading = false,
}) => {
  const { page, limit, totalData, search, setPage, setLimit, setSearch } =
    usePaginationStore();

  const totalPages = Math.max(1, Math.ceil(totalData / limit));
  const startIndex = (page - 1) * limit;

  const statusColors = {
    New: "bg-purple-50 text-purple-700 border border-purple-200",
    Contacted: "bg-cyan-50 text-cyan-700 border border-cyan-200",
    Lost: "bg-zinc-100 text-zinc-600 border border-zinc-200",
    Pending: "bg-amber-50 text-amber-700 border border-amber-200",
    Approved: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    Completed: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    Confirmed: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    Paid: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    Unpaid: "bg-rose-50 text-rose-700 border border-rose-200",
    Partial: "bg-amber-50 text-amber-700 border border-amber-200",
    "Partially Paid": "bg-amber-50 text-amber-700 border border-amber-200",
    Rejected: "bg-rose-50 text-rose-700 border border-rose-200",
    Active: "bg-green-50 text-green-700 border border-green-200",
    Inactive: "bg-zinc-100 text-zinc-600 border border-zinc-200",
    "In Stock": "bg-emerald-50 text-emerald-700 border border-emerald-200",
    "Out of Stock": "bg-rose-50 text-rose-700 border border-rose-200",
    Expired: "bg-rose-50 text-rose-700 border border-rose-200",
    Ordered: "bg-blue-50 text-blue-700 border border-blue-200",
    "Fully Delivered":
      "bg-emerald-50 text-emerald-700 border border-emerald-200",
    "Partially Delivered": "bg-amber-50 text-amber-700 border border-amber-200",
    Delivered: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    Planned: "bg-amber-50 text-amber-700 border border-amber-200",
    "In Progress": "bg-blue-50 text-blue-700 border border-blue-200",
    Cancelled: "bg-rose-50 text-rose-700 border border-rose-200",
    Present: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    Absent: "bg-rose-50 text-rose-700 border border-rose-200",
    Late: "bg-amber-50 text-amber-700 border border-amber-200",
  };

  return (
    <div className="w-full rounded-xl border border-table-border bg-table-bg shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] items-center gap-4 p-4 bg-primary-500 text-white rounded-t-xl">
        <div className="flex items-center gap-2 justify-start">
          <span className="text-sm text-white/80">Show</span>

          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="px-3 py-2 rounded-lg bg-input-bg border border-input-border text-input-text"
          >
            {[5, 10, 25, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          <span className="text-sm text-white/80">entries</span>
        </div>

        <h2 className="text-lg font-semibold uppercase tracking-wide text-center whitespace-nowrap">
          {headerConfig.title}
        </h2>

        <div className="flex justify-start lg:justify-end">
          <input
            type="text"
            placeholder={headerConfig.searchPlaceholder}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full lg:w-[420px] rounded-lg border border-input-border bg-input-bg px-4 py-2 text-input-text placeholder-input-placeholder focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Table Content Wrapper with Smooth Loading Overlay */}
      <div className="relative min-h-[250px]">
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[0.5px] flex flex-col items-center justify-center z-20 transition-all duration-200">
            <SyncLoader size={9} color="#059669" />
            <span className="text-xs font-semibold text-emerald-800 mt-2.5 tracking-wide">
              Loading data...
            </span>
          </div>
        )}

        {/* Mobile */}
        <div
          className={`block md:hidden p-4 space-y-4 ${loading && tableData?.length > 0 ? "opacity-50 pointer-events-none" : ""}`}
        >
          {tableData?.length > 0 ? (
            tableData.map((row, index) => (
              <div
                key={row.id || index}
                className="rounded-xl border border-card-border bg-card-bg shadow-sm"
              >
                <div className="p-4 space-y-3">
                  {tableHead.map((col) => {
                    if (col === "Action") {
                      return (
                        <div
                          key={col}
                          className="flex justify-end gap-2 border-t border-table-border pt-3"
                        >
                          {actionButtonsConfig.map(
                            (action) =>
                              action.show(row) && (
                                <Tooltip
                                  key={action.label}
                                  content={action.label}
                                >
                                  <button
                                    type="button"
                                    onClick={() => action.onClick(row)}
                                    className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-table-row-hover transition"
                                  >
                                    {action.icon}
                                  </button>
                                </Tooltip>
                              ),
                          )}
                        </div>
                      );
                    }

                    let value;

                    if (col === "SL") {
                      value = startIndex + index + 1;
                    } else {
                      const key =
                        columnMapping[col] ||
                        col.toLowerCase().replace(/\s+/g, "");

                      value = row[key] ?? "-";
                    }

                    return (
                      <div
                        key={col}
                        className="flex items-center justify-between border-b border-table-border pb-2 last:border-none"
                      >
                        <span className="font-medium text-table-header-text">
                          {col}
                        </span>

                        {col.toLowerCase() === "status" ? (
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
                              statusColors[value] ||
                              "bg-gray-100 text-gray-700 border-gray-200"
                            }`}
                          >
                            {value}
                          </span>
                        ) : (
                          <span className="max-w-[60%] break-words text-right text-table-text">
                            {value}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          ) : !loading ? (
            <div className="py-10 text-center text-table-muted">
              No data found
            </div>
          ) : null}
        </div>

        {/* Desktop */}
        <div
          className={`hidden overflow-x-auto md:block ${loading && tableData?.length > 0 ? "opacity-50 pointer-events-none" : ""}`}
        >
          <table className="min-w-full">
            <thead className="bg-table-header text-table-header-text text-sm uppercase">
              <tr>
                {tableHead.map((col) => {
                  const align =
                    columnAlignment[col] === "right"
                      ? "text-right"
                      : columnAlignment[col] === "center"
                        ? "text-center"
                        : "text-left";

                  return (
                    <th
                      key={col}
                      className={`px-4 py-3 font-semibold ${align}`}
                    >
                      {col}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-table-border">
              {tableData?.length > 0 ? (
                tableData.map((row, index) => (
                  <tr
                    key={row.id || index}
                    className="transition hover:bg-table-row-hover"
                  >
                    {tableHead.map((col) => {
                      if (col === "SL") {
                        return (
                          <td key={col} className="px-4 py-3">
                            {startIndex + index + 1}
                          </td>
                        );
                      }

                      if (col === "Action" && actionButtonsConfig.length > 0) {
                        return (
                          <td key={col} className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {actionButtonsConfig.map(
                                (action) =>
                                  action.show(row) && (
                                    <Tooltip
                                      key={action.label}
                                      content={action.label}
                                    >
                                      <button
                                        type="button"
                                        onClick={() => action.onClick(row)}
                                        className="flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-table-row-hover"
                                      >
                                        {action.icon}
                                      </button>
                                    </Tooltip>
                                  ),
                              )}
                            </div>
                          </td>
                        );
                      }

                      const key =
                        columnMapping[col] ||
                        col.toLowerCase().replace(/\s+/g, "");

                      const value = row[key];

                      const align =
                        columnAlignment[col] === "right"
                          ? "text-right"
                          : columnAlignment[col] === "center"
                            ? "text-center"
                            : "text-left";

                      if (col.toLowerCase() === "status") {
                        return (
                          <td key={col} className={`px-4 py-3 ${align}`}>
                            <span
                              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${
                                statusColors[value] ||
                                "border-gray-200 bg-gray-100 text-gray-700"
                              }`}
                            >
                              {value ?? "-"}
                            </span>
                          </td>
                        );
                      }

                      return (
                        <td
                          key={col}
                          className={`px-4 py-3 text-table-text ${align}`}
                        >
                          {value ?? "-"}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : !loading ? (
                <tr>
                  <td
                    colSpan={tableHead.length}
                    className="py-12 text-center text-table-muted"
                  >
                    No data found
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-t border-table-border p-4">
        <div className="text-sm text-table-muted">
          Showing{" "}
          <span className="font-semibold text-table-text">
            {totalData === 0 ? 0 : startIndex + 1}
          </span>{" "}
          to{" "}
          <span className="font-semibold text-table-text">
            {Math.min(page * limit, totalData)}
          </span>{" "}
          of <span className="font-semibold text-table-text">{totalData}</span>
        </div>

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(p) => setPage(p)}
          showIcons
        />
      </div>
    </div>
  );
};

export default DataTable;
