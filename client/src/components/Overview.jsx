import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Building2, MapPin, Settings, User } from "lucide-react";
import axios from "axios";

function Overview() {


  const [users, setUsers] = useState([]);
  const [profilePic, setProfilePic] = useState("");
    
   const API_URL = import.meta.env.VITE_APP_URL ;
   useEffect(() => {
     const fetchAdmin = async () => {
       try {
         const res = await axios.get(`${API_URL}/api/getAdmin`);
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

  useEffect(() => {
    // API se users fetch karo
    axios.get(`${API_URL}/api/userGet`)
      .then((res) => setUsers(res.data))
      .catch((err) => console.error("Error fetching users:", err));
  }, []);

  const stats = [
    { title: "Total Users", value: users.length, icon: <Users className="w-6 h-6 text-indigo-600" /> },
    { title: "Companies", value: "320", icon: <Building2 className="w-6 h-6 text-green-600" /> },
    { title: "Locations", value: "78", icon: <MapPin className="w-6 h-6 text-red-600" /> },
    { title: "Settings Configured", value: "12", icon: <Settings className="w-6 h-6 text-yellow-600" /> },
  ];
  return (
    <div className="p-6 space-y-6">
      {/* Welcome Admin Card */}
      <Card className="shadow-md rounded-2xl border border-gray-200 bg-white">
        <CardContent className="flex items-center gap-4 p-6">
             <div className="flex items-center gap-6 mb-4 ">
         <div className="relative w-20 h-20">
<img
  src={profilePic}
  alt="logo"
  className="w-20 h-20 border  rounded-full object-cover cursor-pointer"
/>

</div>

        
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Welcome Back, Admin 👋</h2>
            <p className="text-sm text-gray-500">Here’s what’s happening with your dashboard today.</p>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((item, i) => (
          <Card key={i} className="shadow-md rounded-2xl border border-gray-200 bg-white">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 bg-gray-100 rounded-full">{item.icon}</div>
              <div>
                <p className="text-gray-500 text-sm">{item.title}</p>
                <h2 className="text-xl font-bold text-gray-800">{item.value}</h2>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
    <div className="bg-white shadow-md rounded-2xl p-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">Recent Activity</h2>
      <table className="w-full text-sm text-left border-collapse">
        <thead>
          <tr className="bg-gray-100 text-gray-700">
            <th className="px-4 py-2">User</th>
            <th className="px-4 py-2">email</th>
            <th className="px-4 py-2">Phone</th>
          </tr>
        </thead>
        <tbody className="text-gray-600">
          {users.length > 0 ? (
            users.map((u) => (
              <tr key={u.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2 font-medium">{u.name}</td>
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2">{u.phone}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="text-center py-4 text-gray-400">
                No recent activity found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
    </div>
  );
}

export default Overview;
