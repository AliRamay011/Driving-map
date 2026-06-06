// src/components/UserProfile.jsx
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function UserProfile() {
  // Dummy user data
  const user = {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 234 567 890",
    dob: "1990-05-15",
    gender: "Male",
    profilePic: "https://via.placeholder.com/150",
  };

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <Card className="shadow-lg border border-gray-200">
        <CardHeader className="flex items-center gap-6 p-6 border-b">
          <Avatar className="w-24 h-24">
            <AvatarImage src={user.profilePic} />
            <AvatarFallback>{user.name?.[0]}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl font-bold">{user.name}</CardTitle>
            <p className="text-gray-500">{user.email}</p>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6">
          <div>
            <Label>Name</Label>
            <Input value={user.name} readOnly className="bg-gray-100" />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={user.email} readOnly className="bg-gray-100" />
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={user.phone} readOnly className="bg-gray-100" />
          </div>
          <div>
            <Label>Date of Birth</Label>
            <Input value={user.dob} readOnly className="bg-gray-100" />
          </div>
          <div>
            <Label>Gender</Label>
            <Input value={user.gender} readOnly className="bg-gray-100" />
          </div>
        </CardContent>
        <div className="flex justify-end p-6 border-t">
          <Button className="bg-blue-600 hover:bg-blue-700">Edit Profile</Button>
        </div>
      </Card>
    </div>
  );
}
