import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { IoMdClose } from "react-icons/io";

const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
const [isMobile, setIsMobile] = useState(false);
   const [user, setUser] = useState();
  useEffect(() => {
    const isLogout = localStorage.getItem("logout");

    // Agar logout flag laga hua hai to user ko set na karo
    if (isLogout === "true") {
      setUser(null);
      return;
    }

    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (storedUser) setUser(storedUser);
    } catch (error) {
      console.error("Invalid user in localStorage", error);
    }
  }, []);


   useEffect(() => {
     const checkDevice = () => {
       const width = window.innerWidth;
       setIsMobile(width < 768); // Mobile: 0 - 767px
       // setIsTablet(width >= 768 && width < 1024); // Tablet: 768 - 1023px
     };
 
     checkDevice();
     window.addEventListener("resize", checkDevice);
 
     return () => window.removeEventListener("resize", checkDevice);
   }, []);


  // Safe parse
const handleLogout = async () => {
  try {
    await fetch(`${import.meta.env.VITE_APP_URL}/api/logout`, {
      method: "POST",
      credentials: "include",
    });

    localStorage.clear();
    sessionStorage.clear();
    setUser(null);
    setIsOpen(false);
    toast.success("Logged out successfully!");
    window.location.reload();
  } catch (error) {
    console.error("Logout error", error);
  }
};



  if (!isMobile || !user) return null;


  return ( 
    <>
{!isMobile && (
    <>
    <div className="absolute top-[4px] right-[5px]  z-50">
      {/* Profile Icon */}
      <div
        className="cursor-pointer rounded-full p-1 transition-colors hover:bg-gray-100"
        onClick={() => setIsOpen(!isOpen)}
      >
        <img
          src=""
          alt="Profile"
          className="w-12 h-12 rounded-full border-2 border-gray-700 "
        />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-11 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          {/* Dropdown Header */}
          <div className="flex items-center p-4">
            <img
              src={user?.photoURL}
              alt="Profile"
              className="w-10 h-10 border rounded-full mr-3"
            />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 truncate">
                {user?.name || "User"} {/* ✅ Name show karo */}
              </div>
              <div className="text-sm text-gray-500 truncate">
                {user?.email}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-200"></div>

          {/* Logout Option */}
          <div
            className="flex items-center px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={handleLogout}
          >
            <span className="text-lg mr-3">⎋</span>
            <span className="text-gray-700">Logout</span>
          </div>
        </div>
      )}
    </div>
    </>
    )}
{isMobile && (
    <>
    <div className="fixed top-[19px] right-[15px]  z-50">
      {/* Profile Icon */}
      <div
        className="cursor-pointer rounded-full p-1 "
        onClick={() => setIsOpen(!isOpen)}
      >
        <img
          src={user.photoURL}
          alt="Profile"
          className="w-10 h-10 rounded-full "
        />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="fixed right-0 top-0 w-72 bg-white bottom-0 shadow-xl border border-gray-200 z-50">
                <IoMdClose className="flex float-end size-10 " onClick={() => setIsOpen(false)}/>
          <div className="flex items-center p-4">
            <img
              src={user?.photoURL}
              alt="Profile"
              className="w-10 h-10 border rounded-full mr-3"
            />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 truncate">
                {user?.name || "User"} {/* ✅ Name show karo */}
              </div>
              <div className="text-sm text-gray-500 truncate">
                {user?.email}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-200"></div>

          {/* Logout Option */}
          <div
            className="flex fixed bottom-0 border-t-2 w-full items-center px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={handleLogout}
          >
            <span className="text-lg mr-3">⎋</span>
            <span className="text-gray-700">Logout</span>
          </div>
        </div>
      )}
    </div>
    </>
    )}

    </>
  );
};

export default ProfileDropdown;
