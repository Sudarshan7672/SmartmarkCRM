import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import BACKEND_URL from "../../configs/constants";
import LeadCard from "../../pages/LeadManager/LeadCard";
import LeadUpdate from "../../components/Modals/LeadUpdate";
import AddRemarkModal from "../../components/Modals/AddRemarkModal";
import { useLocation, useNavigate } from "react-router-dom";
import  PageMeta  from "../../components/common/PageMeta";
import { set } from "lodash";
import Loading from "../../components/common/Loading";

const SearchLeads = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get("query") || "";

  const navigate = useNavigate();

  const [user, setUser] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [results, setResults] = useState([]);
  const [leads, setLeads] = useState([]);
  const [status, setStatus] = useState("All");
  const [statusCounts, setStatusCounts] = useState({});
  const [selectedLead, setSelectedLead] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRemarkModalOpen, setIsRemarkModalOpen] = useState(false);
  const [currentLeadId, setCurrentLeadId] = useState(null);
  const [isEditRemarkModalOpen, setIsEditRemarkModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingRemark, setEditingRemark] = useState({
    lead_id: null,
    remark_id: null,
    text: "",
  });

  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/auth/isauthenticated`, {
        withCredentials: true,
      })
      .then((response) => {
        setIsLoggedIn(response.data.isauthenticated);
        setUser(response.data.user);
        if (!response.data.isauthenticated) navigate("/");
      })
      .catch((error) => console.error("Auth check failed:", error));
  }, [navigate]);

  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/leads/get-leads`, {
        params: status !== "All" ? { status } : {},
        withCredentials: true,
      });

      const { leads, statusCounts } = response.data;
      setLeads(Array.isArray(leads) ? leads.reverse() : []);
      setStatusCounts(statusCounts || {});
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching leads:", error);
      setLeads([]);
      setStatusCounts({});
    }
  }, [status]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    if (!query.trim()) return;

    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(`${BACKEND_URL}/leads/search-leads`, {
          params: { query },
          withCredentials: true,
        });
        setResults(res.data || []);
        setIsLoading(false);
      } catch (err) {
        console.error("Search error:", err.message);
      }
    };

    fetchResults();
  }, [query]);

  const handleDeleteLead = async (leadId) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;
    setIsLoading(true);
    try {
      await axios.delete(`${BACKEND_URL}/leads/delete/${leadId}`,{
        withCredentials: true,
      });
      setLeads((prev) => prev.filter((lead) => lead.lead_id !== leadId));
      setIsLoading(false);
    } catch (error) {
      console.error("Error deleting lead:", error);
    }
  };

  const handleEditLead = (lead) => {
    setSelectedLead(lead);
    console.log("Selected Lead:", lead);
    setIsModalOpen(true);
  };

  const handleUpdateLead = async (updatedLead) => {
    setIsLoading(true);
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
      setIsLoading(false);
    } catch (error) {
      console.error("Error updating lead:", error);
    }
  };

  const handleAddRemark = (lead_id) => {
    setCurrentLeadId(lead_id);
    setIsRemarkModalOpen(true);
  };

  const handleSubmitRemark = async (text) => {
    if (!text || !currentLeadId) return;
    try {
      await axios.post(`${BACKEND_URL}/remarks/add`, {
        text,
        lead_id: currentLeadId,
      },{
        withCredentials: true,
      });
      fetchLeads();
    } catch (error) {
      console.error("Error adding remark:", error);
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
    if (!window.confirm("Are you sure you want to delete this remark?"))
      return;

    try {
      await axios.delete(`${BACKEND_URL}/remarks/${lead_id}/${remark_id}`,{
        withCredentials: true,
      });
      fetchLeads();
    } catch (error) {
      console.error("Error deleting remark:", error);
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
        title="Search Leads"
        description="Search for leads by name, phone number, or email."
      />
    <div className="p-4 space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Search Results</h2>
        <div className="grid grid-cols-1 gap-4">
          {results.length > 0 ? (
            results.map((lead) => (
              <LeadCard
                key={lead.lead_id}
                lead={lead}
                onDeleteLead={() => handleDeleteLead(lead.lead_id)}
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
            <p className="text-center text-gray-500">
              {isLoading ? <Loading /> : "No results found."}
            </p>
          )}
        </div>
      </div>

      <div>
        <div className="flex space-x-2 mb-4 overflow-x-auto scrollbar-hide">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-4 py-2 rounded-lg border ${
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
        </div>

        <div className="grid grid-cols-1 gap-4">
          {leads.length > 0 ? (
            leads.map((lead) => (
              <LeadCard
                key={lead.lead_id}
                lead={lead}
                onDeleteLead={() => handleDeleteLead(lead.lead_id)}
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
            <p className="text-center text-gray-500">No Leads Found.</p>
          )}
        </div>
      </div>

      {isModalOpen && selectedLead && (
        <LeadUpdate
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          existingData={selectedLead}
          onUpdateLead={handleUpdateLead}
          user={user}
          isLoggedIn={isLoggedIn}
        />
      )}

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
    </div>
    </>
  );
};

export default SearchLeads;
