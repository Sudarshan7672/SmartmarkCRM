import React, { useEffect, useState, useCallback, use } from "react";
import LeadCard from "./LeadCard";
import LeadUpdate from "../../components/Modals/LeadUpdate";
import axios from "axios";
import BACKEND_URL from "../../configs/constants";
import AddRemarkModal from "../../components/Modals/AddRemarkModal";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import DeleteLeadModal from "../../components/Modals/DeleteLeadModal";
import LeadFilterModal from "../../components/Modals/LeadFilterModal";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import Loading from "../../components/common/Loading";

const LeadManager = () => {
  const [leads, setLeads] = useState([]);
  const [status, setStatus] = useState("All");
  const [selectedLead, setSelectedLead] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRemarkModalOpen, setIsRemarkModalOpen] = useState(false);
  const [currentLeadId, setCurrentLeadId] = useState(null);
  const [isEditRemarkModalOpen, setIsEditRemarkModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [isDeleteRemarkModalOpen, setIsDeleteRemarkModalOpen] = useState(false);
  const [remarkToDelete, setRemarkToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit] = useState(20); // leads per page
  // const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // lead filters
  const [filters, setFilters] = useState(() => {
    const saved = localStorage.getItem("leadFilters");
    return saved
      ? JSON.parse(saved)
      : {
          primarycategory: "",
          secondarycategory: "",
          leadowner: "",
          source: "",
          untouchedLeads: false,
          createdDateFrom: "",
          createdDateTo: "",
          updatedDateFrom: "",
          updatedDateTo: "",
          reenquiredDateFrom: "",
          reenquiredDateTo: "",
          leadAgeFrom: "",
          leadAgeTo: "",
          recentCountFrom: "",
          recentCountTo: "",
        };
  });

  useEffect(() => {
    localStorage.setItem("leadFilters", JSON.stringify(filters));
  }, [filters]);
  useEffect(() => {
    setPage(1);
  }, [status, filters]);

  // useEffect(() => {
  //   fetchLeads();
  // }, [fetchLeads]);

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const [editingRemark, setEditingRemark] = useState({
    lead_id: null,
    remark_id: null,
    text: "",
  });

  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({});
  const [statusCounts, setStatusCounts] = useState({});

  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/auth/isauthenticated`, {
        withCredentials: true,
      })
      .then((response) => {
        setIsLoggedIn(response.data.isauthenticated);
        setUser(response.data.user);
        // console.log("User data:", response.data.user);
        if (!response.data.isauthenticated) {
          navigate("/");
        }
      })
      .catch((error) => {
        console.error("Error checking authentication:", error);
      });
  }, [navigate]);

  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${BACKEND_URL}/leads/get-leads`, {
        params: {
          status,
          filters: JSON.stringify(filters),
          page,
          limit,
        },
        withCredentials: true,
      });

      const { leads, statusCounts, totalCount, totalPages } = response.data;
      console.log("Fetched leads:", leads);

      setLeads(leads);
      setStatusCounts(statusCounts);
      setTotalCount(totalCount);
      setTotalPages(totalPages);
    } catch (err) {
      console.error("Failed to fetch leads:", err);
      setError("Failed to load leads. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [status, filters, page, limit]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const openDeleteModal = (leadId) => {
    setSelectedLeadId(leadId);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteLead = async (reason) => {
    try {
      await axios.delete(`${BACKEND_URL}/leads/delete/${selectedLeadId}`, {
        data: { leadID: selectedLeadId, reason },
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      });

      setLeads((prev) =>
        prev.filter((lead) => lead.lead_id !== selectedLeadId)
      );

      fetchLeads();
      setIsDeleteModalOpen(false); // <-- Corrected line
    } catch (error) {
      window.alert("Error deleting lead. Please try again later.");
      console.error(
        "Error deleting lead:",
        error.response?.data || error.message
      );
    }
  };

  const handleEditLead = (lead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  const handleUpdateLead = async (updatedLead) => {
    try {
      await axios.put(
        `${BACKEND_URL}/leads/update/${updatedLead.lead_id}`,
        updatedLead,
        { withCredentials: true }
      );
      setLeads((prev) =>
        prev.map((lead) =>
          lead.lead_id === updatedLead.lead_id ? updatedLead : lead
        )
      );
      setIsModalOpen(false);
    } catch (error) {
      console.error(
        "Error updating lead:",
        error.response?.data || error.message
      );
    }
  };

  // // REMARK HANDLERS
  // const handleAddRemark = async (lead_id) => {
  //   const text = prompt("Enter remark:");
  //   console.log(lead_id, text);
  //   if (!text) return;
  //   try {
  //     const res = await axios.post(`${BACKEND_URL}/remarks/${lead_id}`, { text });
  //     fetchLeads();
  //   } catch (error) {
  //     console.error("Error adding remark:", error.message);
  //   }
  // };

  const handleAddRemark = (lead_id) => {
    setCurrentLeadId(lead_id);
    setIsRemarkModalOpen(true);
  };

  const handleSubmitRemark = async (text) => {
    if (!text || !currentLeadId) return;
    try {
      console.log("Submitting remark:", text, currentLeadId);
      await axios.post(
        `${BACKEND_URL}/remarks/add`,
        {
          text: text,
          lead_id: currentLeadId,
        },
        {
          withCredentials: true,
        }
      );
      fetchLeads();
    } catch (error) {
      console.error("Error adding remark:", error.message);
    } finally {
      setIsRemarkModalOpen(false);
      setCurrentLeadId(null);
    }
  };

  const handleEditRemark = (lead_id, remark_id, text) => {
    setEditingRemark({ lead_id, remark_id, text });
    setIsEditRemarkModalOpen(true);
  };

  const handleDeleteRemark = async (lead_id, remark_id) => {
    // const confirmed = window.confirm(
    //   "Are you sure you want to delete this remark?"
    // );
    // if (!confirmed) return;
    try {
      await axios.delete(`${BACKEND_URL}/remarks/${lead_id}/${remark_id}`, {
        withCredentials: true,
      });
      fetchLeads();
    } catch (error) {
      console.error("Error deleting remark:", error.message);
    }
  };

  const statuses = [
    "All",
    "New",
    "Not-Connected",
    "Hot",
    "Cold",
    "Re-enquired",
    "Follow-up",
    "Converted",
    "Transferred-to-Dealer",
  ];

  return (
    <>
      <PageMeta
        title="Lead Manager"
        description="Manage your leads efficiently with our Lead Manager. View, edit, and track the status of your leads."
      />
      <div className="p-4">
        <div className="flex space-x-2 mb-4 overflow-x-auto scrollbar-hide">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-2 text-sm rounded-lg border ${
                status === s
                  ? "bg-blue-500 text-white"
                  : "bg-white text-blue-500 border-blue-500"
              } transition-all whitespace-nowrap`}
            >
              {s}
              {(() => {
                if (s === "All") {
                  const total = Object.values(statusCounts).reduce(
                    (acc, val) => acc + val,
                    0
                  );
                  return total > 0 ? (
                    <span className="ml-1 text-sm font-semibold">
                      ({total})
                    </span>
                  ) : null;
                } else {
                  return statusCounts[s] ? (
                    <span className="ml-1 text-sm font-semibold">
                      ({statusCounts[s]})
                    </span>
                  ) : null;
                }
              })()}
            </button>
          ))}
          {/* filter button */}
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-1 rounded shadow"
          >
            Filter Leads
          </button>
        </div>
        {/* filters */}

        <div className="grid grid-cols-1 gap-4">
          {leads.length > 0 ? (
            leads.map((lead) => (
              <LeadCard
                key={lead.lead_id}
                lead={lead}
                onDeleteLead={() => openDeleteModal(lead.lead_id)}
                onEditLead={() => handleEditLead(lead)}
                onAddRemark={handleAddRemark}
                onEditRemark={handleEditRemark}
                onDeleteRemark={handleDeleteRemark}
                fetchLeads={fetchLeads}
                user={user}
                isLoggedIn={isLoggedIn}
              />
            ))
          ) : (
            <div className="text-center text-gray-500">
              {isLoading ? <Loading /> : "No leads found."}
            </div>
          )}
        </div>
        <div className="flex justify-center items-center space-x-4 mt-6">
          <button
            disabled={page <= 1 || isLoading}
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            className={`px-4 py-2 rounded ${
              page <= 1 || isLoading
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            Prev
          </button>

          <span>
            Page {page} of {totalPages || 1}
          </span>

          <button
            disabled={page >= totalPages || isLoading}
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            className={`px-4 py-2 rounded ${
              page >= totalPages || isLoading
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            Next
          </button>
        </div>

        {/* delete lead modal */}
        {selectedLeadId && (
          <DeleteLeadModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onDelete={handleDeleteLead}
          />
        )}

        {/* add remark modal */}
        <AddRemarkModal
          isOpen={isRemarkModalOpen}
          onClose={() => {
            setIsRemarkModalOpen(false);
            setCurrentLeadId(null);
          }}
          onSubmit={handleSubmitRemark}
          user={user}
          isLoggedIn={isLoggedIn}
        />

        {/* edit lead modal */}
        {selectedLead && (
          <LeadUpdate
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            existingData={selectedLead} // ✅ Correct prop name
            onUpdate={handleUpdateLead}
          />
        )}

        {/* lead filter model */}
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <LeadFilterModal
            isOpen={isFilterModalOpen} // change isOpen → open
            onClose={() => setIsFilterModalOpen(false)}
            filters={filters} // pass filters
            setFilters={setFilters} // pass setter
            onApply={() => {
              setIsFilterModalOpen(false);
            }}
          />
        </LocalizationProvider>

        {/* edit remark modal */}
      </div>
    </>
  );
};

export default LeadManager;
