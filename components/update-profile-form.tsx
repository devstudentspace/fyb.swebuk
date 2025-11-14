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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    // If the profile already includes a full URL (generated server-side), use it directly
    if (profile.avatar_url && profile.avatar_url.startsWith('http')) {
      setAvatarUrl(profile.avatar_url);
    }
    // Otherwise, if it's just a file path, generate the signed URL client-side
    else if (profile.avatar_url) {
      // For local development, we first try to get a signed URL,
      // but handle potential errors more gracefully for local Supabase instance
      // Also implement a retry mechanism in case of failure
      const fetchAvatarUrl = async () => {
        try {
          const { data, error } = await supabase.storage
            .from("avatars")
            .createSignedUrl(profile.avatar_url, 3600); // 1 hour expiry

          if (error) {
            console.error("Error getting signed avatar URL:", error);
            // Fallback to getPublicUrl if createSignedUrl fails
            // For local development, sometimes we need to construct the URL manually
            const { data: publicData } = await supabase.storage
              .from("avatars")
              .getPublicUrl(profile.avatar_url);

            if (publicData?.publicUrl) {
              // Normalize hostname to ensure consistency with what works in other components
              const normalizedPublicUrl = publicData.publicUrl.replace('localhost', '127.0.0.1');
              setAvatarUrl(normalizedPublicUrl);
            } else {
              // Fallback for local development - manually construct URL if needed
              console.warn("Could not generate public URL, image may not display properly in local development");
              setAvatarUrl(null);
            }
          } else if (data?.signedUrl) {
            // Normalize hostname to ensure consistency with what works in other components
            const normalizedSignedUrl = data.signedUrl.replace('localhost', '127.0.0.1');
            setAvatarUrl(normalizedSignedUrl);
          } else {
            // Fallback to getPublicUrl if signed URL doesn't exist
            const { data: publicData } = await supabase.storage
              .from("avatars")
              .getPublicUrl(profile.avatar_url);
            // Normalize hostname to ensure consistency
            const normalizedPublicUrl = publicData?.publicUrl?.replace('localhost', '127.0.0.1') || null;
            setAvatarUrl(normalizedPublicUrl);
          }
        } catch (err: any) {
          console.error("Unexpected error getting avatar URL:", err);
          // Check if it's a timeout or network error and handle appropriately
          if (err?.message?.includes('timeout') || err?.status === 500) {
            console.warn('Storage timeout or server error - using fallback avatar');
          }
          // Fallback to getPublicUrl if createSignedUrl fails
          const { data: publicData } = await supabase.storage
            .from("avatars")
            .getPublicUrl(profile.avatar_url);
          // Normalize hostname to ensure consistency
          const normalizedPublicUrl = publicData?.publicUrl?.replace('localhost', '127.0.0.1') || null;
          setAvatarUrl(normalizedPublicUrl);
        }
      };

      fetchAvatarUrl();
    }
  }, [profile.avatar_url, supabase]);

  const handleUpload: React.ChangeEventHandler<HTMLInputElement> = async (
    event
  ) => {
    try {
      setUploading(true);
      setError(null);
      setSuccessMessage(null);

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
      setSuccessMessage(null);

      let avatar_url = profile.avatar_url;

      if (avatarFile) {
        const fileExt = avatarFile.name.split(".").pop()?.toLowerCase();
        const fileName = `${user.id}-${Math.random()}`;
        const filePath = fileExt ? `${fileName}.${fileExt}` : fileName;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, avatarFile);

        if (uploadError) {
          throw uploadError;
        }
        // Only store the file path in the database, not the full URL
        avatar_url = filePath;
      }

      await supabase
        .from("profiles")
        .update({ full_name: fullName, avatar_url })
        .eq("id", user.id);

      // Update avatar URL after successful save by generating a new signed URL
      if (avatar_url && avatar_url !== profile.avatar_url) {
        // Use the same approach as in useEffect to fetch the avatar URL
        const { data: urlData, error: urlError } = await supabase.storage
          .from("avatars")
          .createSignedUrl(avatar_url, 3600); // 1 hour expiry

        if (!urlError && urlData?.signedUrl) {
          // Normalize hostname to ensure consistency
          const normalizedSignedUrl = urlData.signedUrl.replace('localhost', '127.0.0.1');
          setAvatarUrl(normalizedSignedUrl);
        } else {
          // Fallback to getPublicUrl if createSignedUrl fails
          const { data: publicData } = await supabase.storage
            .from("avatars")
            .getPublicUrl(avatar_url);
          // Normalize hostname to ensure consistency
          const normalizedPublicUrl = publicData?.publicUrl?.replace('localhost', '127.0.0.1') || avatar_url;
          setAvatarUrl(normalizedPublicUrl);
        }
      }

      router.refresh();
      setSuccessMessage("Profile updated successfully!");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
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
            onError={(e) => {
              console.warn("Error loading image:", e instanceof ErrorEvent ? e.error || "Image loading failed" : "Image loading failed");
              // Try to fall back to a different URL format if the original fails
              const target = e.target as HTMLImageElement;
              if (target && target.src) {
                if (target.src.includes('localhost') && !target.src.includes('127.0.0.1')) {
                  // If using localhost, try 127.0.0.1 as alternative
                  target.src = target.src.replace('localhost', '127.0.0.1');
                } else if (target.src.includes('127.0.0.1') && !target.src.includes('localhost')) {
                  // If using 127.0.0.1, try localhost as alternative
                  target.src = target.src.replace('127.0.0.1', 'localhost');
                } else {
                  // If both approaches failed, show the fallback
                  target.onerror = null; // Prevent infinite loop
                  target.style.display = 'none';
                  const fallbackDiv = target.parentElement?.querySelector('.avatar.no-image');
                  if (fallbackDiv) {
                    fallbackDiv.setAttribute('style', `height: 150px; width: 150px; display: block;`);
                  }
                }
              }
            }}
          />
        ) : (
          <div
            className="avatar no-image rounded-full bg-gray-200"
            style={{ height: 150, width: 150, display: 'block' }}
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
        {successMessage && <p className="text-sm text-green-500">{successMessage}</p>}
        <Button type="submit" className="w-full" disabled={uploading}>
          {uploading ? "Saving..." : "Update Profile"}
        </Button>
      </form>
    </div>
  );
}
