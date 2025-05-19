import { useState } from "react";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaBuilding,
  FaMapMarkerAlt,
  FaInfoCircle,
  FaEdit,
  FaTrash,
  FaPlus,
  FaCalendarPlus,
} from "react-icons/fa";
import AddFollowUp from "../../components/Modals/AddFollowUpModal";
import EditRemarkModal from "../../components/Modals/EditRemarkModal";
import axios from "axios";
import BACKEND_URL from "../../configs/constants";

const SECTIONS = {
  DETAILS: "details",
  REMARKS: "remarks",
};

const DetailCard = ({ icon, label, value }) => (
  <div className="flex items-center p-2 bg-white rounded-xl shadow hover:shadow-lg transition-all">
    <div className="p-2 bg-gray-100 rounded-lg mr-3">{icon}</div>
    <div>
      <p className="text-gray-500 text-xs">{label}</p>
      <p className="font-medium break-words">{value}</p>
    </div>
  </div>
);

export default function LeadCard({
  lead,
  onEditLead,
  onDeleteLead,
  onAddRemark,
  onEditRemark,
  onDeleteRemark,
  fetchLeads,
  user,
  isLoggedIn,
}) {
  const [activeSection, setActiveSection] = useState(SECTIONS.DETAILS);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [isEditRemarkModalOpen, setIsEditRemarkModalOpen] = useState(false);
  const [editingRemark, setEditingRemark] = useState({
    lead_id: null,
    remark_id: null,
    text: "",
  });

  const leadData = lead || {};

  const handleSubmitEditRemark = async (text) => {
    const { lead_id, remark_id } = editingRemark;
    try {
      await axios.put(`${BACKEND_URL}/remarks/${lead_id}/${remark_id}`, { text });
      await fetchLeads(); // Fetch leads again after editing remark
      // onEditRemark?.(); // Refresh remarks if handler is passed
    } catch (error) {
      console.error("Error editing remark:", error.message);
    } finally {
      setIsEditRemarkModalOpen(false);
      setEditingRemark({ lead_id: null, remark_id: null, text: "" });
    }
  };

  const renderDetails = () => {
    const items = [
      {
        icon: <FaEnvelope className="text-blue-500" />,
        label: "Email",
        value: leadData.email || "N/A",
      },
      {
        icon: <FaPhone className="text-green-500" />,
        label: "WhatsApp",
        value: leadData.contact || "N/A",
      },
      {
        icon: <FaBuilding className="text-purple-500" />,
        label: "Company",
        value: leadData.company || "N/A",
      },
      {
        icon: <FaMapMarkerAlt className="text-red-500" />,
        label: "Address",
        value: leadData.address || "N/A",
      },
      {
        icon: <FaInfoCircle className="text-blue-500" />,
        label: "Requirements",
        value: leadData.requirements || "N/A",
      },
      {
        icon: <FaInfoCircle className="text-blue-500" />,
        label: "Zone",
        value: leadData.Zone || "N/A",
      },
      {
        icon: <FaInfoCircle className="text-blue-500" />,
        label: "Country",
        value: leadData.country || "N/A",
      },
      {
        icon: <FaInfoCircle className="text-blue-500" />,
        label: "Designation",
        value: leadData.designation || "N/A",
      },
      {
        icon: <FaInfoCircle className="text-blue-500" />,
        label: "Is FCA",
        value: leadData.isfca !== undefined ? (leadData.isfca ? "Yes" : "No") : "N/A",
      },
      {
        icon: <FaInfoCircle className="text-blue-500" />,
        label: "Referred By",
        value: leadData.referredby || "N/A",
      },
      {
        icon: <FaInfoCircle className="text-blue-500" />,
        label: "Referred To",
        value: leadData.referredto || "N/A",
      },
      {
        icon: <FaInfoCircle className="text-blue-500" />,
        label: "Added At",
        value: leadData.created_at
          ? new Date(leadData.created_at).toLocaleString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })
          : "N/A",
      },
      {
        icon: <FaInfoCircle className="text-blue-500" />,
        label: "Last Updated At",
        value: leadData.updated_at
          ? new Date(leadData.updated_at).toLocaleString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })
          : "N/A",
      },
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-sm">
        {items.map((item, index) => (
          <DetailCard key={index} icon={item.icon} label={item.label} value={item.value} user={user} />
        ))}
      </div>
    );
  };

  const renderRemarks = () => (
    <div className="p-6 text-sm bg-white rounded-xl max-h-[300px] overflow-auto shadow hover:shadow-lg transition-all">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-blue-600 flex items-center">
          <FaInfoCircle className="mr-2" /> Remarks
        </h3>
        {user.can_add_remark && (
          <button
            onClick={() => onAddRemark(leadData.lead_id)}
            className="bg-blue-500 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 transition"
            aria-label="Add Remark"
          >
            <FaPlus /> Add Remark
          </button>
        )}
      </div>

      {leadData.remarks && leadData.remarks.length > 0 ? (
        <ul className="space-y-3">
          {leadData.remarks.map((remark) => (
            <li
              key={remark._id}
              className="p-3 bg-gray-100 rounded-lg flex justify-between items-start"
            >
              <div className="flex flex-col text-sm text-gray-700 space-y-1">
                <p className="break-words">{remark.remark}</p>
                <p className="text-blue-600">{remark.remarkby}</p>
                <p className="text-gray-500">
                  {new Date(remark.logtime).toLocaleString()}
                </p>
              </div>
              <div className="flex space-x-2 ml-4">
                {user.can_edit_remark && (
                  <button
                  title="Edit Remark"
                  aria-label="Edit Remark"
                  onClick={() => {
                    setEditingRemark({
                      lead_id: leadData.lead_id,
                      remark_id: remark._id,
                      text: remark.remark,
                    });
                    setIsEditRemarkModalOpen(true);
                  }}
                  className="text-blue-500 hover:text-blue-600 transition"
                >
                  <FaEdit />
                </button>
                )}
                {user.can_delete_remark && (
                  <button
                  title="Delete Remark"
                  aria-label="Delete Remark"
                  onClick={() => onDeleteRemark(leadData.lead_id, remark._id)}
                  className="text-red-500 hover:text-red-600 transition"
                >
                  <FaTrash />
                </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No remarks available.</p>
      )}
    </div>
  );

  return (
    <div className="border p-6 rounded-2xl shadow-lg bg-gradient-to-br from-white to-blue-50 w-full hover:shadow-xl transition-all space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center p-3 rounded-xl bg-white shadow hover:shadow-lg transition-all">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-blue-600 flex items-center gap-2">
                <FaUser className="text-blue-500" />
                {leadData.firstname} {leadData.lastname} ({leadData.lead_id})
              </h2>
              <span className="text-sm px-3 py-1.5 bg-green-100 text-green-800 rounded-full font-medium">
                {leadData.status || "N/A"}
              </span>
              <span className="text-sm px-3 py-1.5 bg-green-100 text-green-800 rounded-full font-medium">
                Department - {leadData.primarycategory || "N/A"}
              </span>
              <span className="text-sm px-3 py-1.5 bg-green-100 text-green-800 rounded-full font-medium">
                Group - {leadData.secondarycategory || "N/A"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex space-x-3 mt-4 md:mt-0">
          {user.can_edit_lead && (
            <button
            onClick={() => onEditLead(leadData.lead_id)}
            className="bg-yellow-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-yellow-600 transition"
          >
            <FaEdit /> Edit
          </button>
          )}
          {
            user.can_delete_lead &&(
              <button
            onClick={() => onDeleteLead(leadData.lead_id)}
            className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-600 transition"
          >
            <FaTrash /> Delete
          </button>
            )
          }
          {
            user.can_add_followup && (
              <button
            onClick={() => setIsFollowUpModalOpen(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 transition"
          >
            <FaCalendarPlus /> Add Follow Up
          </button>
            )
          }
        </div>
      </div>

      {/* Section Buttons */}
      <div className="flex justify-right space-x-4">
        {Object.values(SECTIONS).map((section) => (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            className={`px-6 py-2 rounded-2xl font-semibold transition-all duration-300 ${
              activeSection === section
                ? "bg-blue-500 text-white shadow-lg shadow-blue-200 scale-105"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            {section.charAt(0).toUpperCase() + section.slice(1)}
          </button>
        ))}
      </div>

      {/* Section Content */}
      <div className="bg-gray-50 p-1 rounded-xl">
        {activeSection === SECTIONS.DETAILS ? renderDetails() : renderRemarks()}
      </div>

      {/* Modals */}
      {isFollowUpModalOpen && (
        <AddFollowUp
          isOpen={isFollowUpModalOpen}
          onClose={() => setIsFollowUpModalOpen(false)}
          lead_id={leadData.lead_id}
        />
      )}
      <EditRemarkModal
        isOpen={isEditRemarkModalOpen}
        onClose={() => setIsEditRemarkModalOpen(false)}
        onSubmit={handleSubmitEditRemark}
        initialText={editingRemark.text}
      />
    </div>
  );
}
