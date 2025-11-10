"use client";

import { createClient } from "@/lib/supabase/client";
import { type User } from "@supabase/supabase-js";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

type Profile = {
  id: string;
  full_name: string;
  avatar_url: string;
};

export default function UpdateProfileForm({
  user,
  profile,
}: {
  user: User;
  profile: Profile;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [fullName, setFullName] = useState(profile.full_name || "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    if (profile.avatar_url) {
      const { data } = supabase.storage
        .from("avatars")
        .getPublicUrl(profile.avatar_url);
      setAvatarUrl(data.publicUrl);
    }
  }, [profile.avatar_url, supabase]);

  const handleUpload: React.ChangeEventHandler<HTMLInputElement> = async (
    event
  ) => {
    try {
      setUploading(true);
      setError(null);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.");
      }

      const file = event.target.files[0];
      setAvatarFile(file);
      setAvatarUrl(URL.createObjectURL(file));
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Error uploading avatar."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setUploading(true);
      setError(null);

      let avatar_url = profile.avatar_url;

      if (avatarFile) {
        const fileExt = avatarFile.name.split(".").pop();
        const filePath = `${user.id}-${Math.random()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, avatarFile);

        if (uploadError) {
          throw uploadError;
        }
        avatar_url = filePath;
      }

      await supabase
        .from("profiles")
        .update({ full_name: fullName, avatar_url })
        .eq("id", user.id);

      router.refresh();
      alert("Profile updated successfully!");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Error updating profile."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        {avatarUrl ? (
          <Image
            width={150}
            height={150}
            src={avatarUrl}
            alt="Avatar"
            className="avatar image rounded-full"
            unoptimized
          />
        ) : (
          <div
            className="avatar no-image rounded-full bg-gray-200"
            style={{ height: 150, width: 150 }}
          />
        )}
        <div>
          <Button asChild>
            <label htmlFor="single">
              {uploading ? "Uploading ..." : "Upload"}
            </label>
          </Button>
          <Input
            style={{
              visibility: "hidden",
              position: "absolute",
            }}
            type="file"
            id="single"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
          />
        </div>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid gap-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" className="w-full" disabled={uploading}>
          {uploading ? "Saving..." : "Update Profile"}
        </Button>
      </form>
    </div>
  );
}
