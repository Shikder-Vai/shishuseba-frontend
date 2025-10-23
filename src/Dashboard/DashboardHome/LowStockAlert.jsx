import React from 'react';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import SectionTitle from '../../components/SectionTitle';

const LowStockAlert = () => {
  const axiosSecure = useAxiosSecure();
  const { data: lowStockProducts = [], isLoading } = useQuery({
    queryKey: ['lowStockProducts'],
    queryFn: async () => {
      const res = await axiosSecure.get('/v1/products/low-stock');
      return res.data;
    },
  });

  if (isLoading) {
    return <div>Loading low stock products...</div>;
  }

  if (lowStockProducts.length === 0) {
    return null; // Don't render anything if there are no low stock products
  }

  return (
    <div className="mt-8">
      <SectionTitle heading="Low Stock Alert" />
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Variant Name</th>
              <th>SKU</th>
              <th>Stock Quantity</th>
            </tr>
          </thead>
          <tbody>
            {lowStockProducts.map(product => (
              <tr key={product.sku} className="text-red-500">
                <td>{product.productName}</td>
                <td>{product.variantName}</td>
                <td>{product.sku}</td>
                <td>{product.stock_quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LowStockAlert;
