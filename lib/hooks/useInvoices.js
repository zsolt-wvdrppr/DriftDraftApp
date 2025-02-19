import { useState, useEffect } from "react";

export function useInvoices(userId) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    async function fetchInvoices() {
      try {
        const response = await fetch(`/api/stripe/get-invoices?userId=${userId}`);
        const { success, invoices, error } = await response.json();

        if (!success) {
          setError(error || "Failed to fetch invoices");

          return;
        }

        setInvoices(invoices);
      } catch (err) {
        setError("An unexpected error occurred.", err);
      } finally {
        setLoading(false);
      }
    }

    fetchInvoices();
  }, [userId]);

  return { invoices, loading, error };
}
