"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { SignUpForm } from "@/components/sign-up-form";
import { AdminSignupGuard } from "@/components/admin-signup-guard";

export default function Page() {
  const [isAdminSignup, setIsAdminSignup] = useState(false);

  return (
    <AdminSignupGuard>
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-6">
            <Button
              variant={isAdminSignup ? "default" : "outline"}
              onClick={() => setIsAdminSignup(!isAdminSignup)}
              className="mb-4"
            >
              {isAdminSignup ? "Regular Signup" : "Admin Account Creation"}
            </Button>
          </div>

          {isAdminSignup ? (
            <div className="text-center text-sm text-muted-foreground">
              <AlertCircle className="inline-block w-4 h-4 mr-2" />
              Admin account creation requires verification. Contact your system administrator for access code.
            </div>
          ) : (
            <SignUpForm />
          )}
        </div>
      </div>
    </AdminSignupGuard>
  );
}
