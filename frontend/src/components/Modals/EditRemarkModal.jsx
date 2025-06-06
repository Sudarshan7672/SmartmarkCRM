import React, { useState, useEffect } from "react";
import Modal from "react-modal";

const EditRemarkModal = ({ isOpen, onClose, onSubmit, initialText }) => {
  const [text, setText] = useState("");

  useEffect(() => {
    setText(initialText || "");
  }, [initialText]);

  const handleSubmit = () => {
    if (text.trim()) {
      onSubmit(text);
    }
  };

  return (
    
      <Modal isOpen={isOpen} onRequestClose={onClose} className="p-6 bg-white rounded-lg shadow-2xl max-w-md mx-auto mt-[15%] outline-none">
      <h2 className="text-lg font-semibold mb-4">Edit Remark</h2>
      <textarea
        className="w-full border p-2 rounded mb-4"
        rows={4}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex justify-end space-x-2">
        <button onClick={onClose} className="px-4 py-2 border rounded bg-gray-200 hover:bg-gray-300">Cancel</button>
        <button onClick={handleSubmit} className="px-4 py-2 border rounded bg-blue-500 text-white hover:bg-blue-600">Update</button>
      </div>
    </Modal>
  
  );
};

export default EditRemarkModal;
