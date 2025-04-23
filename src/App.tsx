import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import CreateUrl from "./pages/CreateUrl";
import UrlAnalytics from "./pages/UrlAnalytics";

// Protected route component that redirects to home if not signed in
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  return (
    <SignedIn>
      {children}
    </SignedIn>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <header className="p-4 bg-white shadow flex justify-between items-center">
        <h1 className="text-xl font-bold">Redirecty</h1>
        <div>
          <SignedOut>
            <SignInButton />
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/create-url" 
            element={
              <ProtectedRoute>
                <CreateUrl />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/analytics/:shortCode" 
            element={
              <ProtectedRoute>
                <UrlAnalytics />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      
      {/* Add Toaster for notifications */}
      <Toaster 
        position="bottom-right"
        toastOptions={{
          duration: 2000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            iconTheme: {
              primary: '#4ade80',
              secondary: '#FFFAEE',
            },
          },
        }}
      />
    </BrowserRouter>
  );
}