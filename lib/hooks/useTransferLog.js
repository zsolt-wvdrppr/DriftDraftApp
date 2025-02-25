import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

import { useAuth } from "@/lib/AuthContext"; // Adjust path if needed

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const useTransferLog = () => {
  const { user } = useAuth();
  const [transferLog, setTransferLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setTransferLog([]);
      setLoading(false);

      return;
    }

    const fetchTransferLog = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("profiles")
        .select("credit_transfer_log")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        setError(error.message);
        setLoading(false);
        
        return;
      }

      setTransferLog(data?.credit_transfer_log || []);
      setLoading(false);
    };

    fetchTransferLog();

    // Optional: Subscribe to real-time updates (if enabled in Supabase)
    const subscription = supabase
      .channel(`public:profiles:user_id=eq.${user.id}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "profiles" }, fetchTransferLog)
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  return { transferLog, loading, error };
};

export default useTransferLog;
