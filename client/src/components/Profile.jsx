// AdminProfile.jsx
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Camera, Trash2 } from "lucide-react";

export default function AdminProfile() {
  const [avatar, setAvatar] = useState(null);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(URL.createObjectURL(file));
    }
  };

  const removeAvatar = () => {
    setAvatar(null);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card className="shadow-md rounded-2xl border border-gray-200 bg-white">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Admin Profile</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={avatar || "https://via.placeholder.com/150"} />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>

            <div className="space-x-2">
              <Label
                htmlFor="avatar-upload"
                className="cursor-pointer inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Camera className="mr-2 h-4 w-4" /> Change
              </Label>
              <input
                id="avatar-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleAvatarChange}
              />
              {avatar && (
                <Button
                  variant="outline"
                  className="inline-flex items-center"
                  onClick={removeAvatar}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Remove
                </Button>
              )}
            </div>
          </div>

          <Separator />

          {/* Profile Info */}
          <div className="grid gap-4">
            <div>
              <Label>Name</Label>
              <Input placeholder="Admin Name" />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" placeholder="admin@example.com" />
            </div>
            <div>
              <Label>Phone</Label>
              <Input placeholder="+92 300 1234567" />
            </div>
          </div>

          <Separator />

          {/* Password */}
          <div className="grid gap-4">
            <div>
              <Label>New Password</Label>
              <Input type="password" placeholder="********" />
            </div>
            <div>
              <Label>Confirm Password</Label>
              <Input type="password" placeholder="********" />
            </div>
          </div>

          <Button className="w-full mt-4">Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  );
}
