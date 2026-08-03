import React from "react";
import { FaMapMarkedAlt } from "react-icons/fa";

const LiveMap = () => {
  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaMapMarkedAlt className="text-teal-600" /> Live Agent Tracking
          </h1>
          <p className="text-sm text-gray-500 mt-1">Real-time GPS tracking of field marketing executives.</p>
        </div>
      </div>
      
      <div className="w-full h-[600px] bg-gray-200 rounded-lg border border-gray-300 flex items-center justify-center flex-col">
        <FaMapMarkedAlt className="text-6xl text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-600">Map Integration Pending</h2>
        <p className="text-gray-500 max-w-md text-center mt-2">
          Google Maps or Mapbox API integration is required to view live locations. This section will plot active agents on the map based on their mobile app GPS signals.
        </p>
      </div>
    </div>
  );
};

export default LiveMap;
