import { useState, useEffect } from "react";
import { toast } from "sonner"; // Using Sonner for toast notifications

import { getJWT } from "@/lib/utils/getJWT";
import { supabase } from "@/lib/supabaseClient";
import logger from "@/lib/logger";
import { useSessionContext } from "@/lib/SessionProvider"; 

export const useUserProfile = (userId: string) => {
  const [fullName, setFullName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("full_name, email")
          .eq("user_id", userId)
          .maybeSingle(); // 👈 FIX: Prevents errors if profile doesn't exist yet

        if (error) throw error;

        if (!data) {
          // 👇 Profile does not exist, avoid setting state to undefined
          setFullName(null);
          setEmail(null);
        } else {
          setFullName(data.full_name);
          setEmail(data.email);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const updateFullName = async (newName: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: newName })
        .eq("user_id", userId);

      if (error) throw error;
      setFullName(newName);
    } catch (err: any) {
      setError(err.message);
      toast.error("Failed to update name.", {
        classNames: { toast: "text-danger text-lg" },
      });
    } finally {
      setLoading(false);
      toast.success("Name successfully updated.", {
        classNames: { toast: "text-success text-lg" },
      });
    }
  };

  return { fullName, email, loading, error, updateFullName };
};


export const useDeleteUser = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { logOutUser } = useSessionContext();

  const deleteUser = async () => {
    try {
      setLoading(true);

      const token = await getJWT();

      logger.debug("Token: ", token);

      if (!token) {
        throw new Error("Unauthorized - No valid token.");
      }

      const response = await fetch("/api/deleteUser", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ Send JWT token for authentication
        },
      });
      await logOutUser();

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to delete user");

      // ✅ Show success notification
      toast.success("Your account has been deleted successfully.");
      
    } catch (err: any) {
      setError(err.message);
      toast.error(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return { deleteUser, loading, error };
};
