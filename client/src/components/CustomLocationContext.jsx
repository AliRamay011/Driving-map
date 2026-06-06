/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
} from "react";
import axios from "axios";

// 1️⃣ Context create karo
export const CustomLocationContext = createContext();

// 2️⃣ Provider component
export const CustomLocationProvider = ({ children }) => {
  const [customLocations, setCustomLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPopup, setShowPopUp] = useState(false);
const [isLogin, setIsLogin] = useState(
  localStorage.getItem("isLoggedIn") === "true"
);
const [user, setUser] = useState(
  JSON.parse(localStorage.getItem("user")) || null
);
 const [authInitialized, setAuthInitialized] = useState(false);


  const API_URL = import.meta.env.VITE_APP_URL;

  // 3️⃣ Fetch locations function
  const fetchCustomLocations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_URL}/api/locations`);

      // Map data properly for autocomplete
      const customPlaces = (res.data?.data || []).map((place) => ({
        ...place,
        type: "custom", // mark as custom
        description: place.name, // name used in suggestions
        keywords: place.keywords, // keywords available
      }));

      setCustomLocations(customPlaces);
    } catch (err) {
      console.error("Error fetching locations:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 4️⃣ Add new location function
  const addCustomLocation = async (loc) => {
    try {
      // Backend me POST request bhejna (agar backend available hai)
      const res = await axios.post(`${API_URL}/api/locations`, loc);
      const newLocation = res.data?.data || res.data || loc;

      // Frontend state update
      setCustomLocations((prev) => [newLocation, ...prev]);
    } catch (err) {
      console.error("Error adding location:", err);
      setError(err);
    }
  };

  // 5️⃣ Initial fetch on mount
  useEffect(() => {
    fetchCustomLocations();
  }, [fetchCustomLocations]);

  // 6️⃣ Provide context value
  return (
    <CustomLocationContext.Provider
      value={{
        customLocations,
        fetchCustomLocations,
        addCustomLocation,
        loading,
        error,
        showPopup,
        setShowPopUp,
        isLogin,
setIsLogin,
user,
setUser,
setAuthInitialized ,
authInitialized

      }}
    >
      {children}
    </CustomLocationContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(CustomLocationContext);
  if (!context) {
    throw new Error("useAuth must be used within CustomLocationProvider");
  }
  return context;
};
