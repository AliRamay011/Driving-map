// App.jsx
import React from "react";
import './index.css';
import { Toaster } from 'react-hot-toast';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { CustomLocationProvider } from "./components/CustomLocationContext"; // ✅ import context provider
import Map from "./components/MyMap";
import BottomPlaceCard from "./components/BottomPlaceCard";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";


function App() {


  return ( 
    <CustomLocationProvider>
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          style: {
            borderRadius: '12px',
            background: '#333',
            color: '#fff',
            padding: '16px 24px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
            fontWeight: '500',
            animationDelay: '4s',
            fontSize: '15px',
          },
          success: {
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
            style: {
              background: '#22c55e',
              color: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#f87171',
              secondary: '#fff',
            },
            style: {
              background: '#ef4444',
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
         <Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
       <Dashboard /> 
    </ProtectedRoute>
  } 
/>



          
        </Routes>
      </BrowserRouter>
    </CustomLocationProvider>
  );
}

export default App;
