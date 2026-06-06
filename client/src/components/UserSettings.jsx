// src/components/UserSettings.jsx
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import toast from "react-hot-toast";

export default function UserSettings() {
  // Dummy user data
  const [userData, setUserData] = useState({
    name: "Jane Doe",
    email: "jane.doe@example.com",
    phone: "+1 987 654 321",
    dob: "1992-08-25",
    gender: "Female",
    profilePic: "https://via.placeholder.com/150",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handlePicChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setUserData({ ...userData, profilePic: url });
    toast.success("Profile picture updated!");
  };

  const handleSave = () => {
    if (userData.newPassword !== userData.confirmPassword) {
      return toast.error("New password and confirm password do not match!");
    }
    toast.success("User settings updated!");
    // Here you would call your backend API
  };

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <Card className="shadow-lg border border-gray-200">
        <CardHeader className="flex items-center gap-6 p-6 border-b">
          <Avatar className="w-24 h-24 cursor-pointer">
            <AvatarImage src={userData.profilePic} />
            <AvatarFallback>{userData.name?.[0]}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl font-bold">{userData.name}</CardTitle>
            <p className="text-gray-500">{userData.email}</p>
            <input
              type="file"
              onChange={handlePicChange}
              className="hidden"
              id="profileInput"
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-6 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <Input
                value={userData.name}
                onChange={(e) => setUserData({ ...userData, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                value={userData.email}
                onChange={(e) => setUserData({ ...userData, email: e.target.value })}
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={userData.phone}
                onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
              />
            </div>
            <div>
              <Label>Date of Birth</Label>
              <Input
                value={userData.dob}
                onChange={(e) => setUserData({ ...userData, dob: e.target.value })}
              />
            </div>
            <div>
              <Label>Gender</Label>
              <Input
                value={userData.gender}
                onChange={(e) => setUserData({ ...userData, gender: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Change Password</h3>
            <Input
              type="password"
              placeholder="Current Password"
              value={userData.currentPassword}
              onChange={(e) => setUserData({ ...userData, currentPassword: e.target.value })}
            />
            <Input
              type="password"
              placeholder="New Password"
              value={userData.newPassword}
              onChange={(e) => setUserData({ ...userData, newPassword: e.target.value })}
            />
            <Input
              type="password"
              placeholder="Confirm New Password"
              value={userData.confirmPassword}
              onChange={(e) => setUserData({ ...userData, confirmPassword: e.target.value })}
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
