/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from "react";
import axios from "axios";

// 1️⃣ Context create karo
export const CustomLocationContext = createContext();

// 2️⃣ Provider component
export const CustomLocationProvider = ({ children }) => {
  const [customLocations, setCustomLocations] = useState([]);
  const API_URL = import.meta.env.VITE_APP_URL;

  // 3️⃣ Fetch locations function
  const fetchCustomLocations = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/locations`);
    //   console.log("Fetched locations:", res.data);
      setCustomLocations(res.data.data || []);
    } catch (err) {
      console.error("Error fetching locations:", err);
    }
  };

  // 4️⃣ Add new location function (important for instant update)
  const addCustomLocation = (loc) => {
    setCustomLocations((prev) => [...prev, loc]); // ✅ new array reference
  };

  // 5️⃣ Initial fetch
  useEffect(() => {
    // console.log("Fetching custom locations on mount...");
    fetchCustomLocations();
  }, []);

  // 6️⃣ Provide context value
  return (
    <CustomLocationContext.Provider
      value={{ customLocations, fetchCustomLocations, addCustomLocation }}
    >
      {children}
    </CustomLocationContext.Provider>
  );
};
