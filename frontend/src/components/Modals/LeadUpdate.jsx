import React, { useState } from "react";
import axios from "axios";
import BACKEND_URL from "../../configs/constants";

const LeadUpdate = ({ isOpen, onClose, existingData }) => {
  const [formData, setFormData] = useState(existingData);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`${BACKEND_URL}/leads/update`, formData);
      // alert("Lead updated successfully!");
      onClose();
      window.location.reload();
    } catch (error) {
      console.error("Error updating lead:", error);
      alert("Failed to update lead.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-opacity-30 backdrop-blur-sm">
      <div className="max-w-5xl w-full bg-white shadow-lg rounded-lg p-6 border border-blue-400 relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-red-600 text-xl">&times;</button>
        <h2 className="text-2xl font-semibold text-blue-600 mb-4">Update Lead</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4">
          {/* Source */}
          <label className="flex flex-col font-medium">Source (Required)
            <select name="source" className="border rounded px-3 py-2 w-full" onChange={handleChange} value={formData.source} required>
              <option value="">Select Source</option>
              <option value="chatbot">Google Ads/Chatbot</option>
              <option value="expo">Expo</option>
              <option value="manual">Manual</option>
            </select>
          </label>
          {/* Lead Owner Email */}
          <label className="flex flex-col font-medium">Leadowner Email (Required)
            <select name="leadowneremail" className="border rounded px-3 py-2 w-full" onChange={handleChange} value={formData.leadowneremail} required>
              <option value="">Select Leadowner Email</option>
              <option value="sudarshankakad7672@gmail.com">sudarshankakad7672@gmail.com</option>
              <option value="sudarshankakad7673@gmail.com">sudarshankakad7673@gmail.com</option>
            </select>
          </label>
          
          {/* Other Fields */}
          {[
            { label: "First Name (Required)", name: "firstname", type: "text", required: true },
            { label: "Last Name (Required)", name: "lastname", type: "text", required: true },
            { label: "Email (Required)", name: "email", type: "email", required: true },
            { label: "Contact (Required)", name: "contact", type: "number", required: true },
            { label: "WhatsApp", name: "whatsapp", type: "number" },
            { label: "Designation", name: "designation", type: "text" },
            { label: "Company", name: "company", type: "text" },
            { label: "Address", name: "address", type: "textarea" },
            { label: "Zone", name: "Zone", type: "text" },
            { label: "Country", name: "country", type: "text" },
            { label: "Requirements", name: "requirements", type: "textarea" },
            { label: "Referred By", name: "referredby", type: "text" },
            { label: "Referred To", name: "referredto", type: "text" },
          ].map(({ label, name, type, required }) => (
            <label key={name} className="flex flex-col font-medium">
              {label}
              {type === "textarea" ? (
                <textarea name={name} className="border rounded px-3 py-2 w-full" onChange={handleChange} value={formData[name] || ""} />
              ) : (
                <input type={type} name={name} className="border rounded px-3 py-2 w-full" onChange={handleChange} value={formData[name] || ""} required={required} />
              )}
            </label>
          ))}
          
          {/* Primary & Secondary Category */}
          <label className="flex flex-col font-medium">Primary Category
            <select name="primarycategory" className="border rounded px-3 py-2 w-full" onChange={handleChange} value={formData.primarycategory}>
              <option value="">Select Primary Category</option>
              <option value="sales">Sales</option>
              <option value="support">Support</option>
            </select>
          </label>
          <label className="flex flex-col font-medium">Secondary Category
            <select name="secondarycategory" className="border rounded px-3 py-2 w-full" onChange={handleChange} value={formData.secondarycategory}>
              <option value="">Select Secondary Category</option>
              {[...Array(6)].map((_, index) => (
                <option key={index} value={`group ${index + 1}`}>Group {index + 1}</option>
              ))}
            </select>
          </label>
          
          {/* Status */}
          <label className="flex flex-col font-medium">Status
            <select name="status" className="border rounded px-3 py-2 w-full" onChange={handleChange} value={formData.status}>
              <option value="">Select Status</option>
              {["New", "Not-Connected", "Hot", "Cold", "Re-enquired", "Follow-up", "Converted", "Transferred-to-Dealer"].map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </label>
          
          {/* Is FCA Checkbox */}
          <label className="flex items-center space-x-2 font-medium">
            <input type="checkbox" name="isfca" onChange={handleChange} checked={formData.isfca} className="w-5 h-5" />
            <span>Is FCA</span>
          </label>
          
          <div className="col-span-2">
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700" disabled={loading}>
              {loading ? "Updating..." : "Update Lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeadUpdate;
