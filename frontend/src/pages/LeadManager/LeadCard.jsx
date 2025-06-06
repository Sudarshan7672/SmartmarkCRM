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
import { toast } from "react-toastify"; // Optional for feedback
import AddFollowUp from "../../components/Modals/AddFollowUpModal";
import EditRemarkModal from "../../components/Modals/EditRemarkModal";
import DeleteRemarkModal from "../../components/Modals/DeleteRemarkModal";
import axios from "axios";
import BACKEND_URL from "../../configs/constants";
import PageMeta from "../../components/common/PageMeta";

const SECTIONS = {
  DETAILS: "details",
  REMARKS: "remarks",
};

const DetailCard = ({ icon, label, value }) => (
  <div className="flex items-center p-2 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition-all">
    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg mr-3">
      {icon}
    </div>
    <div>
      <p className="text-gray-500 dark:text-gray-400 text-xs">{label}</p>
      <p className="font-medium break-words text-gray-800 dark:text-white">
        {value}
      </p>
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
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [isDeleteRemarkModalOpen, setIsDeleteRemarkModalOpen] = useState(false);
  const [remarkToDelete, setRemarkToDelete] = useState({
    leadId: null,
    remarkId: null,
  });

  const [editingRemark, setEditingRemark] = useState({
    lead_id: null,
    remark_id: null,
    text: "",
  });

  const leadData = lead || {};

  const handleSubmitEditRemark = async (text) => {
    const { lead_id, remark_id } = editingRemark;
    try {
      await axios.put(
        `${BACKEND_URL}/remarks/${lead_id}/${remark_id}`,
        { text },
        {
          withCredentials: true,
        }
      );
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
        label: "contact",
        value: leadData.contact || "N/A",
      },
      {
        icon: <FaPhone className="text-green-500" />,
        label: "WhatsApp",
        value: leadData.whatsapp || "N/A",
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
        label: "territory",
        value: leadData.territory || "N/A",
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
        value:
          leadData.isfca !== undefined
            ? leadData.isfca
              ? "Yes"
              : "No"
            : "N/A",
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
          <DetailCard
            key={index}
            icon={item.icon}
            label={item.label}
            value={item.value}
            user={user}
          />
        ))}
      </div>
    );
  };

  const renderRemarks = () => (
    <div className="p-6 text-sm bg-white dark:bg-gray-900 rounded-xl max-h-[300px] overflow-auto shadow hover:shadow-lg transition-all">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-blue-600 dark:text-blue-400 flex items-center">
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
              className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg flex justify-between items-start"
            >
              <div className="flex flex-col text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <p className="break-words">{remark.remark}</p>
                <p className="text-blue-600 dark:text-blue-400">
                  {remark.remarkby}
                </p>
                <p className="text-gray-500 dark:text-gray-400">
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
                    className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition"
                  >
                    <FaEdit />
                  </button>
                )}
                {user.can_delete_remark && (
                  <button
                    title="Delete Remark"
                    aria-label="Delete Remark"
                    onClick={() => {
                      setRemarkToDelete({
                        leadId: leadData.lead_id,
                        remarkId: remark._id,
                      });
                      setIsDeleteRemarkModalOpen(true);
                    }}
                    className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
          No remarks available.
        </p>
      )}
    </div>
  );

  return (
    <>
      <PageMeta
        title="Lead Details"
        description="View and manage lead details, remarks, and follow-ups."
      />
      <div className="border p-6 rounded-2xl shadow-lg bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-gray-800 w-full hover:shadow-xl transition-all space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center p-3 rounded-xl bg-white dark:bg-gray-900 shadow hover:shadow-lg transition-all">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                  <FaUser className="text-blue-500 dark:text-blue-400" />
                  {leadData.firstname} {leadData.lastname} (
                  <span
                    className="cursor-pointer text-md text-blue-500 dark:text-blue-400 hover:underline"
                    onClick={() => {
                      navigator.clipboard.writeText(leadData.lead_id);
                      toast.success("Lead ID copied to clipboard!");
                    }}
                  >
                    {leadData.lead_id}
                  </span>
                  )
                </h2>
                <span className="text-sm/2 px-1.5 py-1.5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full font-medium">
                  {leadData.status || "N/A"}
                </span>
                <span className="text-sm/2 px-1.5 py-1.5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full font-medium">
                  Department - {leadData.primarycategory || "N/A"}
                </span>
                <span className="text-sm/2 px-1.5 py-1.5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full font-medium">
                  Group - {leadData.secondarycategory || "N/A"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex space-x-3 mt-4 md:mt-0">
            {user.can_edit_lead && (
              <button
                onClick={() => onEditLead(leadData.lead_id)}
                className="bg-yellow-500 text-white px-1.5 py-2 rounded-lg flex items-center gap- hover:bg-yellow-600 transition"
              >
                <FaEdit /> Edit
              </button>
            )}
            {user.can_delete_lead && (
              <button
                onClick={onDeleteLead}
                className="bg-red-500 text-white px-1.5 py-2 rounded-lg flex items-center gap-2 hover:bg-red-600 transition"
              >
                <FaTrash /> Delete
              </button>
            )}
            {user.can_add_followup && (
              <button
                onClick={() => setIsFollowUpModalOpen(true)}
                className="bg-blue-500 text-white px-1.5 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 transition"
              >
                <FaCalendarPlus />
                Follow Up
              </button>
            )}
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
                  ? "bg-blue-500 text-white shadow-lg shadow-blue-200 dark:shadow-blue-800 scale-105"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {section.charAt(0).toUpperCase() + section.slice(1)}
            </button>
          ))}
        </div>

        {/* Section Content */}
        <div className="bg-gray-50 dark:bg-gray-800 p-1 rounded-xl">
          {activeSection === SECTIONS.DETAILS
            ? renderDetails()
            : renderRemarks()}
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

        {isDeleteRemarkModalOpen && (
          <DeleteRemarkModal
            isOpen={isDeleteRemarkModalOpen}
            onClose={() => setIsDeleteRemarkModalOpen(false)}
            onDelete={async () => {
              await onDeleteRemark(
                remarkToDelete.leadId,
                remarkToDelete.remarkId
              );
              setIsDeleteRemarkModalOpen(false);
            }}
          />
        )}
      </div>
    </>
  );
}
