import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Building2, MapPin, Settings } from "lucide-react";

function Overview() {
  const stats = [
    { title: "Total Users", value: "1,245", icon: <Users className="w-6 h-6 text-indigo-600" /> },
    { title: "Companies", value: "320", icon: <Building2 className="w-6 h-6 text-green-600" /> },
    { title: "Locations", value: "78", icon: <MapPin className="w-6 h-6 text-red-600" /> },
    { title: "Settings Configured", value: "12", icon: <Settings className="w-6 h-6 text-yellow-600" /> },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((item, i) => (
          <Card key={i} className="shadow-md rounded-2xl border border-gray-200">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 bg-gray-100 rounded-full">{item.icon}</div>
              <div>
                <p className="text-gray-500 text-sm">{item.title}</p>
                <h2 className="text-xl font-bold">{item.value}</h2>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity (dummy table) */}
      <div className="bg-white shadow-md rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2">User</th>
              <th className="px-4 py-2">Action</th>
              <th className="px-4 py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="px-4 py-2">Ali</td>
              <td className="px-4 py-2">Added a new location</td>
              <td className="px-4 py-2">Aug 18, 2025</td>
            </tr>
            <tr className="border-t">
              <td className="px-4 py-2">Hasan</td>
              <td className="px-4 py-2">Updated company profile</td>
              <td className="px-4 py-2">Aug 16, 2025</td>
            </tr>
            <tr className="border-t">
              <td className="px-4 py-2">Sara</td>
              <td className="px-4 py-2">Created a new user</td>
              <td className="px-4 py-2">Aug 14, 2025</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Overview;
