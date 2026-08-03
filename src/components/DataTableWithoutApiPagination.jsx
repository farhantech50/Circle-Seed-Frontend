import { useMemo, useState } from "react";
import { Pagination, Tooltip } from "flowbite-react";
import { SyncLoader } from "react-spinners";

const DataTableWithoutApiPagination = ({
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
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const filteredData = useMemo(() => {
    if (!search.trim()) return tableData;

    return tableData.filter((row) =>
      Object.values(columnMapping).some((key) =>
        String(row[key] ?? "")
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    );
  }, [tableData, search, columnMapping]);

  const totalData = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalData / limit));
  const startIndex = (page - 1) * limit;

  const paginatedData = filteredData.slice(startIndex, startIndex + limit);

  return (
    <div className="w-full rounded-xl border border-primary-100 bg-white shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 bg-primary-500 text-white rounded-t-xl">
        <div className="flex items-center gap-2">
          <span className="text-sm text-white/80">Show</span>

          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="px-2 py-1 rounded-md text-text"
          >
            {[5, 10, 25, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          <span className="text-sm text-white/80">entries</span>
        </div>

        <h2 className="text-lg font-semibold uppercase tracking-wide text-center">
          {headerConfig.title}
        </h2>

        <input
          type="text"
          placeholder={headerConfig.searchPlaceholder}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full lg:w-80 px-3 py-2 rounded-lg text-text"
        />
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
          className={`block md:hidden p-3 space-y-3 ${loading && paginatedData.length > 0 ? "opacity-50 pointer-events-none" : ""}`}
        >
          {paginatedData.length > 0 ? (
            paginatedData.map((row, index) => (
              <div
                key={row.id || index}
                className="bg-white border border-primary-100 rounded-xl shadow-sm p-4"
              >
                {tableHead.map((col) => {
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
                      className="flex justify-between gap-4 py-2 border-b border-primary-100 last:border-b-0"
                    >
                      <span className="font-medium text-primary-700">
                        {col}
                      </span>

                      <span className="text-right break-words max-w-[60%]">
                        {value}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))
          ) : !loading ? (
            <div className="text-center py-8">No data found</div>
          ) : null}
        </div>

        {/* Desktop */}
        <div
          className={`hidden md:block overflow-x-auto ${loading && paginatedData.length > 0 ? "opacity-50 pointer-events-none" : ""}`}
        >
          <table className="min-w-full">
            <thead className="bg-primary-50 text-primary-700 text-sm uppercase">
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

            <tbody className="divide-y divide-primary-100">
              {paginatedData.length > 0 ? (
                paginatedData.map((row, index) => (
                  <tr
                    key={row.id || index}
                    className="hover:bg-primary-50 transition"
                  >
                    {tableHead.map((col) => {
                      if (col === "SL") {
                        return (
                          <td key={col} className="px-4 py-2">
                            {startIndex + index + 1}
                          </td>
                        );
                      }

                      if (col === "Action" && actionButtonsConfig.length > 0) {
                        return (
                          <td key={col} className="px-4 py-2">
                            <div className="flex items-center justify-center">
                              {actionButtonsConfig.map(
                                (action, actIdx) =>
                                  action.show(row) && (
                                    <Tooltip
                                      key={
                                        action.label || action.title || actIdx
                                      }
                                      content={
                                        action.label || action.title || ""
                                      }
                                    >
                                      <button
                                        onClick={() => action.onClick(row)}
                                        className="flex items-center justify-center w-9 h-9 rounded-md hover:bg-gray-100 transition"
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

                      const statusColors = {
                        New: "bg-purple-50 text-purple-700 border border-purple-200",
                        Contacted:
                          "bg-cyan-50 text-cyan-700 border border-cyan-200",
                        Lost: "bg-zinc-100 text-zinc-600 border border-zinc-200",
                        Pending:
                          "bg-amber-50 text-amber-700 border border-amber-200",
                        Approved:
                          "bg-emerald-50 text-emerald-700 border border-emerald-200",
                        Completed:
                          "bg-emerald-50 text-emerald-700 border border-emerald-200",
                        Confirmed:
                          "bg-emerald-50 text-emerald-700 border border-emerald-200",
                        Paid: "bg-emerald-50 text-emerald-700 border border-emerald-200",
                        Unpaid:
                          "bg-rose-50 text-rose-700 border border-rose-200",
                        Partial:
                          "bg-amber-50 text-amber-700 border border-amber-200",
                        "Partially Paid":
                          "bg-amber-50 text-amber-700 border border-amber-200",
                        Rejected:
                          "bg-rose-50 text-rose-700 border border-rose-200",
                        Active:
                          "bg-green-50 text-green-700 border border-green-200",
                        Inactive:
                          "bg-zinc-100 text-zinc-600 border border-zinc-200",
                        "In Stock":
                          "bg-emerald-50 text-emerald-700 border border-emerald-200",
                        "Out of Stock":
                          "bg-rose-50 text-rose-700 border border-rose-200",
                        Expired:
                          "bg-rose-50 text-rose-700 border border-rose-200",
                        Ordered:
                          "bg-blue-50 text-blue-700 border border-blue-200",
                        "Fully Delivered":
                          "bg-emerald-50 text-emerald-700 border border-emerald-200",
                        "Partially Delivered":
                          "bg-amber-50 text-amber-700 border border-amber-200",
                        Delivered:
                          "bg-emerald-50 text-emerald-700 border border-emerald-200",
                        Planned:
                          "bg-amber-50 text-amber-700 border border-amber-200",
                        "In Progress":
                          "bg-blue-50 text-blue-700 border border-blue-200",
                        Cancelled:
                          "bg-rose-50 text-rose-700 border border-rose-200",
                        Present:
                          "bg-emerald-50 text-emerald-700 border border-emerald-200",
                        Absent:
                          "bg-rose-50 text-rose-700 border border-rose-200",
                        Late: "bg-amber-50 text-amber-700 border border-amber-200",
                      };

                      const align =
                        columnAlignment[col] === "right"
                          ? "text-right"
                          : columnAlignment[col] === "center"
                            ? "text-center"
                            : "text-left";

                      if (col.toLowerCase() === "status") {
                        return (
                          <td key={col} className={`px-4 py-2 ${align}`}>
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                statusColors[value] ||
                                "bg-gray-100 text-gray-700 border border-gray-200"
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
                          className={`px-4 py-2 text-text ${align}`}
                        >
                          {value ?? "-"}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : !loading ? (
                <tr>
                  <td colSpan={tableHead.length} className="py-10 text-center">
                    No data found
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center p-4 gap-3 text-text border-t border-primary-100">
        <div className="text-sm text-text-light">
          Showing{" "}
          <span className="font-semibold text-text">
            {totalData === 0 ? 0 : startIndex + 1}
          </span>{" "}
          to{" "}
          <span className="font-semibold text-text">
            {Math.min(page * limit, totalData)}
          </span>{" "}
          of <span className="font-semibold text-text">{totalData}</span>
        </div>

        {totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            showIcons
          />
        )}
      </div>
    </div>
  );
};

export default DataTableWithoutApiPagination;
