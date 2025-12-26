"use client";

import { useRouter } from "next/navigation";
import ModernProfileDisplay from "./modern-profile-display";

type Profile = {
  id: string;
  full_name: string;
  avatar_url: string;
  role?: string;
  registration_number?: string;
  staff_number?: string;
  academic_level?: string;
  department?: string;
  faculty?: string;
  institution?: string;
  linkedin_url?: string;
  github_url?: string;
  skills?: string[];
  bio?: string;
  email?: string;
  created_at?: string;
  website_url?: string;
};

export default function ProfileDisplayWrapper({
  profile,
  editProfileUrl,
}: {
  profile: Profile;
  editProfileUrl: string;
}) {
  const router = useRouter();

  const handleEdit = () => {
    router.push(editProfileUrl);
  };

  return (
    <ModernProfileDisplay
      profile={profile}
      onEdit={handleEdit}
    />
  );
}
