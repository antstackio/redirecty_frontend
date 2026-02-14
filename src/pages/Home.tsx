import { SignedOut, SignIn } from "@clerk/clerk-react";

const Home = () => {
  return (
    <div className="container mx-auto p-4">
      
      <SignedOut>
        <div className="flex justify-center items-center min-h-[calc(100vh-150px)]">
          <div className="w-full max-w-md">
            <SignIn 
              routing="path"
              path="/"
              signUpUrl="/sign-up"
              redirectUrl="/"
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