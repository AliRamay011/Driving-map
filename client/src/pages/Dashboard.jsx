import React, { useEffect, useState } from 'react'
import Overview from "../components/Overview";
import User from "../components/User";
import Location from "../components/Location";
import Setting from "../components/Setting";
import  LogOut from '../components/logout';
import axios from 'axios';
import UserProfile from '../components/UserProfile';
import UserSettings from '../components/UserSettings';
import UserOverview from '../components/UserOverview';

function Dashboard() {


    const [profilePic, setProfilePic] = useState("");
      
     const API_URL = import.meta.env.VITE_APP_URL ;
     useEffect(() => {
       const fetchAdmin = async () => {
         try {
           const res = await axios  .get(`${API_URL}/api/getAdmin`);
            if (res.data.admin && res.data.admin.profilePic) {
        const fullUrl = res.data.admin.profilePic.startsWith("http")
          ? res.data.admin.profilePic
          : `${API_URL}${res.data.admin.profilePic}`;
        setProfilePic(fullUrl);
      }
           else {
             console.log(res.data.message || "No admin found");
           }
         } catch (err) {
           console.error("Error fetching admin:", err);
         }
       };
       fetchAdmin();
     }, [API_URL]);

const [role, setRole] = useState("");

useEffect(() => {
  const storedRole = localStorage.getItem("role");  
  if (storedRole) setRole(storedRole);
}, []);

 const adminLinks = [
  { name:"Overview" },
  { name:"User" },
  { name:"Add Location" },
  { name:"Setting" }
];

const userLinks = [
  { name:"Overview" },
  { name:"Profile" },
  { name:"Setting" }
];

const links = role === "admin" ? adminLinks : userLinks;


  const [activePage , setActivePage] = useState("overview")
 
   const renderContent = () => {
  if(role === "admin") {
    switch(activePage) {
      case "user": return <User />;
      case "add location": return <Location />;
      case "setting": return <Setting />;
      default: return <Overview />;
    }
  } else if(role === "user") {
    switch(activePage) {
      case "profile": return <UserProfile />; 
      case "setting": return <UserSettings />;
      default: return <UserOverview />;
    }
  }
};

  return (
   <>

    <div className="flex relative bg-gray-50 h-[100vh] w-full">
         {/* Sidebar */}
         <aside className="sticky z-30 top-0 left-0 bottom-0 right-0 w-64 bg-white border-r shadow-sm">
           <div className="py-[22px] px-4 text-xl font-bold border-b">Myhighst 
              </div>
                 <ul>
                   {links.map((link , i ) =>(
                         <li key={i}
                           onClick={() => setActivePage(link.name.toLowerCase())}
                            className={`flex items-center gap-3 px-4 py-2  cursor-pointer transition ${
                   activePage === link.name.toLowerCase()
                     ? "bg-indigo-100 text-indigo-700 font-semibold"
                     : "text-gray-700 hover:bg-gray-100"
                 }`}>
                             <span>{link.name}</span>
                         </li> 
                   ))}
                   <LogOut/>
                 </ul>
         </aside>
   
         {/* Main */}
         <div className="flex-1 flex flex-col">
           <header className="sticky flex  justify-between items-center  p-5 bg-white border-b shadow-sm">
             <h1 className="text-xl font-semibold">Myhighst</h1>
             
                <div className="flex items-center rounded-full">
         <div className="relative w-[40px] h-[32px]">
<img
  src={profilePic}
  alt="logo"
  className="w-11 h-10  border rounded-full object-cover cursor-pointer"
/>

</div>

        
          </div>

          
           </header>
   
           <main className="p-6 space-y-6 overflow-y-auto" >
             {/* ............. main .......... */}
         
             {renderContent()}
          
            
           </main>
         </div>
       </div>
   </>
  )
}

export default Dashboard