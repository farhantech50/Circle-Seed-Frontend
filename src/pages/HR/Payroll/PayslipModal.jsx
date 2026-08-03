import React from "react";
import CustomModal from "../../../components/CustomModal";
import { FaPrint } from "react-icons/fa";

const PayslipModal = ({ open, setOpen, payrollData }) => {
  if (!payrollData) return null;

  const handlePrint = () => {
    // Basic print functionality
    window.print();
  };

  const formatCurrency = (amount) => {
    if (isNaN(amount) || amount === null || amount === undefined) {
      return "BDT 0.00";
    }
    return Number(amount).toLocaleString("en-BD", {
      style: "currency",
      currency: "BDT",
    });
  };

  return (
    <CustomModal
      open={open}
      setOpen={setOpen}
      header="Payslip Details"
      width="max-w-4xl"
    >
      {/* Wrapper to control print styles */}
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
          #payslip-container, #payslip-container * {
            visibility: visible;
          }
          #payslip-container {
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
          /* Ensure grids work properly in print */
          .grid {
            display: grid !important;
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

      <div className="p-6 bg-white rounded-lg" id="payslip-container">
        {/* Header Section */}
        <div className="flex justify-between items-center border-b-2 border-gray-200 pb-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-wider">
              Circle Seed
            </h2>
            
          </div>
          <div className="text-right">
            <h1 className="text-3xl font-extrabold text-primary-600 uppercase tracking-widest">
              Payslip
            </h1>
            <p className="text-gray-600 font-medium text-lg mt-1">
              {payrollData.month} {payrollData.year}
            </p>
          </div>
        </div>

        {/* Employee Summary */}
        <div className="grid grid-cols-2 gap-8 mb-8 border border-gray-200 rounded-xl p-5 bg-gray-50 shadow-sm">
          <div>
            <table className="w-full text-sm">
              <tbody>
                <tr>
                  <td className="py-1.5 font-semibold text-gray-600 w-1/3">Employee Name:</td>
                  <td className="py-1.5 font-medium text-gray-900">{payrollData.employeeName}</td>
                </tr>
                <tr>
                  <td className="py-1.5 font-semibold text-gray-600">Employee ID:</td>
                  <td className="py-1.5 font-medium text-gray-900">{payrollData.employeeId}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <table className="w-full text-sm">
              <tbody>
                <tr>
                  <td className="py-1.5 font-semibold text-gray-600 w-1/3">Approval :</td>
                  <td className="py-1.5 font-medium text-gray-900">
                    <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-bold uppercase tracking-wide">
                      {payrollData.status}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-1.5 font-semibold text-gray-600">Generated At:</td>
                  <td className="py-1.5 font-medium text-gray-900">{payrollData.generatedAt}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Earnings & Deductions Table */}
        <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-8 mb-8">
          {/* Earnings */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-primary-50 px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800">Earnings</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 bg-gray-50 border-b border-gray-200">
                  <th className="py-2.5 px-4 font-semibold uppercase tracking-wider text-xs">Description</th>
                  <th className="py-2.5 px-4 font-semibold uppercase tracking-wider text-xs text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="py-3 px-4 text-gray-700 font-medium">Basic Salary</td>
                  <td className="py-3 px-4 text-right font-semibold text-gray-900">
                    {formatCurrency(payrollData.baseSalary)}
                  </td>
                </tr>
                {Number(payrollData.overtimePay) > 0 && (
                  <tr>
                    <td className="py-3 px-4 text-gray-700 font-medium">
                      Overtime Pay <span className="text-xs text-gray-400 font-normal">({payrollData.approvedOvertimeHours} hrs)</span>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-gray-900">
                      {formatCurrency(payrollData.overtimePay)}
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 border-t border-gray-200">
                  <td className="py-3 px-4 font-bold text-gray-800">Total Earnings</td>
                  <td className="py-3 px-4 text-right font-bold text-green-600 text-base">
                    {formatCurrency(Number(payrollData.baseSalary) + Number(payrollData.overtimePay))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Deductions */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-red-50 px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800">Deductions</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 bg-gray-50 border-b border-gray-200">
                  <th className="py-2.5 px-4 font-semibold uppercase tracking-wider text-xs">Description</th>
                  <th className="py-2.5 px-4 font-semibold uppercase tracking-wider text-xs text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="py-3 px-4 text-gray-700 font-medium">
                    Unpaid Leave Deduction <span className="text-xs text-gray-400 font-normal">({payrollData.absentDays} days)</span>
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-gray-900">
                    {formatCurrency(payrollData.unpaidDeduction)}
                  </td>
                </tr>
              </tbody>
              <tfoot className="mt-auto">
                <tr className="bg-gray-50 border-t border-gray-200 h-full">
                  <td className="py-3 px-4 font-bold text-gray-800">Total Deductions</td>
                  <td className="py-3 px-4 text-right font-bold text-red-500 text-base">
                    {formatCurrency(payrollData.unpaidDeduction)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Net Pay */}
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-6 flex flex-col md:flex-row print:flex-row justify-between items-center border border-primary-200 shadow-sm">
          <div>
            <h3 className="text-xl font-bold text-primary-800">Net Salary Payable</h3>
            <p className="text-sm text-primary-600 mt-1 font-medium">
              After all deductions and additions
            </p>
          </div>
          <div className="text-right mt-4 md:mt-0 print:mt-0">
            <h2 className="text-4xl font-black text-primary-700 tracking-tight">
              {formatCurrency(payrollData.amount)}
            </h2>
          </div>
        </div>

      </div>

      <div className="flex justify-end gap-4 mt-6 pt-5 border-t border-gray-200 print-hidden">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-white font-semibold transition hover:bg-indigo-700 shadow-md hover:shadow-lg"
        >
          <FaPrint />
          Print Payslip
        </button>
        <button
          onClick={() => setOpen(false)}
          className="rounded-xl bg-white px-6 py-2.5 text-gray-700 font-semibold transition hover:bg-gray-50 border border-gray-300 shadow-sm"
        >
          Close
        </button>
      </div>
    </CustomModal>
  );
};

export default PayslipModal;
