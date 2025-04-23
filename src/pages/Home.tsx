import React from 'react';
import { SignedIn, SignedOut, SignIn } from "@clerk/clerk-react";
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="container mx-auto p-4">
      
      <SignedIn>
        <div className="bg-green-50 p-6 rounded-lg shadow-sm mb-6">
          <h2 className="text-xl font-semibold mb-3">You're signed in!</h2>
          <p className="mb-4">Redirecting you to the dashboard...</p>
          <Link 
            to="/dashboard" 
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Go to Dashboard
          </Link>
        </div>
      </SignedIn>
      
      <SignedOut>
        <div className="flex justify-center items-center min-h-[calc(100vh-150px)]">
          <div className="w-full max-w-md">
            <SignIn 
              routing="path"
              path="/"
              signUpUrl="/sign-up"
              redirectUrl="/dashboard"
              appearance={{
                elements: {
                  card: "shadow-xl",
                  headerTitle: "text-2xl font-bold",
                  socialButtonsBlockButton: "h-11",
                  footerActionLink: "text-blue-600 hover:text-blue-800",
                }
              }}
            />
          </div>
        </div>
      </SignedOut>
    </div>
  );
};

export default Home; 