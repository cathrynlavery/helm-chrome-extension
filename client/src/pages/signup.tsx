import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabaseClient";
import { getDefaultHelmData } from "@/lib/utils";
import { setStorageData } from "@/lib/chromeStorage";

const SignUp: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [_, navigate] = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    setLoading(true);
    setError(null);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    const userId = data?.user?.id;
    const today = new Date().toISOString().split("T")[0];

    if (userId) {
      const newKey = `helmData-${userId}`;
      const anonymousData = localStorage.getItem("helmData");

      if (anonymousData) {
        const parsed = JSON.parse(anonymousData);
        localStorage.clear();
        await setStorageData(newKey, parsed);
        localStorage.removeItem("helmData");
        console.log("✅ Migrated anonymous helmData to:", newKey);
      } else {
        localStorage.clear();
        const defaultData = getDefaultHelmData();
        await setStorageData(newKey, defaultData);
        console.log("🆕 Created EMPTY helmData for:", newKey);
      }
    }

    setLoading(false);
    navigate("/email-verification");
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
          Sign Up to your account
        </h1>

        <div className="mb-6 w-full">
          <Label
            htmlFor="email"
            className="block text-sm text-[#333333] dark:text-[#E0E0E0] mb-2"
          >
            Enter your email
          </Label>
          <Input
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-transparent border border-[#CDAA7A]/30 focus:border-[#CDAA7A] text-[#333333] dark:text-[#E0E0E0] focus-visible:ring-0 focus-visible:ring-offset-0 rounded-[8px]"
            placeholder="Enter email"
          />
        </div>

        <div className="mb-6 w-full">
          <Label
            htmlFor="password"
            className="block text-sm text-[#333333] dark:text-[#E0E0E0] mb-2"
          >
            Create your password
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-transparent border border-[#CDAA7A]/30 focus:border-[#CDAA7A] text-[#333333] dark:text-[#E0E0E0] focus-visible:ring-0 focus-visible:ring-offset-0 rounded-[8px]"
            placeholder="Enter password"
          />
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <Button
          onClick={handleSignUp}
          className="w-full bg-[#CDAA7A] hover:bg-[#CDAA7A]/90 text-[#333333] rounded-[8px] hover:scale-[1.02] transition-all duration-200"
          disabled={loading}
        >
          {loading ? "Signing Up..." : "Sign Up"}
        </Button>

        <div className="mt-4 text-[14px]">
          Already have an account?{" "}
          <a href="/signin" className="text-[#CDAA7A]">
            Sign in
          </a>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
