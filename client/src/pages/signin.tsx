import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabaseClient";

const SignIn: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [_, navigate] = useLocation();

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);

    if (!email || !password) {
      setError("Please enter both email and password.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    navigate("/");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#fbfcfc]">
      <div className="absolute top-6 left-6">
        <div className="flex items-center">
          <img src="/icons/dark-icon.svg" alt="Helm" className="h-6 w-auto" />
          <span className="ml-2 text-[#1A1A1A] ibm-plex-mono-medium text-[16px]">
            Helm
          </span>
        </div>
      </div>
      <div className="w-[400px] flex flex-col items-center">
        <h1 className="text-[#1A1A1A] text-[24px] mb-5 ibm-plex-mono-medium">
          Sign In to your account
        </h1>
        <div className="mb-6">
          <Label
            htmlFor="profileName"
            className="block ibm-plex-mono-medium text-sm text-[#333333] dark:text-[#E0E0E0] mb-2"
          >
            Enter your email
          </Label>
          <Input
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-[300px] bg-transparent border border-[#CDAA7A]/30 focus:border-[#CDAA7A] text-[#333333] dark:text-[#E0E0E0] focus-visible:ring-0 focus-visible:ring-offset-0 rounded-[8px]"
            placeholder="Enter email"
          />
        </div>
        <div className="mb-6">
          <Label
            htmlFor="password"
            className="block ibm-plex-mono-medium text-sm text-[#333333] dark:text-[#E0E0E0] mb-2"
          >
            Enter your password
          </Label>
          <Input
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-[300px] bg-transparent border border-[#CDAA7A]/30 focus:border-[#CDAA7A] text-[#333333] dark:text-[#E0E0E0] focus-visible:ring-0 focus-visible:ring-offset-0 rounded-[8px]"
            placeholder="Enter password"
          />
        </div>
        <Button
          onClick={handleSignIn}
          className="w-[300px] bg-[#CDAA7A] hover:bg-[#CDAA7A]/90 text-[#333333] rounded-[8px] hover:scale-[1.02] transition-all duration-200"
        >
          {loading ? "Signing In..." : "Sign In"}
        </Button>
        <div className="mt-4 ibm-plex-mono-medium text-[14px]">
          Don't have an account?{" "}
          <a href="/signup" className="text-[#CDAA7A] ibm-plex-mono-medium">
            Sign up
          </a>
        </div>
        {error && (
          <p className="text-red-600 text-sm mb-4 text-center w-[300px]">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default SignIn;
