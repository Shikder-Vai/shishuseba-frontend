import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import { toast } from 'sonner';

const UpdateStockModal = ({ sku, onClose }) => {
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('Stock In');
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const { mutate: updateStock, isLoading } = useMutation({
    mutationFn: async (data) => {
            const res = await axiosSecure.post('/v1/inventory/stock/update', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Stock updated successfully');
      queryClient.invalidateQueries(['products']);
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to update stock');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedQuantity = parseInt(quantity, 10);
    if (isNaN(parsedQuantity)) {
      toast.error('Please enter a valid quantity.');
      return;
    }
    updateStock({ sku, quantity: parsedQuantity, reason });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Update Stock for {sku}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Quantity</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="input input-bordered w-full"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Reason</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="select select-bordered w-full"
            >
              <option>Stock In</option>
              <option>Adjustment</option>
              <option>Return</option>
            </select>
          </div>
          <div className="flex justify-end gap-4">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateStockModal;
