import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { lazy, Suspense, useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Analytics } from "@vercel/analytics/react";

import ServerWakingUp from "./components/ServerWakingUp";

import GlobalSearch from "./components/GlobalSearch";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import type { Lead } from "./types/lead";

const LeadsPage = lazy(
  () => import("./pages/LeadsPage")
);

const UsersPage = lazy(
  () => import("./pages/UsersPage")
);

const RolesPage = lazy(
  () => import("./pages/RolesPage")
);

const LoginPage = lazy(
  () => import("./pages/LoginPage")
);

const RegisterPage = lazy(
  () => import("./pages/RegisterPage")
);

const NotFoundPage = lazy(
  () => import("./pages/NotFoundPage")
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
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="dark"
        toastClassName="!bg-gray-800 !text-white !rounded-lg !shadow-lg !border !border-gray-700"
        progressClassName="!bg-blue-500"
      />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:font-medium"
      >
        Skip to main content
      </a>
      <Navbar />
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Suspense fallback={<div>Loading...</div>}>
                <LoginPage />
              </Suspense>
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <Suspense fallback={<div>Loading...</div>}>
                <RegisterPage />
              </Suspense>
            </PublicRoute>
          }
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gradient-to-br pb-8 from-gray-50 to-gray-100 p-6 pt-28 dark:from-gray-900 dark:to-gray-800">
                <div className="max-w-7xl mx-auto">
                  <div className="mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent dark:from-gray-100 dark:to-gray-300">
                      CRM Leads Management
                    </h1>
                    <p className="text-gray-600 mt-2 dark:text-gray-400">
                      Track, manage, and convert your leads efficiently
                    </p>
                  </div>

                  <GlobalSearch onLeadSelect={handleLeadSelect} />

                  <Suspense >
                    <LeadsPage selectedLead={selectedLead} />
                  </Suspense>
                </div>
              </div>
              <Footer />
            </ProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gradient-to-br pb-8 from-gray-50 to-gray-100 p-6 pt-28 dark:from-gray-900 dark:to-gray-800">
                <div className="max-w-7xl mx-auto">
                  <Suspense fallback={<div>Loading...</div>}>
                    <UsersPage />
                  </Suspense>
                </div>
              </div>
              <Footer />
            </ProtectedRoute>
          }
        />

        <Route
          path="/roles"
          element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gradient-to-br pb-8 from-gray-50 to-gray-100 p-6 pt-28 dark:from-gray-900 dark:to-gray-800">
                <div className="max-w-7xl mx-auto">
                  <Suspense fallback={<div>Loading...</div>}>
                    <RolesPage />
                  </Suspense>
                </div>
              </div>
              <Footer />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <NotFoundPage />
            </Suspense>
          }
        />
      </Routes>
      <Analytics />
    </BrowserRouter>
  );
}

export default App;