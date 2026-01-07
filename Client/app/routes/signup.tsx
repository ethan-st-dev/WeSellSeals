import { SignUp } from "@clerk/clerk-react";
import type { Route } from "./+types/signup";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sign Up - WeSellSeals" },
    { name: "description", content: "Create a new account" },
  ];
}

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 mb-8">
          Create your account
        </h2>
        <SignUp 
          routing="path"
          path="/signup"
          signInUrl="/login"
          afterSignUpUrl="/"
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-xl"
            }
          }}
        />
      </div>
    </div>
  );
}

