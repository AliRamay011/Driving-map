import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_APP_URL;

const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const response = await fetch(`${API_URL}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password  }), // role yaha bhejne ki zarurat nahi
    });

    const result = await response.json();

    if (response.ok) {
      
      localStorage.setItem("token", result.token);
      localStorage.setItem("role", result.role);

      if (result.role === "admin") {
        navigate("/dashboard");
        toast.success("Admin login successful!");
      }  else if (result.role === "user") {
  navigate("/dashboard");
  toast.success("User login successful!");
}
    } else {
      toast.error(result.msg || "Invalid Credentials");
    }
  } catch (err) {
    toast.error("Login error");
    console.log(err);
  }
};


  return (
    <div className="flex justify-center  items-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      <Card className="w-full max-w-md shadow-2xl border border-gray-700 bg-gray-900">
        <CardHeader className="text-center">
          <CardTitle className="text-white text-2xl font-bold">
            Welcome Back 👋
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-2">
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div className="space-y-1">
              <Label htmlFor="email" className="text-white font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-800 text-white border-gray-600 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <Label htmlFor="password" className="text-white font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-800 text-white border-gray-600 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 mt-4">
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
