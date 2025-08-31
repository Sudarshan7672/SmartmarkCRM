import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import BACKEND_URL from "../../configs/constants";
import PageMeta from "../../components/common/PageMeta";

const DeleteLogs = () => {
  const [deletedLeads, setDeletedLeads] = useState([]);
  const [deleteLogs, setDeleteLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("deleted-leads");
  const [undeleting, setUndeleting] = useState(null);

  const fetchDeletedLeads = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/leads/deleted`, {
        withCredentials: true,
      });
      console.log("Deleted leads response:", response.data);
      setDeletedLeads(response.data);
    } catch (error) {
      console.error("Failed to fetch deleted leads:", error);
    }
  };

  const fetchDeleteLogs = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/leads/get-delete-logs`, {
        withCredentials: true,
      });
      console.log("Delete logs response:", response.data);
      setDeleteLogs(response.data);
    } catch (error) {
      console.error("Failed to fetch delete logs:", error);
    }
  };

  const handleUndelete = async (leadId) => {
    setUndeleting(leadId);
    try {
      await axios.post(
        `${BACKEND_URL}/leads/undelete/${leadId}`,
        {},
        {
          withCredentials: true,
        }
      );
      toast.success("Lead restored successfully!");
      // Refresh both lists after successful undelete
      await fetchDeletedLeads();
      await fetchDeleteLogs();
    } catch (error) {
      console.error("Failed to undelete lead:", error);
      toast.error("Failed to restore lead. Please try again.");
    } finally {
      setUndeleting(null);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchDeletedLeads(), fetchDeleteLogs()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <>
      <PageMeta
        title="Lead Deletion Management"
        description="View deleted leads and deletion logs. Restore deleted leads back to active status with undo functionality."
      />
      <div className="p-4 bg-white dark:bg-gray-900 min-h-screen w-full overflow-hidden">
        <div className="max-w-full">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
            🗑️ Lead Management
          </h2>

          {/* Tab Navigation */}
          <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("deleted-leads")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "deleted-leads"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                Deleted Leads ({deletedLeads.length})
              </button>
              <button
                onClick={() => setActiveTab("delete-logs")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "delete-logs"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                Delete Logs ({deleteLogs.length})
              </button>
            </nav>
          </div>

          {loading ? (
            <p className="text-gray-600 dark:text-gray-300">Loading...</p>
          ) : (
            <div className="w-full">
              {/* Deleted Leads Tab */}
              {activeTab === "deleted-leads" &&
                (deletedLeads.length === 0 ? (
                  <p className="text-gray-500 italic dark:text-gray-400">
                    No deleted leads found.
                  </p>
                ) : (
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-gray-900">
                    <div className="overflow-x-auto overflow-y-hidden w-full">
                      <table
                        className="w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm"
                        style={{ minWidth: "1400px" }}
                      >
                        <thead className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 sticky top-0 z-10">
                          <tr>
                            <th
                              className="px-3 py-3 text-left font-medium whitespace-nowrap border-r border-gray-200 dark:border-gray-700"
                              style={{ width: "80px" }}
                            >
                              Lead ID
                            </th>
                            <th
                              className="px-3 py-3 text-left font-medium whitespace-nowrap border-r border-gray-200 dark:border-gray-700"
                              style={{ width: "150px" }}
                            >
                              Full Name
                            </th>
                            <th
                              className="px-3 py-3 text-left font-medium whitespace-nowrap border-r border-gray-200 dark:border-gray-700"
                              style={{ width: "120px" }}
                            >
                              Lead Owner
                            </th>
                            <th
                              className="px-3 py-3 text-left font-medium whitespace-nowrap border-r border-gray-200 dark:border-gray-700"
                              style={{ width: "180px" }}
                            >
                              Email
                            </th>
                            <th
                              className="px-3 py-3 text-left font-medium whitespace-nowrap border-r border-gray-200 dark:border-gray-700"
                              style={{ width: "100px" }}
                            >
                              Contact
                            </th>
                            <th
                              className="px-3 py-3 text-left font-medium whitespace-nowrap border-r border-gray-200 dark:border-gray-700"
                              style={{ width: "140px" }}
                            >
                              Company
                            </th>
                            <th
                              className="px-3 py-3 text-left font-medium whitespace-nowrap border-r border-gray-200 dark:border-gray-700"
                              style={{ width: "80px" }}
                            >
                              Source
                            </th>
                            <th
                              className="px-3 py-3 text-left font-medium whitespace-nowrap border-r border-gray-200 dark:border-gray-700"
                              style={{ width: "80px" }}
                            >
                              Status
                            </th>
                            <th
                              className="px-3 py-3 text-left font-medium whitespace-nowrap border-r border-gray-200 dark:border-gray-700"
                              style={{ width: "90px" }}
                            >
                              Territory
                            </th>
                            <th
                              className="px-3 py-3 text-left font-medium whitespace-nowrap border-r border-gray-200 dark:border-gray-700"
                              style={{ width: "80px" }}
                            >
                              Region
                            </th>
                            <th
                              className="px-3 py-3 text-left font-medium whitespace-nowrap border-r border-gray-200 dark:border-gray-700"
                              style={{ width: "80px" }}
                            >
                              State
                            </th>
                            <th
                              className="px-3 py-3 text-left font-medium whitespace-nowrap border-r border-gray-200 dark:border-gray-700"
                              style={{ width: "80px" }}
                            >
                              Country
                            </th>
                            <th
                              className="px-3 py-3 text-left font-medium whitespace-nowrap border-r border-gray-200 dark:border-gray-700"
                              style={{ width: "120px" }}
                            >
                              Primary Category
                            </th>
                            <th
                              className="px-3 py-3 text-left font-medium whitespace-nowrap border-r border-gray-200 dark:border-gray-700"
                              style={{ width: "120px" }}
                            >
                              Secondary Category
                            </th>
                            <th
                              className="px-3 py-3 text-left font-medium whitespace-nowrap border-r border-gray-200 dark:border-gray-700"
                              style={{ width: "100px" }}
                            >
                              Created At
                            </th>
                            <th
                              className="px-3 py-3 text-left font-medium whitespace-nowrap border-r border-gray-200 dark:border-gray-700"
                              style={{ width: "100px" }}
                            >
                              Updated At
                            </th>
                            <th
                              className="px-3 py-3 text-left font-medium whitespace-nowrap sticky right-0 bg-gray-100 dark:bg-gray-800 border-l-2 border-gray-300 dark:border-gray-600"
                              style={{ width: "100px" }}
                            >
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100">
                          {deletedLeads.map((lead) => (
                            <tr
                              key={lead._id?.$oid || lead._id}
                              className="hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                              <td className="px-3 py-3 font-medium text-sm whitespace-nowrap border-r border-gray-100 dark:border-gray-700">
                                {lead.lead_id || "N/A"}
                              </td>
                              <td className="px-3 py-3 text-sm whitespace-nowrap border-r border-gray-100 dark:border-gray-700">
                                <div
                                  className="max-w-[150px] truncate"
                                  title={lead.fullname || "N/A"}
                                >
                                  {lead.fullname || "N/A"}
                                </div>
                              </td>
                              <td className="px-3 py-3 text-sm whitespace-nowrap border-r border-gray-100 dark:border-gray-700">
                                <div
                                  className="max-w-[120px] truncate"
                                  title={lead.leadowner || "N/A"}
                                >
                                  {lead.leadowner || "N/A"}
                                </div>
                              </td>
                              <td className="px-3 py-3 text-sm whitespace-nowrap border-r border-gray-100 dark:border-gray-700">
                                <div
                                  className="max-w-[180px] truncate"
                                  title={lead.email || "-"}
                                >
                                  {lead.email || "-"}
                                </div>
                              </td>
                              <td className="px-3 py-3 text-sm whitespace-nowrap border-r border-gray-100 dark:border-gray-700">
                                {lead.contact || "-"}
                              </td>
                              <td className="px-3 py-3 text-sm whitespace-nowrap border-r border-gray-100 dark:border-gray-700">
                                <div
                                  className="max-w-[140px] truncate"
                                  title={lead.company || "-"}
                                >
                                  {lead.company || "-"}
                                </div>
                              </td>
                              <td className="px-3 py-3 text-sm whitespace-nowrap border-r border-gray-100 dark:border-gray-700">
                                <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                  {lead.source || "N/A"}
                                </span>
                              </td>
                              <td className="px-3 py-3 text-sm whitespace-nowrap border-r border-gray-100 dark:border-gray-700">
                                <span
                                  className={`px-2 py-1 text-xs rounded ${
                                    lead.status === "New"
                                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                      : lead.status === "Hot"
                                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                      : lead.status === "Cold"
                                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                      : lead.status === "Converted"
                                      ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                                      : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                                  }`}
                                >
                                  {lead.status || "N/A"}
                                </span>
                              </td>
                              <td className="px-3 py-3 text-sm whitespace-nowrap border-r border-gray-100 dark:border-gray-700">
                                {lead.territory || "-"}
                              </td>
                              <td className="px-3 py-3 text-sm whitespace-nowrap border-r border-gray-100 dark:border-gray-700">
                                {lead.region || "-"}
                              </td>
                              <td className="px-3 py-3 text-sm whitespace-nowrap border-r border-gray-100 dark:border-gray-700">
                                {lead.state || "-"}
                              </td>
                              <td className="px-3 py-3 text-sm whitespace-nowrap border-r border-gray-100 dark:border-gray-700">
                                {lead.country || "-"}
                              </td>
                              <td className="px-3 py-3 text-sm whitespace-nowrap border-r border-gray-100 dark:border-gray-700">
                                <div
                                  className="max-w-[120px] truncate"
                                  title={lead.primarycategory || "-"}
                                >
                                  {lead.primarycategory || "-"}
                                </div>
                              </td>
                              <td className="px-3 py-3 text-sm whitespace-nowrap border-r border-gray-100 dark:border-gray-700">
                                <div
                                  className="max-w-[120px] truncate"
                                  title={lead.secondarycategory || "-"}
                                >
                                  {lead.secondarycategory || "-"}
                                </div>
                              </td>
                              <td className="px-3 py-3 text-sm whitespace-nowrap border-r border-gray-100 dark:border-gray-700">
                                {lead.created_at?.$date
                                  ? new Date(
                                      lead.created_at.$date
                                    ).toLocaleDateString("en-GB", {
                                      day: "2-digit",
                                      month: "2-digit",
                                      year: "numeric",
                                    })
                                  : lead.created_at
                                  ? new Date(
                                      lead.created_at
                                    ).toLocaleDateString("en-GB", {
                                      day: "2-digit",
                                      month: "2-digit",
                                      year: "numeric",
                                    })
                                  : "N/A"}
                              </td>
                              <td className="px-3 py-3 text-sm whitespace-nowrap border-r border-gray-100 dark:border-gray-700">
                                {lead.updated_at?.$date
                                  ? new Date(
                                      lead.updated_at.$date
                                    ).toLocaleDateString("en-GB", {
                                      day: "2-digit",
                                      month: "2-digit",
                                      year: "numeric",
                                    })
                                  : lead.updated_at
                                  ? new Date(
                                      lead.updated_at
                                    ).toLocaleDateString("en-GB", {
                                      day: "2-digit",
                                      month: "2-digit",
                                      year: "numeric",
                                    })
                                  : "N/A"}
                              </td>
                              <td className="px-3 py-3 text-sm whitespace-nowrap sticky right-0 bg-white dark:bg-gray-900 border-l-2 border-gray-300 dark:border-gray-600">
                                <button
                                  onClick={() =>
                                    handleUndelete(lead._id?.$oid || lead._id)
                                  }
                                  disabled={
                                    undeleting === (lead._id?.$oid || lead._id)
                                  }
                                  className="px-3 py-1 text-xs font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed rounded-md transition-colors duration-200 flex items-center gap-1"
                                >
                                  {undeleting ===
                                  (lead._id?.$oid || lead._id) ? (
                                    <>
                                      <svg
                                        className="animate-spin h-3 w-3"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                      >
                                        <circle
                                          className="opacity-25"
                                          cx="12"
                                          cy="12"
                                          r="10"
                                          stroke="currentColor"
                                          strokeWidth="4"
                                        ></circle>
                                        <path
                                          className="opacity-75"
                                          fill="currentColor"
                                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                      </svg>
                                      Restoring...
                                    </>
                                  ) : (
                                    <>↺ Undo</>
                                  )}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}

              {/* Delete Logs Tab */}
              {activeTab === "delete-logs" &&
                (deleteLogs.length === 0 ? (
                  <p className="text-gray-500 italic dark:text-gray-400">
                    No delete logs found.
                  </p>
                ) : (
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-gray-900">
                    <div className="overflow-x-auto overflow-y-hidden w-full">
                      <table className="w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                        <thead className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                          <tr>
                            <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                              Lead Name
                            </th>
                            <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                              Lead ID
                            </th>
                            <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                              Deleted By
                            </th>
                            <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                              Primary Category
                            </th>
                            <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                              Secondary Category
                            </th>
                            <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                              Deleted At
                            </th>
                            <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                              Reason
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100">
                          {deleteLogs.map((log, index) => (
                            <tr
                              key={index}
                              className="hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                              <td className="px-4 py-3 text-sm whitespace-nowrap">
                                {log.leadName || log.fullname || "N/A"}
                              </td>
                              <td className="px-4 py-3 text-sm whitespace-nowrap">
                                {log.lead_id || "N/A"}
                              </td>
                              <td className="px-4 py-3 text-sm whitespace-nowrap">
                                {log.deletedBy || "Unknown"}
                              </td>
                              <td className="px-4 py-3 text-sm whitespace-nowrap">
                                {log.primaryCategory ||
                                  log.primarycategory ||
                                  "-"}
                              </td>
                              <td className="px-4 py-3 text-sm whitespace-nowrap">
                                {log.secondaryCategory ||
                                  log.secondarycategory ||
                                  "-"}
                              </td>
                              <td className="px-4 py-3 text-sm whitespace-nowrap">
                                {log.deletedAt?.$date
                                  ? new Date(
                                      log.deletedAt.$date
                                    ).toLocaleDateString("en-GB", {
                                      day: "2-digit",
                                      month: "2-digit",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      second: "2-digit",
                                    })
                                  : log.deletedAt
                                  ? new Date(log.deletedAt).toLocaleDateString(
                                      "en-GB",
                                      {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        second: "2-digit",
                                      }
                                    )
                                  : "N/A"}
                              </td>
                              <td className="px-4 py-3 text-sm whitespace-nowrap">
                                {log.reason || "Not specified"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DeleteLogs;
