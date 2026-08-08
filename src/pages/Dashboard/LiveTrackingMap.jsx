import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { io } from "socket.io-client";
import api from "../../config/api";
import L from "leaflet";

import { renderToString } from "react-dom/server";
const createCustomIcon = (loc) => {
  const name = loc.user?.fullName || `User ${loc.userId}`;
  const employeeId = loc.user?.employeeId || `ID: ${loc.userId}`;

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const iconHtml = renderToString(
    <div className="flex flex-col items-center pointer-events-none">
      {/* Card */}
      <div className="flex items-center gap-2 bg-white rounded-lg shadow-md border border-gray-200 px-2 py-1">
        {/* Avatar */}
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-[10px] font-bold shrink-0">
          {initials}
        </div>

        {/* Info */}
        <div className="leading-tight max-w-[85px]">
          <div className="text-[10px] font-semibold text-gray-800 truncate">
            {name}
          </div>
          <div className="text-[9px] text-gray-500 truncate">{employeeId}</div>
        </div>
      </div>

      {/* Pointer */}
      <div className="w-2.5 h-2.5 bg-white border-r border-b border-gray-200 rotate-45 -mt-1"></div>

      {/* Dot */}
      <div className="w-2 h-2 rounded-full bg-blue-600 -mt-1"></div>
    </div>,
  );

  return L.divIcon({
    html: iconHtml,
    className: "",
    iconSize: [110, 42],
    iconAnchor: [55, 42],
    popupAnchor: [0, -42],
  });
};

const LiveTrackingMap = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem(import.meta.env.VITE_ACCESS_TOKEN_KEY);

  useEffect(() => {
    // 1. Fetch initial active locations
    const fetchLocations = async () => {
      try {
        const response = await api.get("/api/dashboard/active-locations");
        setLocations(response.data);
      } catch (error) {
        console.error("Error fetching locations", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();

    // 2. Setup Socket.IO connection
    const socket = io(import.meta.env.VITE_BASE_URL, {
      auth: { token },
      secure: true,
      rejectUnauthorized: false, // since using self-signed certs locally
    });

    socket.on("connect", () => {
      console.log("Connected to Live Tracking Socket");
      socket.emit("joinAdminRoom");
    });

    socket.on("userLocationUpdated", (data) => {
      setLocations((prevLocations) => {
        const existingIndex = prevLocations.findIndex(
          (loc) => loc.userId === data.userId,
        );

        const updatedLocation = {
          userId: data.userId,
          lat: data.lat,
          lng: data.lng,
          updatedAt: data.timestamp,
          user: {
            fullName: data.name,
            // Keep existing role if available, otherwise fallback
            role: prevLocations[existingIndex]?.user?.role || {
              value: "Employee",
            },
          },
        };

        if (existingIndex !== -1) {
          // Update existing user
          const newLocations = [...prevLocations];
          newLocations[existingIndex] = {
            ...newLocations[existingIndex],
            ...updatedLocation,
          };
          return newLocations;
        } else {
          // Add new user
          return [...prevLocations, updatedLocation];
        }
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-xl font-semibold text-gray-600">
          Loading Map...
        </div>
      </div>
    );
  }

  // Default to Dhaka if no locations
  const defaultCenter =
    locations.length > 0 && locations[0].lat && locations[0].lng
      ? [locations[0].lat, locations[0].lng]
      : [23.8103, 90.4125];

  return (
    <div className="p-4 w-full h-[75vh] min-h-[500px] flex flex-col">
      <div className="mb-4 flex items-center justify-between shrink-0">
        <h1 className="text-2xl font-bold text-gray-800">
          Live Field Tracking
        </h1>
        <div className="text-sm text-gray-500">
          Tracking {locations.length} active employee
          {locations.length !== 1 ? "s" : ""}
        </div>
      </div>

      <div className="w-full flex-grow rounded-lg border border-gray-200 shadow-sm overflow-hidden z-0 relative">
        <MapContainer
          center={defaultCenter}
          zoom={12}
          className="h-full w-full absolute top-0 left-0"
          style={{ zIndex: 0 }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {locations.map((loc) => {
            if (!loc.lat || !loc.lng) return null;
            return (
              <Marker
                key={loc.userId}
                position={[loc.lat, loc.lng]}
                icon={createCustomIcon(loc)}
              >
                <Popup>
                  <div className="text-center">
                    <p className="font-bold text-gray-900 m-0 leading-tight">
                      {loc.user?.fullName || `User ${loc.userId}`}
                    </p>
                    <p className="text-xs text-gray-500 m-0 mt-1">
                      {loc.user?.role?.value || "Employee"}
                    </p>
                    <p className="text-[10px] text-gray-400 m-0 mt-2">
                      Last Updated:{" "}
                      {new Date(loc.updatedAt).toLocaleTimeString()}
                    </p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};

export default LiveTrackingMap;
