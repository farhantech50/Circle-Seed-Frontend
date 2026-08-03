import React, { useState, useEffect } from "react";
import CustomModal from "../../../components/CustomModal";
import { FaFilePdf } from "react-icons/fa";
import useAttendance from "../../../hooks/useAttendance";
import { SyncLoader } from "react-spinners";
import { formatDhakaDate, formatDhakaTime } from "../../../utils/dateUtils";

const AttendanceStatementModal = ({ open, setOpen, filters }) => {
  const { getAttendanceStatement } = useAttendance();
  const [statementData, setStatementData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    if (open && filters?.userId && filters?.startDate && filters?.endDate) {
      fetchStatement();
    }
  }, [open, filters]);

  const fetchStatement = async () => {
    setLoading(true);
    const res = await getAttendanceStatement(filters);
    if (res.success) {
      setStatementData(res.data);
    } else {
      setStatementData(null);
    }
    setLoading(false);
  };

  const formatTime = (timeString) => {
    if (!timeString) return "-";
    return formatDhakaTime(timeString);
  };

  const getStatusColor = (status, type) => {
    if (type === "Weekend" || type === "Holiday") {
      return "bg-gray-100 text-gray-700 border-gray-200";
    }
    switch (status) {
      case "Present":
        return "bg-green-50 text-green-700 border-green-200";
      case "Absent":
        return "bg-red-50 text-red-700 border-red-200";
      case "Late":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const handleDownloadPDF = () => {
    setPdfLoading(true);
    const element = document.getElementById("statement-container");
    
    const generate = async () => {
      const canvasWidth = element.scrollWidth;
      const canvasHeight = element.scrollHeight;
      
      const opt = {
        margin:       10,
        filename:     `Statement_${statementData?.user?.employeeId || 'Employee'}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'px', format: [canvasWidth + 20, canvasHeight + 20], orientation: 'portrait' }
      };

      try {
        await window.html2pdf().set(opt).from(element).save();
      } catch (err) {
        console.error("PDF generation error:", err);
      } finally {
        setPdfLoading(false);
      }
    };

    if (window.html2pdf) {
      generate();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
    script.onload = () => {
      generate();
    };
    script.onerror = () => {
      setPdfLoading(false);
      alert("Failed to load PDF generator library.");
    };
    document.body.appendChild(script);
  };

  return (
    <CustomModal
      open={open}
      setOpen={setOpen}
      header="Attendance Statement"
      width="max-w-6xl"
    >
      <style>{`
        @media print {
          /* Reset transforms to prevent modal animations from trapping the fixed element */
          * {
            transform: none !important;
            animation: none !important;
            transition: none !important;
          }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            background-color: white !important;
          }
          body * {
            visibility: hidden;
          }
          #statement-container, #statement-container * {
            visibility: visible;
          }
          #statement-container {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            max-width: 100vw !important;
            padding: 40px !important;
            margin: 0 !important;
            box-sizing: border-box !important;
            overflow: visible !important;
            z-index: 999999 !important;
          }
          .print-hidden {
            display: none !important;
          }
          @page {
            size: auto;
            margin: 10mm;
          }
        }
      `}</style>

      <div id="statement-container" className="p-2 md:p-6 bg-white min-h-[400px]">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <SyncLoader size={10} color="#234C6A" />
          </div>
        ) : statementData ? (
          <div>
            {/* Employee Summary */}
            <div className="bg-primary-50 rounded-xl p-4 mb-4 border border-primary-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-primary-900">
                  {statementData.user?.fullName}
                </h2>
                <div className="flex gap-4 mt-1 text-xs font-medium text-primary-700">
                  <span>ID: {statementData.user?.employeeId}</span>
                  <span>|</span>
                  <span>Role: {statementData.user?.role?.value}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-primary-600 font-semibold mb-1">Statement Period</p>
                <div className="bg-white px-3 py-1.5 rounded-lg border border-primary-200 text-sm font-medium text-primary-800">
                  {formatDhakaDate(statementData.startDate)} -{" "}
                  {formatDhakaDate(statementData.endDate)}
                </div>
              </div>
            </div>

            {/* Statement Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-700 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="px-2 py-1 border-b whitespace-nowrap">Date</th>
                    <th className="px-2 py-1 border-b whitespace-nowrap">Day</th>
                    <th className="px-2 py-1 border-b whitespace-nowrap">Type</th>
                    <th className="px-2 py-1 border-b text-center whitespace-nowrap">Status</th>
                    <th className="px-2 py-1 border-b text-center whitespace-nowrap">Check In</th>
                    <th className="px-2 py-1 border-b text-center whitespace-nowrap">Check Out</th>
                    <th className="px-2 py-1 border-b text-center whitespace-nowrap">Total Hrs</th>
                    <th className="px-2 py-1 border-b text-center whitespace-nowrap">OT Hrs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {statementData.statement?.length > 0 ? (
                    statementData.statement.map((record, index) => (
                      <tr
                        key={index}
                        className={`hover:bg-gray-50 transition-colors ${
                          record.type === "Weekend" || record.type === "Holiday"
                            ? "bg-gray-50/50"
                            : ""
                        }`}
                      >
                        <td className="px-2 py-1 font-medium text-gray-900 text-[11px] whitespace-nowrap">
                          {record.date}
                        </td>
                        <td className="px-2 py-1 text-gray-600 text-[11px] whitespace-nowrap">{record.day}</td>
                        <td className="px-2 py-1 text-gray-600 text-[11px] whitespace-nowrap">
                          {record.type === "Holiday" && record.holidayName ? (
                            <span title={record.holidayName}>{record.type}*</span>
                          ) : (
                            record.type
                          )}
                        </td>
                        <td className="px-2 py-1 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold border ${getStatusColor(
                              record.status,
                              record.type
                            )}`}
                          >
                            {record.status || record.type}
                          </span>
                        </td>
                        <td className="px-2 py-1 text-center text-gray-600 text-[11px] whitespace-nowrap">
                          {formatTime(record.checkInTime)}
                        </td>
                        <td className="px-2 py-1 text-center text-gray-600 text-[11px] whitespace-nowrap">
                          {formatTime(record.checkOutTime)}
                        </td>
                        <td className="px-2 py-1 text-center text-gray-900 font-medium text-[11px] whitespace-nowrap">
                          {record.totalHours ? `${record.totalHours}h` : "-"}
                        </td>
                        <td className="px-2 py-1 text-center text-gray-900 font-medium text-[11px] whitespace-nowrap">
                          {record.overtimeHours ? `${record.overtimeHours}h` : "-"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                        No statement records found for this period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center h-64 text-gray-500 font-medium">
            No statement data available.
          </div>
        )}
      </div>

      <div className="flex justify-end gap-4 mt-4 px-6 pb-6">
        <button
          onClick={handleDownloadPDF}
          disabled={pdfLoading}
          className={`px-6 py-2.5 ${pdfLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-rose-600 hover:bg-rose-700'} text-white font-semibold rounded-xl transition shadow-sm flex items-center gap-2`}
        >
          {pdfLoading ? <SyncLoader size={6} color="#ffffff" /> : <FaFilePdf />} 
          {pdfLoading ? "Generating..." : "Download PDF"}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition shadow-sm"
        >
          Close
        </button>
      </div>
    </CustomModal>
  );
};

export default AttendanceStatementModal;
