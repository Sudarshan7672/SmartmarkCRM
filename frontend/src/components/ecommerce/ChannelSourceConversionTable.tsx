import React, { useEffect, useState } from "react";
import axios from "axios";
import BACKEND_URL from "../../configs/constants";

const ChannelSourceConversionTable = () => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    // Fetch the data from the backend using Axios
    const fetchData = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/dashboard/channel-source-conversion`, {
          withCredentials: true,
        });
        setData(response.data.data); // Set the data in state
        console.log("Channel-Source Conversion Data:", response.data.data);
      } catch (error) {
        console.error("Error fetching conversion data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
        Channel-Source wise Conversion Analysis
      </h3>
      <div className="overflow-x-auto mt-5">
        <table className="min-w-full table-auto">
          <thead className="border-b bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Source</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Total Leads</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Converted Leads</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Leads Conversion (%)</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.source} className="border-b dark:border-gray-700">
                <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">{item.source}</td>
                <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">{item.totalLeads}</td>
                <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">{item.convertedLeads}</td>
                <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">{item.conversionRate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ChannelSourceConversionTable;
