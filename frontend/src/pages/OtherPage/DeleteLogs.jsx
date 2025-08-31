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
      <div className="p-4 bg-white dark:bg-gray-900 min-h-screen w-full max-w-full overflow-hidden">
        <div className="w-full max-w-full">
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
            <div className="w-full max-w-full">
              {/* Deleted Leads Tab */}
              {activeTab === "deleted-leads" &&
                (deletedLeads.length === 0 ? (
                  <p className="text-gray-500 italic dark:text-gray-400">
                    No deleted leads found.
                  </p>
                ) : (
                  <div
                    className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-gray-900 w-full overflow-hidden"
                    style={{ maxWidth: "70vw" }}
                  >
                    <div className="overflow-x-auto">
                      <div className="min-w-max">
                        {/* Grid Header */}
                        <div
                          className="grid bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-sm font-medium border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10"
                          style={{
                            gridTemplateColumns:
                              "180px 200px 150px 250px 120px 180px 100px 100px 120px 100px 100px 100px 180px 180px 120px 120px 120px",
                          }}
                        >
                          <div className="px-3 py-3 border-r border-gray-200 dark:border-gray-700">
                            Lead ID
                          </div>
                          <div className="px-3 py-3 border-r border-gray-200 dark:border-gray-700">
                            Full Name
                          </div>
                          <div className="px-3 py-3 border-r border-gray-200 dark:border-gray-700">
                            Lead Owner
                          </div>
                          <div className="px-3 py-3 border-r border-gray-200 dark:border-gray-700">
                            Email
                          </div>
                          <div className="px-3 py-3 border-r border-gray-200 dark:border-gray-700">
                            Contact
                          </div>
                          <div className="px-3 py-3 border-r border-gray-200 dark:border-gray-700">
                            Company
                          </div>
                          <div className="px-3 py-3 border-r border-gray-200 dark:border-gray-700">
                            Source
                          </div>
                          <div className="px-3 py-3 border-r border-gray-200 dark:border-gray-700">
                            Status
                          </div>
                          <div className="px-3 py-3 border-r border-gray-200 dark:border-gray-700">
                            Territory
                          </div>
                          <div className="px-3 py-3 border-r border-gray-200 dark:border-gray-700">
                            Region
                          </div>
                          <div className="px-3 py-3 border-r border-gray-200 dark:border-gray-700">
                            State
                          </div>
                          <div className="px-3 py-3 border-r border-gray-200 dark:border-gray-700">
                            Country
                          </div>
                          <div className="px-3 py-3 border-r border-gray-200 dark:border-gray-700">
                            Primary Category
                          </div>
                          <div className="px-3 py-3 border-r border-gray-200 dark:border-gray-700">
                            Secondary Category
                          </div>
                          <div className="px-3 py-3 border-r border-gray-200 dark:border-gray-700">
                            Created At
                          </div>
                          <div className="px-3 py-3 border-r border-gray-200 dark:border-gray-700">
                            Updated At
                          </div>
                          <div className="px-3 py-3 bg-gray-100 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
                            Actions
                          </div>
                        </div>

                        {/* Grid Body */}
                        <div className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100">
                          {deletedLeads.map((lead) => (
                            <div
                              key={lead._id?.$oid || lead._id}
                              className="grid hover:bg-gray-50 dark:hover:bg-gray-800 text-sm"
                              style={{
                                gridTemplateColumns:
                                  "180px 200px 150px 250px 120px 180px 100px 100px 120px 100px 100px 100px 180px 180px 120px 120px 120px",
                              }}
                            >
                              <div className="px-3 py-3 border-r border-gray-100 dark:border-gray-700 font-medium truncate">
                                {lead.lead_id || "N/A"}
                              </div>
                              <div
                                className="px-3 py-3 border-r border-gray-100 dark:border-gray-700 truncate"
                                title={lead.fullname || "N/A"}
                              >
                                {lead.fullname || "N/A"}
                              </div>
                              <div
                                className="px-3 py-3 border-r border-gray-100 dark:border-gray-700 truncate"
                                title={lead.leadowner || "N/A"}
                              >
                                {lead.leadowner || "N/A"}
                              </div>
                              <div
                                className="px-3 py-3 border-r border-gray-100 dark:border-gray-700 truncate"
                                title={lead.email || "-"}
                              >
                                {lead.email || "-"}
                              </div>
                              <div className="px-3 py-3 border-r border-gray-100 dark:border-gray-700 truncate">
                                {lead.contact || "-"}
                              </div>
                              <div
                                className="px-3 py-3 border-r border-gray-100 dark:border-gray-700 truncate"
                                title={lead.company || "-"}
                              >
                                {lead.company || "-"}
                              </div>
                              <div className="px-3 py-3 border-r border-gray-100 dark:border-gray-700">
                                <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 truncate block">
                                  {lead.source || "N/A"}
                                </span>
                              </div>
                              <div className="px-3 py-3 border-r border-gray-100 dark:border-gray-700">
                                <span
                                  className={`px-2 py-1 text-xs rounded truncate block ${
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
                              </div>
                              <div className="px-3 py-3 border-r border-gray-100 dark:border-gray-700 truncate">
                                {lead.territory || "-"}
                              </div>
                              <div className="px-3 py-3 border-r border-gray-100 dark:border-gray-700 truncate">
                                {lead.region || "-"}
                              </div>
                              <div className="px-3 py-3 border-r border-gray-100 dark:border-gray-700 truncate">
                                {lead.state || "-"}
                              </div>
                              <div className="px-3 py-3 border-r border-gray-100 dark:border-gray-700 truncate">
                                {lead.country || "-"}
                              </div>
                              <div
                                className="px-3 py-3 border-r border-gray-100 dark:border-gray-700 truncate"
                                title={lead.primarycategory || "-"}
                              >
                                {lead.primarycategory || "-"}
                              </div>
                              <div
                                className="px-3 py-3 border-r border-gray-100 dark:border-gray-700 truncate"
                                title={lead.secondarycategory || "-"}
                              >
                                {lead.secondarycategory || "-"}
                              </div>
                              <div className="px-3 py-3 border-r border-gray-100 dark:border-gray-700 truncate">
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
                              </div>
                              <div className="px-3 py-3 border-r border-gray-100 dark:border-gray-700 truncate">
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
                              </div>
                              <div className="px-3 py-3 bg-white dark:bg-gray-900 border-l border-gray-100 dark:border-gray-700">
                                <button
                                  onClick={() =>
                                    handleUndelete(lead._id?.$oid || lead._id)
                                  }
                                  disabled={
                                    undeleting === (lead._id?.$oid || lead._id)
                                  }
                                  className="px-3 py-1 text-xs font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed rounded-md transition-colors duration-200 flex items-center gap-1 w-full justify-center"
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
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
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
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-gray-900 w-full overflow-hidden">
                    <div className="overflow-x-auto">
                      <div className="min-w-full">
                        {/* Grid Header */}
                        <div
                          className="grid bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-sm font-medium border-b border-gray-200 dark:border-gray-700"
                          style={{
                            gridTemplateColumns:
                              "minmax(150px, 1fr) minmax(100px, auto) minmax(120px, auto) minmax(150px, auto) minmax(150px, auto) minmax(160px, auto) minmax(120px, 1fr)",
                            gap: "1px",
                          }}
                        >
                          <div className="px-4 py-3 border-r border-gray-200 dark:border-gray-700">
                            Lead Name
                          </div>
                          <div className="px-4 py-3 border-r border-gray-200 dark:border-gray-700">
                            Lead ID
                          </div>
                          <div className="px-4 py-3 border-r border-gray-200 dark:border-gray-700">
                            Deleted By
                          </div>
                          <div className="px-4 py-3 border-r border-gray-200 dark:border-gray-700">
                            Primary Category
                          </div>
                          <div className="px-4 py-3 border-r border-gray-200 dark:border-gray-700">
                            Secondary Category
                          </div>
                          <div className="px-4 py-3 border-r border-gray-200 dark:border-gray-700">
                            Deleted At
                          </div>
                          <div className="px-4 py-3">Reason</div>
                        </div>

                        {/* Grid Body */}
                        <div className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100">
                          {deleteLogs.map((log, index) => (
                            <div
                              key={index}
                              className="grid hover:bg-gray-50 dark:hover:bg-gray-800 text-sm"
                              style={{
                                gridTemplateColumns:
                                  "minmax(150px, 1fr) minmax(100px, auto) minmax(120px, auto) minmax(150px, auto) minmax(150px, auto) minmax(160px, auto) minmax(120px, 1fr)",
                                gap: "1px",
                              }}
                            >
                              <div
                                className="px-4 py-3 border-r border-gray-100 dark:border-gray-700 truncate"
                                title={log.leadName || log.fullname || "N/A"}
                              >
                                {log.leadName || log.fullname || "N/A"}
                              </div>
                              <div className="px-4 py-3 border-r border-gray-100 dark:border-gray-700 truncate">
                                {log.lead_id || "N/A"}
                              </div>
                              <div
                                className="px-4 py-3 border-r border-gray-100 dark:border-gray-700 truncate"
                                title={log.deletedBy || "Unknown"}
                              >
                                {log.deletedBy || "Unknown"}
                              </div>
                              <div
                                className="px-4 py-3 border-r border-gray-100 dark:border-gray-700 truncate"
                                title={
                                  log.primaryCategory ||
                                  log.primarycategory ||
                                  "-"
                                }
                              >
                                {log.primaryCategory ||
                                  log.primarycategory ||
                                  "-"}
                              </div>
                              <div
                                className="px-4 py-3 border-r border-gray-100 dark:border-gray-700 truncate"
                                title={
                                  log.secondaryCategory ||
                                  log.secondarycategory ||
                                  "-"
                                }
                              >
                                {log.secondaryCategory ||
                                  log.secondarycategory ||
                                  "-"}
                              </div>
                              <div className="px-4 py-3 border-r border-gray-100 dark:border-gray-700 truncate">
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
                              </div>
                              <div
                                className="px-4 py-3 truncate"
                                title={log.reason || "Not specified"}
                              >
                                {log.reason || "Not specified"}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
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
