import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BACKEND_URL from '../../configs/constants';

export default function CategorySummaryTable() {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/dashboard/lead-category-summary`,{
        withCredentials: true,
      })
      .then((res) => {
        setSummary(res.data.data || []);
        // console.log('Lead category summary data:', res.data.data);
      })
      .catch((err) => {
        console.error('Error fetching category summary:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700">
  <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
    Lead Category Summary
  </h2>
  {loading ? (
    <p className="text-gray-600 dark:text-gray-300">Loading...</p>
  ) : summary.length === 0 ? (
    <p className="text-gray-600 dark:text-gray-300">No data available.</p>
  ) : (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm border border-gray-300 dark:border-gray-600">
        <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
          <tr>
            <th className="px-4 py-2 border border-gray-300 dark:border-gray-600">Category</th>
            <th className="px-4 py-2 border border-gray-300 dark:border-gray-600">Total Leads</th>
            <th className="px-4 py-2 border border-gray-300 dark:border-gray-600">Converted Leads</th>
            <th className="px-4 py-2 border border-gray-300 dark:border-gray-600">Conversion %</th>
          </tr>
        </thead>
        <tbody>
          {summary.map((row, idx) => (
            <tr
              key={idx}
              className="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-900 dark:even:bg-gray-800 dark:text-gray-100"
            >
              <td className="px-4 py-2 border border-gray-300 dark:border-gray-600">
                {row.category ? row.category : "Unassigned"}
              </td>
              <td className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-center">
                {row.totalLeads}
              </td>
              <td className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-center">
                {row.convertedLeads}
              </td>
              <td className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-center">
                {row.conversionRate}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</div>

  );
}
