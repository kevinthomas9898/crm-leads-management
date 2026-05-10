import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { lazy, Suspense, useState, useEffect } from "react";

import LoginPage from "./pages/LoginPage";
  import NotFoundPage from "./pages/NotFoundPage";
import RegisterPage from "./pages/RegisterPage";
import ServerWakingUp from "./components/ServerWakingUp";

import GlobalSearch from "./components/GlobalSearch";
import Navbar from "./components/Navbar";

import type { Lead } from "./types/lead";

const LeadsPage = lazy(
  () => import("./pages/LeadsPage")
);

function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const token =
    localStorage.getItem(
      "token"
    );

  if (!token) {
    return (
      <Navigate to="/login" />
    );
  }

  return children;
}

function PublicRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const token =
    localStorage.getItem(
      "token"
    );

  if (token) {
    return (
      <Navigate to="/" />
    );
  }

  return children;
}

function App() {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [serverWakingUp, setServerWakingUp] = useState(false);

  useEffect(() => {
    // Check if server was recently verified (within last 30 minutes)
    const lastChecked = sessionStorage.getItem('serverChecked');
    const THIRTY_MINUTES = 30 * 60 * 1000; // 30 minutes in milliseconds
    
    const shouldCheck = !lastChecked || (Date.now() - parseInt(lastChecked)) > THIRTY_MINUTES;
    
    if (shouldCheck) {
      // Check server health
      const checkServer = async () => {
        try {
          const baseURL = import.meta.env.DEV 
            ? "http://localhost:5000" 
            : "https://crm-leads-management-server.onrender.com";
          
          const response = await fetch(`${baseURL}/`, { 
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache'
          });
          
          if (response.ok) {
            sessionStorage.setItem('serverChecked', Date.now().toString());
          }
        } catch {
          // Server is sleeping - show waking up screen
          setServerWakingUp(true);
        }
      };

      checkServer();
    }
  }, []);

  const handleLeadSelect = (lead: Lead) => {
    setSelectedLead(lead);
  };

  const handleServerReady = () => {
    setServerWakingUp(false);
    sessionStorage.setItem('serverChecked', 'true');
  };

  // Show waking up screen only when server is actually sleeping
  if (serverWakingUp) {
    return <ServerWakingUp onServerReady={handleServerReady} />;
  }

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 pt-28">
                <div className="max-w-7xl mx-auto">
                  <div className="mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      CRM Leads Management
                    </h1>
                    <p className="text-gray-600 mt-2">
                      Track, manage, and convert your leads efficiently
                    </p>
                  </div>

                  <GlobalSearch onLeadSelect={handleLeadSelect} />

                  <Suspense >
                    <LeadsPage selectedLead={selectedLead} />
                  </Suspense>
                </div>
              </div>
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={<NotFoundPage />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;