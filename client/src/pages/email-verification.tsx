import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { setStorageData } from "@/lib/chromeStorage";
import { getDefaultHelmData } from "@/lib/utils";

const EmailVerification: React.FC = () => {
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [_, navigate] = useLocation();
  const { user } = useAuth();

  const handleCheckVerification = async () => {
    setChecking(true);
    setError("");
    setMessage("");

    const { data, error: reloadError } = await supabase.auth.getUser();

    if (reloadError) {
      setError(reloadError.message);
    } else if (data.user?.email_confirmed_at) {
      navigate("/dashboard");
    } else {
      setError("Your email is not verified yet. Please check your inbox.");
    }

    setChecking(false);
  };

  const handleResendEmail = async () => {
    if (!user?.email) {
      setError("Missing email address.");
      return;
    }

    setResending(true);
    setError("");
    setMessage("");

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: user.email,
    });

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

    if (error) {
      setError(error.message);
    } else {
      setMessage("Verification email has been resent. Please check your inbox.");
    }

    setResending(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-[400px]">
        <h1 className="text-2xl mb-4">Verify your email</h1>
        <p className="mb-6">
          We’ve sent a confirmation link to <strong>{user?.email}</strong>. Please click the link in your inbox.
        </p>

        {error && <p className="text-red-500 mb-4">{error}</p>}
        {message && <p className="text-green-600 mb-4">{message}</p>}

        <Button
          onClick={handleCheckVerification}
          disabled={checking}
          className="mb-4"
        >
          {checking ? "Checking..." : "I've Verified My Email"}
        </Button>

        <Button
          variant="outline"
          onClick={handleResendEmail}
          disabled={resending}
        >
          {resending ? "Resending..." : "Resend verification email"}
        </Button>
      </div>
    </div>
  );
};

export default EmailVerification;
