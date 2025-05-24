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
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Lead Deletion Logs</h2>
      {loading ? (
        <p>Loading...</p>
      ) : logs.length === 0 ? (
        <p>No delete logs found.</p>
      ) : (
        <div className="overflow-auto rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Lead Name</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Lead ID</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Deleted By</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Primary Category</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Secondary Category</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Deleted At</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {logs.map((log, index) => (
                <tr key={index}>
                  <td className="px-4 py-2">{log.leadName || "N/A"}</td>
                  <td className="px-4 py-2">{log.lead_id || "N/A"}</td>
                  <td className="px-4 py-2">{log.deletedBy || "Unknown"}</td>
                  <td className="px-4 py-2">{log.primaryCategory || "-"}</td>
                  <td className="px-4 py-2">{log.secondaryCategory || "-"}</td>
                  <td className="px-4 py-2">
                    {new Date(log.deletedAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-2">{log.reason || "Not specified"}</td>
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
