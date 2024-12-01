import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { PortfolioProvider } from "./context/PortfolioContext";
import { ThemeProvider } from "./context/ThemeContext";
import { Auth } from "./components/Auth";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { SavingsAccount } from "./components/SavingsAccount";

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/auth" />;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  return !user ? <>{children}</> : <Navigate to="/" />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PortfolioProvider>
          <BrowserRouter>
            <Routes>
              <Route
                path="/auth"
                element={
                  <PublicRoute>
                    <Auth />
                  </PublicRoute>
                }
              />
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/cuenta-remunerada"
                element={
                  <PrivateRoute>
                    <Layout>
                      <SavingsAccount />
                    </Layout>
                  </PrivateRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </PortfolioProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
