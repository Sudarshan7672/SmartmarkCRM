import React, { useState } from "react";
import axios from "axios";
import BACKEND_URL from "../../configs/constants"; // Import backend URL
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns"; // To format the date

const AddFollowUpModal = ({ isOpen, onClose, lead_id }) => {
  const [title, setTitle] = useState("");
  const [followUpDate, setFollowUpDate] = useState(null);
  const [status, setStatus] = useState("Pending");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formattedDate = followUpDate ? format(followUpDate, "yyyy-MM-dd") : "";

      await axios.post(`${BACKEND_URL}/followups/add`, {
        lead_id,
        title,
        followUpDate: formattedDate,
        status,
        notes,
      },{
        withCredentials: true,
      });

      window.location.reload();
    } catch (error) {
      console.error("Error adding follow-up:", error);
      alert("Failed to add follow-up.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-opacity-50 z-20 ">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 dark:bg-gray-900 dark:text-white">
        <h2 className="text-xl font-semibold mb-4">Add Follow-Up</h2>
        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="mb-4 ">
            <label className="block text-sm font-medium text-gray-700 dark:bg-gray-900 dark:text-white">Title (Required)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="border border-gray-300 rounded px-3 py-2 w-full"
            />
          </div>

          {/* Follow-Up Date (Date Picker) */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:bg-gray-900 dark:text-white">Follow-Up Date (Required)</label>
            <DatePicker
              selected={followUpDate}
              onChange={(date) => setFollowUpDate(date)}
              dateFormat="yyyy-MM-dd"
              minDate={new Date()} // Disable past dates
              className="border border-gray-300 rounded px-3 py-2 w-full"
              placeholderText="Select a date"
              required
            />
          </div>

          {/* Status Dropdown */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:bg-gray-900 dark:text-white">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 w-full"
            >
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Rescheduled">Rescheduled</option>
            </select>
          </div>

          {/* Notes */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:bg-gray-900 dark:text-white">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 w-full"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="bg-gray-300 text-gray-800 px-4 py-2 rounded">
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Follow-Up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFollowUpModal;
