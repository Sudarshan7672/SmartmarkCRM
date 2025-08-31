// ...imports remain the same
import { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import BACKEND_URL from "../../configs/constants";

interface User {
  _id: string;
  fullname: string;
  username: string;
  role: string;
}

export default function GenerateReport() {
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [reportType, setReportType] = useState("comprehensive");
  const [fileType, setFileType] = useState("xlsx");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Filter states based on lead schema
  const [leadowner, setLeadowner] = useState("");
  const [status, setStatus] = useState("");
  const [territory, setTerritory] = useState("");
  // ...existing code...
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [company, setCompany] = useState("");
  const [source, setSource] = useState("");
  const [primaryCategory, setPrimaryCategory] = useState("");
  const [secondaryCategory, setSecondaryCategory] = useState("");
  const [leadFor, setLeadFor] = useState("");
  const [domesticOrExport, setDomesticOrExport] = useState("");
  const [isFca, setIsFca] = useState("");
  // ...existing code...
  const [isDeleted, setIsDeleted] = useState("");
  const [untouched, setUntouched] = useState("");
  const [hasFollowups, setHasFollowups] = useState("");
  const [hasRemarks, setHasRemarks] = useState("");

  const [allowedUsers, setAllowedUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Dynamic dropdown data
  const [availableStates, setAvailableStates] = useState<string[]>([]);
  const [availableCountries, setAvailableCountries] = useState<string[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [availableCompanies, setAvailableCompanies] = useState<string[]>([]);
  const [availableSources, setAvailableSources] = useState<string[]>([]);
  const [availableTerritories, setAvailableTerritories] = useState<string[]>(
    []
  );
  // ...existing code...
  const [availablePrimaryCategories, setAvailablePrimaryCategories] = useState<
    string[]
  >([]);
  const [availableSecondaryCategories, setAvailableSecondaryCategories] =
    useState<string[]>([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);

  const today = new Date();
  const maxRangeDays = 180;

  // Fetch users that current user can generate reports for
  useEffect(() => {
    const fetchAllowedUsers = async () => {
      if (!isOpen) return; // Only fetch when modal is open

      setLoadingUsers(true);
      try {
        const response = await axios.get(
          `${BACKEND_URL}/dashboard/users-for-reports`,
          {
            withCredentials: true,
          }
        );

        if (response.data.success) {
          setAllowedUsers(response.data.users);
        }
      } catch (error) {
        console.error("Error fetching allowed users:", error);
      } finally {
        setLoadingUsers(false);
      }
    };

    const fetchDropdownData = async () => {
      if (!isOpen) return; // Only fetch when modal is open

      setLoadingDropdowns(true);
      try {
        const response = await axios.get(
          `${BACKEND_URL}/dashboard/dropdown-data`,
          {
            withCredentials: true,
          }
        );

        if (response.data.success) {
          const data = response.data.data;
          setAvailableStates(data.states || []);
          setAvailableCountries(data.countries || []);
          setAvailableCities(data.cities || []);
          setAvailableCompanies(data.companies || []);
          setAvailableSources(data.sources || []);
          setAvailableTerritories(data.territories || []);
          setAvailablePrimaryCategories(data.primaryCategories || []);
          setAvailableSecondaryCategories(data.secondaryCategories || []);
        }
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
      } finally {
        setLoadingDropdowns(false);
      }
    };

    fetchAllowedUsers();
    fetchDropdownData();
  }, [isOpen]);

  const handleSubmit = async () => {
    setMessage("");
    if (!startDate || !endDate) {
      setMessage("Please select both start and end dates.");
      return;
    }
    const daysDiff = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
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
          // Lead filters
          leadowner,
          status,
          territory,
          state,
          country,
          city,
          company,
          source,
          primaryCategory,
          secondaryCategory,
          leadFor,
          domesticOrExport,
          isFca,
          isDeleted,
          untouched,
          hasFollowups,
          hasRemarks,
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
          setMessage(
            "❌ No response from server. Please check your connection."
          );
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
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center pt-[10vh] justify-center z-10">
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
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-4">
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
                  <option value="comprehensive">Comprehensive Report</option>
                  <option value="source">Source-wise Analysis</option>
                  <option value="status">Status-wise Analysis</option>
                  <option value="territory">Territory-wise Analysis</option>
                  <option value="category">Category-wise Analysis</option>
                  <option value="conversion">Conversion Analysis</option>
                  <option value="followup">Follow-up Analysis</option>
                  <option value="summary">Summary Report</option>
                  <option value="audit">Audit Trail Report</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 font-medium">File Format:</label>
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

            {/* Advanced Filters */}
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-3 text-gray-700 dark:text-gray-300">
                Advanced Filters
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                <div>
                  <label className="block mb-1 font-medium">Lead Owner:</label>
                  <select
                    value={leadowner}
                    onChange={(e) => setLeadowner(e.target.value)}
                    className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white"
                    disabled={loadingUsers}
                  >
                    <option value="">All</option>
                    {loadingUsers ? (
                      <option disabled>Loading users...</option>
                    ) : (
                      allowedUsers.map((user) => (
                        <option key={user._id} value={user.fullname}>
                          {user.fullname} ({user.role})
                        </option>
                      ))
                    )}
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
                  <label className="block mb-1 font-medium">Territory:</label>
                  <select
                    value={territory}
                    onChange={(e) => setTerritory(e.target.value)}
                    className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white"
                    disabled={loadingDropdowns}
                  >
                    <option value="">All</option>
                    {loadingDropdowns ? (
                      <option disabled>Loading...</option>
                    ) : (
                      availableTerritories.map((terr) => (
                        <option key={terr} value={terr}>
                          {terr}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-medium">Source:</label>
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white"
                    disabled={loadingDropdowns}
                  >
                    <option value="">All</option>
                    {loadingDropdowns ? (
                      <option disabled>Loading...</option>
                    ) : (
                      availableSources.map((src) => (
                        <option key={src} value={src}>
                          {src}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-medium">Country:</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white"
                    disabled={loadingDropdowns}
                  >
                    <option value="">All</option>
                    {loadingDropdowns ? (
                      <option disabled>Loading...</option>
                    ) : (
                      availableCountries.map((ctry) => (
                        <option key={ctry} value={ctry}>
                          {ctry}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-medium">State:</label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white"
                    disabled={loadingDropdowns}
                  >
                    <option value="">All</option>
                    {loadingDropdowns ? (
                      <option disabled>Loading...</option>
                    ) : (
                      availableStates.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-medium">City:</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white"
                    disabled={loadingDropdowns}
                  >
                    <option value="">All</option>
                    {loadingDropdowns ? (
                      <option disabled>Loading...</option>
                    ) : (
                      availableCities.map((ct) => (
                        <option key={ct} value={ct}>
                          {ct}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-medium">Company:</label>
                  <select
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white"
                    disabled={loadingDropdowns}
                  >
                    <option value="">All</option>
                    {loadingDropdowns ? (
                      <option disabled>Loading...</option>
                    ) : (
                      availableCompanies.map((comp) => (
                        <option key={comp} value={comp}>
                          {comp}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-medium">
                    Primary Category:
                  </label>
                  <select
                    value={primaryCategory}
                    onChange={(e) => setPrimaryCategory(e.target.value)}
                    className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white"
                    disabled={loadingDropdowns}
                  >
                    <option value="">All</option>
                    {loadingDropdowns ? (
                      <option disabled>Loading...</option>
                    ) : (
                      availablePrimaryCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-medium">
                    Secondary Category:
                  </label>
                  <select
                    value={secondaryCategory}
                    onChange={(e) => setSecondaryCategory(e.target.value)}
                    className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white"
                    disabled={loadingDropdowns}
                  >
                    <option value="">All</option>
                    {loadingDropdowns ? (
                      <option disabled>Loading...</option>
                    ) : (
                      availableSecondaryCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-medium">Lead For:</label>
                  <select
                    value={leadFor}
                    onChange={(e) => setLeadFor(e.target.value)}
                    className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">All</option>
                    <option value="Self">Self</option>
                    <option value="Client">Client</option>
                    <option value="Reseller">Reseller</option>
                    <option value="End-User">End User</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-medium">
                    Domestic/Export:
                  </label>
                  <select
                    value={domesticOrExport}
                    onChange={(e) => setDomesticOrExport(e.target.value)}
                    className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">All</option>
                    <option value="Domestic">Domestic</option>
                    <option value="Export">Export</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-medium">FCA Status:</label>
                  <select
                    value={isFca}
                    onChange={(e) => setIsFca(e.target.value)}
                    className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">All</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-medium">Lead Status:</label>
                  <select
                    value={isDeleted}
                    onChange={(e) => setIsDeleted(e.target.value)}
                    className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">All</option>
                    <option value="false">Active</option>
                    <option value="true">Deleted</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-medium">
                    Activity Status:
                  </label>
                  <select
                    value={untouched}
                    onChange={(e) => setUntouched(e.target.value)}
                    className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">All</option>
                    <option value="false">Touched</option>
                    <option value="true">Untouched</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-medium">Follow-ups:</label>
                  <select
                    value={hasFollowups}
                    onChange={(e) => setHasFollowups(e.target.value)}
                    className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">All</option>
                    <option value="true">Has Follow-ups</option>
                    <option value="false">No Follow-ups</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-medium">Remarks:</label>
                  <select
                    value={hasRemarks}
                    onChange={(e) => setHasRemarks(e.target.value)}
                    className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">All</option>
                    <option value="true">Has Remarks</option>
                    <option value="false">No Remarks</option>
                  </select>
                </div>
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
