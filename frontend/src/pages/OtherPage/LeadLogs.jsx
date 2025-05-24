import React, { useState } from "react";
import axios from "axios";
import BACKEND_URL from "../../configs/constants";
import { FaSearch } from "react-icons/fa";
import PageMeta from "../../components/common/PageMeta";

// Helper to pretty print changes for complex fields
function renderChangeDetails(change) {
  const { field, oldValue, newValue } = change;

  // If both oldValue and newValue are arrays (e.g. followups, remarks)
  if (Array.isArray(oldValue) && Array.isArray(newValue)) {
    return (
      <>
        <div className="mt-1 mb-1 font-semibold text-gray-800">Old Value:</div>
        <ul className="list-disc ml-5 mb-2 max-h-48 overflow-auto bg-gray-100 p-2 rounded">
          {oldValue.length === 0 ? (
            <li className="italic text-gray-500">None</li>
          ) : (
            oldValue.map((item, idx) => (
              <li key={"old-" + idx} className="text-sm text-gray-700">
                {field === "followups" && (
                  <>
                    <strong>{item.title}</strong> — {new Date(item.followUpDate).toLocaleDateString()} — Status: {item.status}
                  </>
                )}
                {field === "remarks" && (
                  <>
                    "{item.remark}" by <em>{item.remarkby}</em> at {new Date(item.logtime).toLocaleString()}
                  </>
                )}
                {/* Add more field-specific formats here if needed */}
              </li>
            ))
          )}
        </ul>

        <div className="mt-1 mb-1 font-semibold text-green-800">New Value:</div>
        <ul className="list-disc ml-5 max-h-48 overflow-auto bg-green-100 p-2 rounded">
          {newValue.length === 0 ? (
            <li className="italic text-gray-500">None</li>
          ) : (
            newValue.map((item, idx) => (
              <li key={"new-" + idx} className="text-sm text-green-900">
                {field === "followups" && (
                  <>
                    <strong>{item.title}</strong> — {new Date(item.followUpDate).toLocaleDateString()} — Status: {item.status}
                  </>
                )}
                {field === "remarks" && (
                  <>
                    "{item.remark}" by <em>{item.remarkby}</em> at {new Date(item.logtime).toLocaleString()}
                  </>
                )}
              </li>
            ))
          )}
        </ul>
      </>
    );
  }

  // If oldValue/newValue are objects (like notification_logs, transferredtologs)
  if (typeof oldValue === "object" && oldValue !== null && typeof newValue === "object" && newValue !== null) {
    return (
      <>
        <div className="mt-1 mb-1 font-semibold text-gray-800">Old Value:</div>
        <pre className="bg-gray-100 p-2 rounded max-h-48 overflow-auto text-xs">{JSON.stringify(oldValue, null, 2)}</pre>

        <div className="mt-1 mb-1 font-semibold text-green-800">New Value:</div>
        <pre className="bg-green-100 p-2 rounded max-h-48 overflow-auto text-xs">{JSON.stringify(newValue, null, 2)}</pre>
      </>
    );
  }

  // Default fallback: primitive values
  return (
    <p className="inline">
      <span className="text-gray-700">{String(oldValue)}</span> →{" "}
      <span className="text-green-700">{String(newValue)}</span>
    </p>
  );
}

const LeadLogs = () => {
  const [leadId, setLeadId] = useState("");
  const [logs, setLogs] = useState(null);
  const [error, setError] = useState("");

  const fetchLogs = async () => {
    if (!leadId.trim()) {
      setError("Please enter a Lead ID to search.");
      setLogs(null);
      return;
    }

    try {
      const response = await axios.get(`${BACKEND_URL}/logs/${leadId.trim()}`);
      setLogs(response.data);
      setError("");
    } catch (err) {
      setError("Could not find logs for this Lead ID. Please check the ID and try again.");
      setLogs(null);
    }
  };

  return (
   <>
    <PageMeta
      title="Lead Logs"
      description="Search and view detailed logs for lead transfers and updates. Enter a Lead ID to retrieve its history."
    />
    <div className="min-h-screen bg-white p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-blue-700 mb-6">🔍 Search Lead Logs</h2>

      <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
        <input
          type="text"
          placeholder="Enter the Lead ID here"
          className="border border-blue-300 px-4 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-full sm:w-2/3"
          value={leadId}
          onChange={(e) => setLeadId(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchLogs()}
        />
        <button
          onClick={fetchLogs}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow flex items-center gap-2 transition-all duration-200"
        >
          <FaSearch /> Search
        </button>
      </div>

      {error && <p className="text-red-600 font-semibold mb-4">{error}</p>}

      {logs && (
        <><section>
        <h3 className="text-2xl font-semibold text-blue-700 mb-3">🔁 Transfer History</h3>
        {logs.transferLogs?.length > 0 ? (
          <ul className="space-y-4 max-h-[400px] overflow-auto">
            {logs.transferLogs.map((log, i) => (
              <li
                key={i}
                className="border border-blue-200 bg-blue-50 p-4 rounded-lg shadow-sm"
              >
                <p>
                  <strong>Transferred By:</strong> {log.transferredby.author} (
                  {log.transferredby.primarycategory} → {log.transferredby.secondarycategory})
                </p>
                <p>
                  <strong>Transferred To:</strong> {log.transferredto.author} (
                  {log.transferredto.primarycategory} → {log.transferredto.secondarycategory})
                </p>
                <p>
                  <strong>Reason / Remark:</strong> {log.remark || "None"}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  <strong>When:</strong> {new Date(log.logtime).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600 italic">No transfer records found for this lead.</p>
        )}
      </section>
          <section className="mb-10 mt-5">
            <h3 className="text-2xl font-semibold text-blue-700 mb-3">✏️ Updates History</h3>
            {logs.updateLogs?.length > 0 ? (
              <ul className="space-y-6 max-h-[400px] overflow-auto">
                {logs.updateLogs.map((log, i) => (
                  <li
                    key={i}
                    className="border border-blue-200 bg-blue-50 p-5 rounded-lg shadow-sm"
                  >
                    <p>
                      <strong>Who made changes:</strong> {log.updatedby}
                    </p>
                    <p>
                      <strong>Changed fields:</strong> {log.updatedfields.join(", ")}
                    </p>
                    <p>
                      <strong>Details of changes:</strong>
                    </p>
                    <div className="ml-5 text-sm text-blue-900">
                      {log.changes && log.changes.map((change, j) => (
                        <div key={j} className="mb-4">
                          <strong>{change.field}:</strong>
                          {renderChangeDetails(change)}
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 mt-3">
                      <strong>When:</strong> {new Date(log.logtime).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600 italic">No updates recorded for this lead.</p>
            )}
          </section>

          
        </>
      )}
    </div>
   </>
  );
};

export default LeadLogs;
