import { useState } from "react";
import { useInvoices } from "@/lib/hooks/useInvoices";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@heroui/react";
import { motion, AnimatePresence } from "framer-motion";

const InvoiceList = () => {
  const { user } = useAuth();
  const userId = user?.id;
  const { invoices, loading, error, hasMore, fetchInvoices } = useInvoices();
  const [showInvoices, setShowInvoices] = useState(false);

  const handleToggleInvoices = () => {
    if (!showInvoices) {
      fetchInvoices(userId, true); // Reset previous data
    }
    setShowInvoices((prev) => !prev);
  };

  return (
    <div className="">
      <Button onPress={handleToggleInvoices} className="bg-primary text-white">
        {showInvoices ? "Hide Invoices" : "View Invoices"}
      </Button>

      <AnimatePresence>
        {showInvoices && (
          <motion.div
            key="invoice-list"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="mt-4 overflow-hidden"
          >
            {loading && <p>Loading invoices...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {invoices.length === 0 && !loading && <p>No paid invoices found.</p>}

            {invoices.length > 0 && (
              <ul className="mt-2 space-y-2">
                {invoices.map((invoice) => (
                  <motion.li
                    key={invoice.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex justify-between p-2 border rounded shadow-md"
                  >
                    <div>
                      <p>Amount: <strong>{invoice.amount} {invoice.currency}</strong></p>
                      <p>Date: {new Date(invoice.date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <a href={invoice.hosted_invoice_url} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                        View
                      </a>
                      <a href={invoice.invoice_pdf} target="_blank" rel="noopener noreferrer" className="text-green-500">
                        Download
                      </a>
                    </div>
                  </motion.li>
                ))}
              </ul>
            )}

            {/* Load More Button */}
            {hasMore && (
              <Button onPress={() => fetchInvoices(userId)} className="mt-4 bg-secondary text-white">
                Load More
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InvoiceList;
