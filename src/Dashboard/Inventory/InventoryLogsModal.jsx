import React from 'react';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../../hooks/useAxiosSecure';

const InventoryLogsModal = ({ sku, onClose }) => {
  const axiosSecure = useAxiosSecure();
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['inventoryLogs', sku],
    queryFn: async () => {
      const res = await axiosSecure.get(`/inventory/logs/${sku}`);
      return res.data;
    },
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-3xl">
        <h2 className="text-xl font-bold mb-4">Inventory Logs for {sku}</h2>
        <div className="overflow-x-auto max-h-96">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Change</th>
                <th>New Quantity</th>
                <th>Reason</th>
                <th>Order ID</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="text-center">Loading...</td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log._id}>
                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                    <td>{log.change_quantity}</td>
                    <td>{log.new_quantity}</td>
                    <td>{log.reason}</td>
                    <td>{log.orderId || 'N/A'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end mt-4">
          <button type="button" className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryLogsModal;
