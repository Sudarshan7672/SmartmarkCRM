// ...imports remain the same
import { useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import BACKEND_URL from "../../configs/constants";

export default function GenerateReport() {
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [reportType, setReportType] = useState("source");
  const [fileType, setFileType] = useState("xlsx");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [leadowner, setLeadowner] = useState("");
  const [status, setStatus] = useState("");
  const [territory, setterritory] = useState("");

  const today = new Date();
  const maxRangeDays = 180;

  const handleSubmit = async () => {
    setMessage("");
    if (!startDate || !endDate) {
      setMessage("Please select both start and end dates.");
      return;
    }
    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    if (daysDiff > maxRangeDays) {
      setMessage("Please select a date range within 31 days.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${BACKEND_URL}/reports/new`,
        {
          startDate,
          endDate,
          reportType,
          fileType,
          leadowner,
          status,
          territory,
        },
        { responseType: "blob", withCredentials: true }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Lead_Report_${Date.now()}.${fileType}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setMessage("✅ Report downloaded successfully!");
    } catch (err: unknown) {
  if (axios.isAxiosError(err)) {
    if (err.response && err.response.data instanceof Blob) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const json = JSON.parse(reader.result as string);
          setMessage(`❌ ${json.error || "Error generating report"}`);
        } catch (parseErr) {
          console.error("Failed to parse error blob:", parseErr);
          setMessage("❌ Failed to generate report (invalid error format)");
        }
      };
      reader.readAsText(err.response.data);
    } else if (err.response) {
      console.error("Backend error:", err.response.data);
      setMessage(`❌ ${err.response.data.error || "Unknown server error"}`);
    } else if (err.request) {
      console.error("No response received:", err.request);
      setMessage("❌ No response from server. Please check your connection.");
    } else {
      console.error("Axios error:", err.message);
      setMessage(`❌ ${err.message}`);
    }
  } else {
    console.error("Non-Axios error:", err);
    setMessage("❌ An unknown error occurred.");
  }
} finally {
      setLoading(false);
    }
  };

  const handleQuickPick = (range: "last7" | "thisMonth") => {
    const now = new Date();
    if (range === "last7") {
      const prev = new Date();
      prev.setDate(now.getDate() - 6);
      setStartDate(prev);
      setEndDate(now);
    } else if (range === "thisMonth") {
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      setStartDate(first);
      setEndDate(now);
    }
  };

  return (
    <>
      <div className="mb-4">
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded"
        >
          Generate Report
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-10">
          <div className="bg-white dark:bg-gray-900 text-black dark:text-white rounded-lg p-6 w-full max-w-3xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-blue-600">
              Generate Lead Report
            </h2>

            {/* Quick Picks */}
            <div className="flex gap-2 mb-4 text-sm">
              <button
                className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                onClick={() => handleQuickPick("last7")}
              >
                Last 7 Days
              </button>
              <button
                className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                onClick={() => handleQuickPick("thisMonth")}
              >
                This Month
              </button>
            </div>

            {/* Form Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block mb-1 font-medium">Start Date:</label>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white"
                  dateFormat="yyyy-MM-dd"
                  maxDate={today}
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">End Date:</label>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white"
                  dateFormat="yyyy-MM-dd"
                  maxDate={today}
                  minDate={startDate || undefined}
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Report Type:</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white"
                >
                  <option value="source">Source-wise</option>
                  <option value="status">Status-wise</option>
                  <option value="territory">Territory-wise</option>
                  <option value="country">Country-wise</option>
                  <option value="all">All Details</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 font-medium">Lead Owner:</label>
                <select
                  value={leadowner}
                  onChange={(e) => setLeadowner(e.target.value)}
                  className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white"
                >
                  <option value="">All</option>
                  <option value="Bharat Kokatnur">Bharat Kokatnur</option>
                  <option value="Aakansha Rathod">Aakansha Rathod</option>
                  <option value="Prathamesh Mane">Prathamesh Mane</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 font-medium">Status:</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white"
                >
                  <option value="">All</option>
                  <option value="New">New</option>
                  <option value="Not-Connected">Not-Connected</option>
                  <option value="Hot">Hot</option>
                  <option value="Cold">Cold</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Converted">Converted</option>
                  <option value="Transferred-to-Dealers">
                    Transferred-to-Dealers
                  </option>
                </select>
              </div>

              <div>
                <label className="block mb-1 font-medium">territory:</label>
                <select
                  value={territory}
                  onChange={(e) => setterritory(e.target.value)}
                  className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white"
                >
                  <option value="">All</option>
                  <option value="T1 - South and West">
                    T1 - South and West
                  </option>
                  <option value="T2 - North, East and Central">
                    T2 - North, East and Central
                  </option>
                </select>
              </div>

              <div>
                <label className="block mb-1 font-medium">Download As:</label>
                <select
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value)}
                  className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white"
                >
                  <option value="xlsx">Excel (.xlsx)</option>
                  <option value="csv">CSV (.csv)</option>
                  <option value="pdf">PDF (.pdf)</option>
                </select>
              </div>
            </div>

            {/* Message */}
            {message && (
              <div
                className={`text-sm mb-2 p-2 rounded ${
                  message.includes("❌")
                    ? "bg-red-100 text-red-600"
                    : "bg-green-100 text-green-600"
                }`}
              >
                {message}
              </div>
            )}

            {/* Footer */}
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {loading ? "Generating..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
