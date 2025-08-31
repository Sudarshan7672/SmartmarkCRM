import { useState, useEffect } from "react";
import axios from "axios";
import BACKEND_URL from "../../configs/constants";

interface CategoryData {
  category: string;
  total: number;
  new: number;
  notConnected: number;
  hot: number;
  cold: number;
  followUp: number;
  converted: number;
  transferred: number;
  conversionRate: number;
}

interface PrimaryCategoryBifurcationProps {
  selectedUserId: string;
}

export default function PrimaryCategoryBifurcation({
  selectedUserId,
}: PrimaryCategoryBifurcationProps) {
  const [data, setData] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const url = `${BACKEND_URL}/dashboard/primary-category-bifurcation`;
        const params =
          selectedUserId !== "all" ? { userId: selectedUserId } : {};

        const response = await axios.get(url, {
          params,
          withCredentials: true,
        });

        if (response.data.success) {
          setData(response.data.data);
        } else {
          setError("Failed to fetch primary category data");
        }
      } catch (err) {
        console.error("Error fetching primary category bifurcation:", err);
        setError("Error loading primary category data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedUserId]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
          Primary Category Bifurcation
        </h3>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-4 bg-gray-200 dark:bg-gray-700 rounded"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
          Primary Category Bifurcation
        </h3>
        <div className="text-red-500 text-center py-4">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
        Primary Category Bifurcation
      </h3>

      {data.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No data available for the selected criteria
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-center">Total</th>
                <th className="px-4 py-3 text-center">New</th>
                <th className="px-4 py-3 text-center">Not Connected</th>
                <th className="px-4 py-3 text-center">Hot</th>
                <th className="px-4 py-3 text-center">Cold</th>
                <th className="px-4 py-3 text-center">Follow-up</th>
                <th className="px-4 py-3 text-center">Converted</th>
                <th className="px-4 py-3 text-center">Transferred</th>
                <th className="px-4 py-3 text-center">Conversion Rate</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr
                  key={index}
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <td className="px-4 py-4 font-medium text-gray-900 dark:text-white">
                    {row.category || "Unknown"}
                  </td>
                  <td className="px-4 py-4 text-center font-semibold text-blue-600 dark:text-blue-400">
                    {row.total}
                  </td>
                  <td className="px-4 py-4 text-center text-green-600 dark:text-green-400">
                    {row.new}
                  </td>
                  <td className="px-4 py-4 text-center text-yellow-600 dark:text-yellow-400">
                    {row.notConnected}
                  </td>
                  <td className="px-4 py-4 text-center text-red-600 dark:text-red-400">
                    {row.hot}
                  </td>
                  <td className="px-4 py-4 text-center text-blue-600 dark:text-blue-400">
                    {row.cold}
                  </td>
                  <td className="px-4 py-4 text-center text-orange-600 dark:text-orange-400">
                    {row.followUp}
                  </td>
                  <td className="px-4 py-4 text-center text-green-700 dark:text-green-300 font-semibold">
                    {row.converted}
                  </td>
                  <td className="px-4 py-4 text-center text-purple-600 dark:text-purple-400">
                    {row.transferred}
                  </td>
                  <td className="px-4 py-4 text-center font-semibold">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        row.conversionRate >= 20
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          : row.conversionRate >= 10
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                      }`}
                    >
                      {row.conversionRate.toFixed(1)}%
                    </span>
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
