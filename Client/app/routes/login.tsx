import { SignIn } from "@clerk/clerk-react";
import type { Route } from "./+types/login";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Login - WeSellSeals" },
    { name: "description", content: "Login to your account" },
  ];
}

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 mb-8">
          Sign in to We Sell Seals
        </h2>
        <SignIn 
          routing="hash"
          signUpUrl="/signup"
          afterSignInUrl="/"
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

