// src/components/UserOverview.jsx
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function UserOverview() {
  // Dummy stats
  const stats = [
    { title: "Total Trips", value: 24 },
    { title: "Completed Reports", value: 12 },
    { title: "Pending Reports", value: 3 },
    { title: "Profile Completeness", value: "85%" },
  ];

  const recentActivities = [
    { activity: "Reported traffic jam on Main Street", time: "2 hours ago" },
    { activity: "Added favorite location: City Park", time: "1 day ago" },
    { activity: "Updated profile information", time: "3 days ago" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="shadow-sm border border-gray-200">
            <CardContent className="p-4">
              <h3 className="text-gray-500 text-sm">{stat.title}</h3>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentActivities.map((act, i) => (
            <div key={i} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <p className="text-gray-700">{act.activity}</p>
              <span className="text-gray-400 text-xs">{act.time}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
