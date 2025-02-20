import { useState } from "react";

export function useInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastInvoiceId, setLastInvoiceId] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchInvoices = async (userId, reset = false) => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const url = `/api/stripe/get-invoices?userId=${userId}${
        !reset && lastInvoiceId ? `&starting_after=${lastInvoiceId}` : ""
      }`;

      const response = await fetch(url);
      const { success, invoices: newInvoices, hasMore, lastInvoiceId: newLastInvoiceId, error } = await response.json();

      if (!success) {
        setError(error || "Failed to fetch invoices");
        
        return;
      }

      setInvoices((prevInvoices) => (reset ? newInvoices : [...prevInvoices, ...newInvoices]));
      setLastInvoiceId(newLastInvoiceId);
      setHasMore(hasMore);
    } catch (err) {
      setError("An unexpected error occurred.", err);
    } finally {
      setLoading(false);
    }
  };

  return { invoices, loading, error, hasMore, fetchInvoices };
}
