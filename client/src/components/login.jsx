 import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FcGoogle } from "react-icons/fc";
import toast from "react-hot-toast";
import {  useNavigate,  } from "react-router-dom";
import { useAuth } from "./CustomLocationContext";
export default function AuthModal({ isOpen, onClose , setshowProfile , setshowButton , handleLoginSuccess}) {
  const API_URL = import.meta.env.VITE_APP_URL;
 const {isLogin , setIsLogin , setUser , setAuthInitialized  } =  useAuth() ;

  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    emailOrMobile: "",
    password: "",
  });

useEffect(() => {
  const fetchUser = async () => {
    try {
      const res = await fetch(`${API_URL}/api/me`, {
        method: "GET",
        credentials: "include", // ✅ cookies bhejna zaroori hai
      });

      if (!res.ok) {
        // 401 ya koi aur error => logged out
        setUser(null);
        return;
      }

      const data = await res.json();
      setUser(data); // ✅ user info aa gaya
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("user", JSON.stringify(data));

      
    } catch (err) {
      console.error("❌ User fetch error:", err);
      setUser(null);
    }
  };

  fetchUser();
}, []);



useEffect(() => {
  const signupStatus = new URLSearchParams(window.location.search).get("signup");

  if (signupStatus === "success") {
    navigate(window.location.pathname, { replace: true });
    setIsLogin(true); // yeh add karo 👈

    fetch(`${import.meta.env.VITE_APP_URL}/api/me`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("User fetch failed");
        return res.json();
      })
   .then((user) => {
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("isLoggedIn", "true");
  setUser(user);
  setIsLogin(true); // make sure yeh yahan bhi ho
  setshowProfile(true);
  setshowButton(false);
  handleLoginSuccess?.();

  // ✅ Auth initialize complete
  setAuthInitialized(true);

  toast.success("Signup Successful!");
})

      .catch(() => toast.error("User fetch failed!"));
  } else if (signupStatus === "error") {
    toast.error("Signup Failed!");
  }
}, []); // 👈 empty dependency rakho


  
  if (!isOpen) return null;

  // handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // handle form submit
  const handleRegister = async (e) => {
    
    e.preventDefault();
    try {
      

    const isEmail = formData.emailOrMobile.includes('@');

const requestBody = isEmail
  ? { email: formData.emailOrMobile, password: formData.password }
  : { mobile: formData.emailOrMobile, password: formData.password };

const res = await fetch(`${API_URL}/api/register`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(requestBody), // ✅ Sirf ek field jayega
});

      const data = await res.json();
      console.log("✅ Response:", data);

      if (res.ok) {
        toast.success("Signup successful!");

      } else {
        alert(data.error || "Something went wrong!");
      }
    } catch (err) {
      console.error("❌ Error:", err);
    }
  };
  const handleLogin = async (e) => {
    
    e.preventDefault();
    try {
      const url =`${API_URL}/api/login`;

    const isEmail = formData.emailOrMobile.includes('@');

const requestBody = isEmail
  ? { email: formData.emailOrMobile, password: formData.password }
  : { mobile: formData.emailOrMobile, password: formData.password };

const res = await fetch(url, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(requestBody), // ✅ Sirf ek field jayega
});

      const data = await res.json();
      console.log("✅ Response:", data);

      if (res.ok) {
        toast.success("Login successful!");
        onClose();
        setshowProfile(true)
        setshowButton(false)
          localStorage.setItem("isLoggedIn", "true");

      } else {
        toast.error(data.error || "Something went wrong!");
      }
    } catch (err) {
      console.error("❌ Error:", err);
    }
  };
  


  // handle Google signup/login
  const handleGoogleSignup = () => {
    window.location.href = `${API_URL}/api/google`;
  
   
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
      <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl w-[420px] max-w-[95%] p-8 relative animate-fadeIn">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl transition"
        >
          &times;
        </button>

        {/* Title */}
        <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-6 tracking-wide">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h2>

        {/* Google Signup button */}
        {!isLogin && (
          <>
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-3 mb-5 border-gray-300 bg-white shadow-md hover:shadow-lg transition-all py-3 rounded-full"
              onClick={handleGoogleSignup}
            >
              <FcGoogle size={26} />
              Sign up with Google
            </Button>
            <div className="text-center text-gray-500 text-sm mb-5">
              or continue with email / mobile
            </div>
          </>
        )}

        {/* Form */}
        <form className="space-y-5">
          <div className="space-y-1">
            <Label className="font-medium text-gray-700">
              Email or Mobile Number
            </Label>
            <Input
              type="text"
              name="emailOrMobile"
              value={formData.emailOrMobile}
              onChange={handleChange}
              placeholder="Email and Phone Number"
              className="border-gray-300 focus:ring-blue-500 focus:border-blue-500  px-5 py-3 shadow-sm transition-all hover:shadow-md"
            />
          </div>

          <div className="space-y-1">
            <Label className="font-medium text-gray-700">Password</Label>
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="border-gray-300 focus:ring-blue-500 focus:border-blue-500  px-5 py-3 shadow-sm transition-all hover:shadow-md"
            />
          </div>

          <Button
            onClick={isLogin ? handleLogin : handleRegister}
            className={`w-full py-3 rounded-full text-white font-semibold transition-all ${
              isLogin
                ? "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
                : "bg-gradient-to-r from-green-500 to-green-400 hover:from-green-600 hover:to-green-500"
            }`}
          >
            {isLogin ? "Login" : "Sign Up"}
          </Button>
        </form>

        {/* Toggle link */}
        <div className="text-center mt-6 text-sm text-gray-500">
          {isLogin ? "New here?" : "Already have an account?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 font-medium hover:underline"
          >
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </div>
       
  

      </div>
    </div>
  );
}
