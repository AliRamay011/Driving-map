import React from "react";
import './index.css';
import { Toaster } from 'react-hot-toast';
import { Routes, Route, BrowserRouter } from 'react-router-dom';

import Map from "./components/MyMap";
import BottomPlaceCard from "./components/BottomPlaceCard";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";

function App() {
  return ( 
    <>
    <Toaster
  position="top-right"
  reverseOrder={false}
  toastOptions={{
    // Default styles for all toasts
    style: {
      borderRadius: '12px',
      background: '#333',
      color: '#fff',
      padding: '16px 24px',
      boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
      fontWeight: '500',
      animationDelay: '4s' ,
      fontSize: '15px',
    },
    success: {
      iconTheme: {
        primary: '#4ade80', // green
        secondary: '#fff',
      },
      style: {
        background: '#22c55e', // Tailwind green-500
        color: '#fff',
      },
    },
    error: {
      iconTheme: {
        primary: '#f87171', // red
        secondary: '#fff',
      },
      style: {
        background: '#ef4444', // Tailwind red-500
        color: '#fff',
      },
    },
  }}
/>

    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={
            <>
              <Map /> 
              <BottomPlaceCard />
            </>
          } 
        />
        <Route path="/login" element={<Login/>} />
        <Route path="/dashboard" element={<Dashboard />}  />
      </Routes>
    </BrowserRouter>
    </>
  );
}

export default App;
