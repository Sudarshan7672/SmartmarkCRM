import { useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import BACKEND_URL from "../../configs/constants";

export default function GenerateReport() {
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [reportType, setReportType] = useState("source");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
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
        },
        {
          responseType: "blob",
          withCredentials: true,
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Lead_Report_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
      alert("Failed to generate report");
    } finally {
      setIsOpen(false);
      setLoading(false);
    }
  };

  const today = new Date();

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
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Generate Report</h2>

            <div className="mb-4">
              <label className="block mb-1 font-medium">Start Date:</label>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                className="w-full p-2 border rounded"
                dateFormat="yyyy-MM-dd"
                maxDate={today}
              />
            </div>

            <div className="mb-4">
              <label className="block mb-1 font-medium">End Date:</label>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                className="w-full p-2 border rounded"
                dateFormat="yyyy-MM-dd"
                maxDate={today}
                minDate={startDate || undefined}
              />
            </div>

            <div className="mb-4">
              <label className="block mb-1 font-medium">Report Type:</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="source">Source-wise</option>
                <option value="status">Status-wise</option>
                <option value="all">All Details</option>
              </select>
            </div>

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
