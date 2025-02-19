import { useInvoices } from "@/lib/hooks/useInvoices";

const InvoiceList = ({ userId }) => {
  const { invoices, loading, error } = useInvoices(userId);

  if (loading) return <p>Loading invoices...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (invoices.length === 0) return <p>No paid invoices found.</p>;

  return (
    <div>
      <h2 className="text-lg font-semibold">Your Paid Invoices</h2>
      <ul className="mt-2 space-y-2">
        {invoices.map((invoice) => (
          <li key={invoice.id} className="flex justify-between p-2 border rounded">
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
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InvoiceList;
