import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function Settings() {
  const [formData, setFormData] = useState({
    id: "",
    email: "",
    password: "", 
    newPassword: "",
    confirmPassword: "",
  });

  const [profilePic, setProfilePic] = useState("");
   
  const API_URL = import.meta.env.VITE_APP_URL ;
useEffect(() => {
  const fetchAdmin = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/getAdmin`);
      if (res.data.admin) {
        setFormData((prev) => ({
          ...prev,
          id: res.data.admin.id,
          email: res.data.admin.email,
        }));

        // ✅ Profile pic full URL handling
        if(res.data.admin.profilePic) {
          const fullUrl = res.data.admin.profilePic.startsWith("http")
            ? res.data.admin.profilePic
            : `${API_URL}${res.data.admin.profilePic}`;
          setProfilePic(fullUrl);
        }

      } else {
        alert(res.data.message || "No admin found");
      }
    } catch (err) {
      console.error("Error fetching admin:", err);
    }
  };
  fetchAdmin();
}, [API_URL]);


  const handleRemovePic = async (id) => {
  try {
    const res = await axios.delete(`${API_URL}/api/admin/DeleteProfile/${id}`);
    if (res.data.success) {
      setProfilePic(""); // remove from frontend
      toast.success("Profile picture removed!");
    }
  } catch (err) {
    console.error(err);
    toast.error("Failed to remove profile picture");
  }
};

 const handlePicChange = async (e) => {
  const file = e.target.files[0];
  console.log(file);
  
  if (!file) return;

  const form = new FormData();
  form.append("profile", file);
  form.append("adminId", formData.id); // backend ko kaunsa admin hai

  try {
    const res = await axios.post(`${API_URL}/api/admin/profile`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
const fullUrl = res.data.filePath.startsWith("http")
  ? res.data.filePath
  : `${API_URL}${res.data.filePath}`;
setProfilePic(fullUrl);
console.log(fullUrl);

 // backend se jo path aaya
    toast.success("Profile picture updated!");
  } catch (err) {
    console.error(err);
    toast.error("Upload failed");
  }
};


  const UpdateSave = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      return alert("New password and confirm password do not match");
    }

    try {
      const res = await fetch(`${API_URL}/api/updateAdmin`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          currentPassword: formData.password,
          newPassword: formData.newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Account updated successfully!");
        setFormData({
          email: "",
          password: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch (err) {
      console.error("Error in update:", err);
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-muted/10">
      {/* Full Width Card */}
      <Card className="shadow-md border border-muted/30 w-full rounded-none">
        <CardHeader className="border-b p-6 bg-muted/20">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Mail size={22} className="text-primary" /> Account Settings
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Update your account details below.
          </p>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Profile Pic */}
      <div className="flex items-center gap-6 mb-4">
  <div className="relative w-20 h-20">
    <img
      src={profilePic}
      alt="Admin"
      className="w-20 h-20 border border-gray mx-auto my-auto  rounded-full object-cover cursor-pointer"
      onClick={() => document.getElementById("profileInput").click()}
    />
    <input
      type="file"
      id="profileInput"
      className="hidden"
      onChange={handlePicChange}
    />
    {profilePic && (
      <button
        className="absolute -bottom-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs"
        onClick={handleRemovePic}
      >
        ✕
      </button>
    )}
  </div>

  <div className="flex flex-col gap-1">
    <p className="text-gray-700 font-medium">Change Profile Picture</p>
    <p className="text-gray-500 text-sm">Click on the icon to upload</p>
  </div>
</div>


          {/* Email */}
          <div>
            <Label>Email</Label>
            <Input 
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              type="email"
              placeholder="you@example.com"
              className="w-full"
            />
          </div>

          {/* Password Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Lock size={18} className="text-primary" /> Change Password
            </h3>

            <div>
              <Label>Current Password</Label>
              <Input 
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                type="password"
                placeholder="••••••••"
                className="w-full"
              />
            </div>
            <div>
              <Label>New Password</Label>
              <Input   
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                type="password"
                placeholder="Enter new password"
                className="w-full"
              />
            </div>
            <div>
              <Label>Confirm New Password</Label>
              <Input
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData , confirmPassword:e.target.value})}
                type="password"
                placeholder="Confirm new password"
                className="w-full"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button onClick={() => UpdateSave()} className="px-6">Save Changes</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
