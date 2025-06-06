import React, { useState } from "react";

const DeleteLeadModal = ({ isOpen, onClose, onDelete }) => {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    if (!reason.trim()) {
      alert("Reason is required to delete the lead.");
      return;
    }
    onDelete(reason);
    setReason("");
  };

  const handleClose = () => {
    setReason("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center backdrop-blur-sm bg-transparent">
      <div className="bg-white p-6 rounded shadow-lg w-[90%] max-w-md">
        <h2 className="text-lg font-bold mb-4">Confirm Deletion</h2>
        <p className="mb-2">Please provide a reason for deleting this lead:</p>
        <textarea
          className="w-full border rounded p-2 mb-4"
          rows="3"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <button
            className="bg-gray-300 px-4 py-2 rounded"
            onClick={handleClose}
          >
            Cancel
          </button>
          <button
            className="bg-red-600 text-white px-4 py-2 rounded"
            onClick={handleConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteLeadModal;
