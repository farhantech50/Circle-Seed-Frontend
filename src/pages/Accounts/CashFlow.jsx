import React from "react";
import { FaWater } from "react-icons/fa";

const CashFlow = () => {
  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaWater className="text-teal-600" /> Cash Flow Analysis
          </h1>
          <p className="text-sm text-gray-500 mt-1">Monitor liquidity and cash reserves over time.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Cash Flow Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-teal-50 p-4 rounded-lg border border-teal-100 text-center">
            <p className="text-teal-800 text-sm font-semibold">Cash Inflow</p>
            <p className="text-2xl font-bold text-teal-900 mt-1">BDT 25,00,000</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-100 text-center">
            <p className="text-red-800 text-sm font-semibold">Cash Outflow</p>
            <p className="text-2xl font-bold text-red-900 mt-1">BDT 18,50,000</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-center">
            <p className="text-blue-800 text-sm font-semibold">Net Cash Flow</p>
            <p className="text-2xl font-bold text-blue-900 mt-1">BDT +6,50,000</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashFlow;
