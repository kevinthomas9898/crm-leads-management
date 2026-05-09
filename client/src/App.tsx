import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { lazy, Suspense } from "react";

import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import RegisterPage from "./pages/RegisterPage";

import GlobalSearch from "./components/GlobalSearch";
import Navbar from "./components/Navbar";

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
              <div className="min-h-screen bg-gray-100 p-6 pt-24">
                <div className="max-w-7xl mx-auto">
                  <h1 className="text-3xl font-bold mb-6">
                    CRM Leads
                    Management
                  </h1>

                  <GlobalSearch />

                  <Suspense
                    fallback={
                      <h2>
                        Loading...
                      </h2>
                    }
                  >
                    <LeadsPage />
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