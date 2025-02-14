import { useState, useEffect } from "react";
import { toast } from "sonner"; // Using Sonner for toast notifications

import { supabase } from "@/lib/supabaseClient";

export const useUserProfile = (userId: string) => {
  const [fullName, setFullName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("user_id", userId)
          .single();

        if (error) throw error;
        setFullName(data?.full_name || null);
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
      toast.success("Name succesfully updated.", {
        classNames: { toast: "text-success text-lg" },
      });
    }
  };

  return { fullName, loading, error, updateFullName };
};

export const useDeleteUser = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteUser = async (userId: string) => {
    try {
      setLoading(true);

      const response = await fetch("/api/deleteUser", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to delete user");

      // Show success notification
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