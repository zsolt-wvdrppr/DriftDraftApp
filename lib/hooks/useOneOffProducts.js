import { useState, useEffect } from "react";

export function useOneOffProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getProducts() {
      try {
        const res = await fetch("/api/stripe/get-one-off-products");
        const data = await res.json();

        // Sort products by amount descending
        data.products.sort((a, b) => b.amount - a.amount);

        setProducts(data.products);
      } catch (error) {
        console.error("Failed to fetch products", error);
      } finally {
        setLoading(false);
      }
    }
    getProducts();
  }, []);

  return { products, loading };
}

export default useOneOffProducts;
