import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { lazy, Suspense, useState } from "react";

import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import RegisterPage from "./pages/RegisterPage";

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

  const handleLeadSelect = (lead: Lead) => {
    setSelectedLead(lead);
  };

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

                  <Suspense
                    fallback={
                      <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    }
                  >
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