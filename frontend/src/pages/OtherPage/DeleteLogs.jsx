import React, { useEffect, useState } from "react";
import axios from "axios";
import BACKEND_URL from "../../configs/constants";
import PageMeta from "../../components/common/PageMeta";

const DeleteLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/leads/get-delete-logs`, {
        withCredentials: true,
      });
      console.log("Delete logs response:", response.data);
      setLogs(response.data);
    } catch (error) {
      console.error("Failed to fetch delete logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <>
      <PageMeta
        title="Lead Deletion Logs"
        description="View logs of deleted leads, including details such as lead name, ID, deleted by, categories, deletion time, and reason."
      />
      <div className="p-6 bg-white dark:bg-gray-900 min-h-screen">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
          🗑️ Lead Deletion Logs
        </h2>

        {loading ? (
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        ) : logs.length === 0 ? (
          <p className="text-gray-500 italic dark:text-gray-400">
            No delete logs found.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
              <thead className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Lead Name</th>
                  <th className="px-4 py-2 text-left font-medium">Lead ID</th>
                  <th className="px-4 py-2 text-left font-medium">
                    Deleted By
                  </th>
                  <th className="px-4 py-2 text-left font-medium">
                    Primary Category
                  </th>
                  <th className="px-4 py-2 text-left font-medium">
                    Secondary Category
                  </th>
                  <th className="px-4 py-2 text-left font-medium">
                    Deleted At
                  </th>
                  <th className="px-4 py-2 text-left font-medium">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100">
                {logs.map((log, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2">{log.leadName || "N/A"}</td>
                    <td className="px-4 py-2">{log.lead_id || "N/A"}</td>
                    <td className="px-4 py-2">{log.deletedBy || "Unknown"}</td>
                    <td className="px-4 py-2">{log.primaryCategory || "-"}</td>
                    <td className="px-4 py-2">
                      {log.secondaryCategory || "-"}
                    </td>
                    <td className="px-4 py-2">
                      {new Date(log.deletedAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>

                    <td className="px-4 py-2">
                      {log.reason || "Not specified"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default DeleteLogs;
