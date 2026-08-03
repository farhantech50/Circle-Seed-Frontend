import React from "react";
import { FaChartPie } from "react-icons/fa";

const ProfitLoss = () => {
  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaChartPie className="text-teal-600" /> Profit & Loss Statement
          </h1>
          <p className="text-sm text-gray-500 mt-1">Financial overview of net income vs total expenses.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">P&L Summary (Current Month)</h2>
        <div className="space-y-3">
          <div className="flex justify-between text-gray-700">
            <span>Total Sales Revenue</span>
            <span className="font-medium text-green-600">BDT 19,00,000</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>Cost of Goods Sold (COGS)</span>
            <span className="font-medium text-red-500">- BDT 8,50,000</span>
          </div>
          <div className="flex justify-between text-gray-800 font-bold border-t pt-2">
            <span>Gross Profit</span>
            <span>BDT 10,50,000</span>
          </div>
          <div className="flex justify-between text-gray-700 pt-2">
            <span>Operating Expenses</span>
            <span className="font-medium text-red-500">- BDT 2,10,000</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>Payroll</span>
            <span className="font-medium text-red-500">- BDT 4,50,000</span>
          </div>
          <div className="flex justify-between text-xl text-teal-700 font-bold border-t-2 border-teal-600 pt-3 mt-3">
            <span>Net Profit</span>
            <span>BDT 3,90,000</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfitLoss;
