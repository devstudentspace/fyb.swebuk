"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [role, setRole] = useState<"student" | "staff" | "admin">("student");
  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [department, setDepartment] = useState("Software Engineering");
  const [institution, setInstitution] = useState("Bayero University Kano");
  const [academicLevel, setAcademicLevel] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [staffNumber, setStaffNumber] = useState("");
  const [staffType, setStaffType] = useState("supervisor");
  const [skills, setSkills] = useState<string[]>([]);
  const [linkedinHandle, setLinkedinHandle] = useState("");
  const [githubHandle, setGithubHandle] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    // Validation
    if (password !== repeatPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    // Required fields validation
    if (!email || !password || !firstName || !surname) {
      setError("Please fill in all required fields");
      setIsLoading(false);
      return;
    }

    // Role-specific validation
    if (role === "student" && !academicLevel && !registrationNumber) {
      setError("Academic level and registration number are required for students");
      setIsLoading(false);
      return;
    }

    if ((role === "staff" || role === "administrator" || role === "manager_staff") && !staffNumber) {
      setError("Staff number is required for staff roles");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/protected`,
          data: {
            role,
            full_name: `${firstName} ${middleName ? middleName + ' ' : ''}${surname}`.trim(),
            department,
            institution,
            academic_level: role === "student" ? parseInt(academicLevel) : null,
            registration_number: role === "student" ? registrationNumber : null,
            staff_number: (role === "staff" || role === "administrator" || role === "manager_staff") ? staffNumber : null,
            staff_type: role === "staff" ? staffType : null,
            skills,
            linkedin_handle: linkedinHandle,
            github_handle: githubHandle,
          },
        },
      });

      if (error) throw error;
      router.push("/auth/sign-up-success");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Sign up</CardTitle>
          <CardDescription>Create a new account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp}>
            <div className="flex flex-col gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="surname">Surname *</Label>
                    <Input
                      id="surname"
                      placeholder="Doe"
                      required
                      value={surname}
                      onChange={(e) => setSurname(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="middleName">Middle Name</Label>
                    <Input
                      id="middleName"
                      placeholder="Michael"
                      value={middleName}
                      onChange={(e) => setMiddleName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john.doe@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="repeatPassword">Repeat Password *</Label>
                    <Input
                      id="repeat-password"
                      type="password"
                      required
                      value={repeatPassword}
                      onChange={(e) => setRepeatPassword(e.target.value)}
                    />
                  </div>
                </div>

                {/* Role Selection */}
                <div>
                  <Label htmlFor="role">Role *</Label>
                  <Select onValueChange={(value) => setRole(value as "student" | "staff" | "admin")} defaultValue={role}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="manager_staff">Manager Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Role-Specific Fields */}
                {role === "student" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Student Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="academicLevel">Academic Level *</Label>
                        <Select onValueChange={setAcademicLevel} value={academicLevel}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select academic level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="100">100 Level</SelectItem>
                            <SelectItem value="200">200 Level</SelectItem>
                            <SelectItem value="300">300 Level</SelectItem>
                            <SelectItem value="400">400 Level</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="registrationNumber">Registration Number *</Label>
                        <Input
                          id="registrationNumber"
                          placeholder="202400123"
                          required
                          value={registrationNumber}
                          onChange={(e) => setRegistrationNumber(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {(role === "staff" || role === "administrator" || role === "manager_staff") && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Staff Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="staffNumber">Staff Number *</Label>
                        <Input
                          id="staffNumber"
                          placeholder="STAFF001"
                          required
                          value={staffNumber}
                          onChange={(e) => setStaffNumber(e.target.value)}
                        />
                      </div>
                      {role === "staff" && (
                        <div>
                          <Label htmlFor="staffType">Staff Type</Label>
                          <Select onValueChange={setStaffType} value={staffType}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select staff type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="supervisor">Supervisor</SelectItem>
                              <SelectItem value="manager">Manager</SelectItem>
                              <SelectItem value="administrator">Administrator</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Common Fields */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Additional Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        placeholder="Software Engineering"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="institution">Institution</Label>
                      <Input
                        id="institution"
                        placeholder="Bayero University Kano"
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <Label htmlFor="skills">Skills</Label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          id="newSkill"
                          placeholder="Add a skill (e.g., JavaScript, React, Python)"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter" && newSkill.trim()) {
                              e.preventDefault();
                              setSkills(prev => [...prev, newSkill.trim()]);
                              setNewSkill("");
                            }
                          }}
                        />
                        <Button
                          type="button"
                          onClick={() => {
                            if (newSkill.trim()) {
                              setSkills(prev => [...prev, newSkill.trim()]);
                              setNewSkill("");
                            }
                          }}
                          disabled={!newSkill.trim()}
                        >
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill, index) => (
                          <div
                            key={index}
                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => setSkills(prev => prev.filter((_, i) => i !== index))}
                              className="ml-2 text-blue-600 hover:text-blue-800"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="linkedinHandle">LinkedIn Handle</Label>
                      <Input
                        id="linkedinHandle"
                        placeholder="johndoe"
                        value={linkedinHandle}
                        onChange={(e) => setLinkedinHandle(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="githubHandle">GitHub Handle</Label>
                      <Input
                        id="githubHandle"
                        placeholder="johndoe"
                        value={githubHandle}
                        onChange={(e) => setGithubHandle(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating an account..." : "Sign up"}
                </Button>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link href="/auth/login" className="underline underline-offset-4">
                Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
