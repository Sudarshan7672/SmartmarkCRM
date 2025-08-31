import { useState, useEffect } from "react";
import axios from "axios";
import BACKEND_URL from "../../configs/constants";

interface MonthlyData {
  month: string;
  monthNumber: number;
  totalLeads: number;
  convertedLeads: number;
  conversionRate: number;
}

interface MonthlyConversionRatiosProps {
  selectedUserId: string;
}

export default function MonthlyConversionRatios({
  selectedUserId,
}: MonthlyConversionRatiosProps) {
  const [data, setData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const url = `${BACKEND_URL}/dashboard/monthly-conversion-ratios`;
        const params =
          selectedUserId !== "all" ? { userId: selectedUserId } : {};

        const response = await axios.get(url, {
          params,
          withCredentials: true,
        });

        if (response.data.success) {
          setData(response.data.data);
        } else {
          setError("Failed to fetch monthly conversion data");
        }
      } catch (err) {
        console.error("Error fetching monthly conversion ratios:", err);
        setError("Error loading monthly conversion data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedUserId]);

  // Calculate totals
  const totals = data.reduce(
    (acc, month) => ({
      totalLeads: acc.totalLeads + month.totalLeads,
      convertedLeads: acc.convertedLeads + month.convertedLeads,
    }),
    { totalLeads: 0, convertedLeads: 0 }
  );

  const overallConversionRate =
    totals.totalLeads > 0
      ? (totals.convertedLeads / totals.totalLeads) * 100
      : 0;

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
          Monthly Conversion Ratios
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
          Monthly Conversion Ratios
        </h3>
        <div className="text-red-500 text-center py-4">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Monthly Conversion Ratios - {new Date().getFullYear()}
        </h3>
        <div className="text-right">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Overall Rate
          </div>
          <div
            className={`text-xl font-bold ${
              overallConversionRate >= 20
                ? "text-green-600 dark:text-green-400"
                : overallConversionRate >= 10
                ? "text-yellow-600 dark:text-yellow-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {overallConversionRate.toFixed(1)}%
          </div>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No data available for the selected criteria
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3">Month</th>
                <th className="px-4 py-3 text-center">Total Leads</th>
                <th className="px-4 py-3 text-center">Converted Leads</th>
                <th className="px-4 py-3 text-center">Conversion Rate</th>
                <th className="px-4 py-3 text-center">Performance</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr
                  key={index}
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <td className="px-4 py-4 font-medium text-gray-900 dark:text-white">
                    {row.month}
                  </td>
                  <td className="px-4 py-4 text-center font-semibold text-blue-600 dark:text-blue-400">
                    {row.totalLeads}
                  </td>
                  <td className="px-4 py-4 text-center font-semibold text-green-600 dark:text-green-400">
                    {row.convertedLeads}
                  </td>
                  <td className="px-4 py-4 text-center font-semibold">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        row.conversionRate >= 20
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          : row.conversionRate >= 10
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                          : row.conversionRate > 0
                          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {row.conversionRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center">
                      {row.totalLeads === 0 ? (
                        <span className="text-gray-400 text-xs">No Data</span>
                      ) : (
                        <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              row.conversionRate >= 20
                                ? "bg-green-500"
                                : row.conversionRate >= 10
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            style={{
                              width: `${Math.min(
                                100,
                                (row.conversionRate / 30) * 100
                              )}%`,
                            }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {/* Totals Row */}
              <tr className="bg-gray-50 dark:bg-gray-700 font-semibold">
                <td className="px-4 py-4 font-bold text-gray-900 dark:text-white">
                  Total / Average
                </td>
                <td className="px-4 py-4 text-center font-bold text-blue-700 dark:text-blue-300">
                  {totals.totalLeads}
                </td>
                <td className="px-4 py-4 text-center font-bold text-green-700 dark:text-green-300">
                  {totals.convertedLeads}
                </td>
                <td className="px-4 py-4 text-center font-bold">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      overallConversionRate >= 20
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        : overallConversionRate >= 10
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                    }`}
                  >
                    {overallConversionRate.toFixed(1)}%
                  </span>
                </td>
                <td className="px-4 py-4 text-center">
                  <div className="flex items-center justify-center">
                    <div className="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          overallConversionRate >= 20
                            ? "bg-green-500"
                            : overallConversionRate >= 10
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{
                          width: `${Math.min(
                            100,
                            (overallConversionRate / 30) * 100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
