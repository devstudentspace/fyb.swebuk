"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Lock } from "lucide-react";

interface AdminSignupGuardProps {
  children: React.ReactNode;
}

export function AdminSignupGuard({ children }: AdminSignupGuardProps) {
  const [adminCode, setAdminCode] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState("");

  // Simple admin code verification (in production, this should be more secure)
  const ADMIN_SIGNUP_CODE = process.env.NEXT_PUBLIC_ADMIN_SIGNUP_CODE || "ADMIN123";

  const handleVerify = () => {
    if (adminCode === ADMIN_SIGNUP_CODE) {
      setIsVerified(true);
      setError("");
    } else {
      setError("Invalid admin code");
    }
  };

  if (!isVerified) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <Lock className="mx-auto h-12 w-12 text-muted-foreground" />
              <CardTitle className="text-2xl">Admin Access Required</CardTitle>
              <CardDescription>
                To create an administrator account, you need to verify your access first
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="adminCode">Admin Verification Code</Label>
                <Input
                  id="adminCode"
                  type="password"
                  placeholder="Enter admin code"
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  className={error ? "border-red-500" : ""}
                />
                {error && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}
              </div>

              <Button
                onClick={handleVerify}
                className="w-full"
                disabled={!adminCode}
              >
                Verify Admin Access
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                <p className="mb-2">
                  Contact your system administrator to get the admin signup code.
                </p>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = "/auth/sign-up"}
                >
                  Back to Regular Signup
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}