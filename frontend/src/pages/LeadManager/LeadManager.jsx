import React, { useEffect, useState, useCallback } from "react";
import LeadCard from "./LeadCard";
import LeadUpdate from "../../components/Modals/LeadUpdate";
import axios from "axios";
import BACKEND_URL from "../../configs/constants";
import AddRemarkModal from "../../components/Modals/AddRemarkModal";
import { useNavigate } from "react-router-dom";

const LeadManager = () => {
  const [leads, setLeads] = useState([]);
  const [status, setStatus] = useState("All");
  const [selectedLead, setSelectedLead] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRemarkModalOpen, setIsRemarkModalOpen] = useState(false);
  const [currentLeadId, setCurrentLeadId] = useState(null);
  const [isEditRemarkModalOpen, setIsEditRemarkModalOpen] = useState(false);
  const [editingRemark, setEditingRemark] = useState({
    lead_id: null,
    remark_id: null,
    text: "",
  });

  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({});

  useEffect(() => {
    axios.get(`${BACKEND_URL}/auth/isauthenticated`, {
      withCredentials: true,
    }).then((response) => {
      setIsLoggedIn(response.data.isauthenticated);
      setUser(response.data.user);
      console.log("User data:", response.data.user);
      if (!response.data.isauthenticated) {
        navigate("/");
      }
    }).catch((error) => {
      console.error("Error checking authentication:", error);
    });
  }, [navigate]);

  const fetchLeads = useCallback(async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/leads/get-leads`, {
        params: status !== "All" ? { status } : {},
      });
      setLeads(Array.isArray(response.data) ? response.data.reverse() : []);
    } catch (error) {
      console.error(
        "Error fetching leads:",
        error.response?.data || error.message
      );
      setLeads([]);
    }
  }, [status]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleDeleteLead = async (leadId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this lead?");
    if (!confirmDelete) return;
  
    try {
      await axios.delete(`${BACKEND_URL}/leads/delete/${leadId}`);
      setLeads((prev) => prev.filter((lead) => lead.lead_id !== leadId));
    } catch (error) {
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
        updatedLead
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
      await axios.post(`${BACKEND_URL}/remarks/add`, {
        text: text,
        lead_id: currentLeadId,
      });
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
    const confirmed = window.confirm(
      "Are you sure you want to delete this remark?"
    );
    if (!confirmed) return;
    try {
      await axios.delete(`${BACKEND_URL}/remarks/${lead_id}/${remark_id}`);
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
    <div className="p-4">
      <div className="flex space-x-2 mb-4 overflow-x-auto scrollbar-hide">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-4 py-2 rounded-lg border ${
              status === s
                ? "bg-blue-500 text-white"
                : "bg-white text-blue-500 border-blue-500"
            } transition-all`}
          >
            {s}
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
          <p className="text-center text-gray-500">
            Loading...
          </p>
        )}
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
  );
};

export default LeadManager;
