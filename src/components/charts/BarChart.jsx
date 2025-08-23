import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BarChart = ({ data, colors }) => {
  const chartData = {
    labels: data.map(item => item._id),
    datasets: [
      {
        label: 'Revenue',
        data: data.map(item => item.revenue),
        backgroundColor: colors[0],
        borderColor: colors[0],
        borderWidth: 1,
      },
      {
        label: 'Orders',
        data: data.map(item => item.count),
        backgroundColor: colors[1],
        borderColor: colors[1],
        borderWidth: 1,
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return <Bar data={chartData} options={options} />;
};

export default BarChart;