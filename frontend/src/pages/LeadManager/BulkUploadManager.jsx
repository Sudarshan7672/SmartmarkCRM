import React, { useState } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import { Stepper, Step, StepLabel, styled } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import Check from "@mui/icons-material/Check";
import BACKEND_URL from "../../configs/constants";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";

const BulkUploadManager = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/auth/isauthenticated`, {
        withCredentials: true,
      })
      .then((response) => {
        if (response.data.isauthenticated) {
          setIsLoggedIn(true);
          setUser(response.data.user);
          console.log("User data:", response.data.user.can_add_bulk_lead);
        } else {
          setIsLoggedIn(false);
          navigate("/");
        }
      })
      .catch((error) => {
        console.error("Error checking authentication:", error);
      });
  }, [navigate]);

  const CustomStepIconRoot = styled("div")(({ ownerState }) => ({
    backgroundColor: ownerState.active ? "#3b82f6" : "#cbd5e1",
    zIndex: 1,
    color: "#fff",
    width: 36,
    height: 36,
    display: "flex",
    borderRadius: "50%",
    justifyContent: "center",
    alignItems: "center",
    ...(ownerState.completed && {
      backgroundColor: "#10b981",
    }),
  }));

  function CustomStepIcon(props) {
    const { active, completed, icon } = props;

    const icons = {
      1: <InfoIcon />,
      2: <UploadFileIcon />,
      3: <FactCheckIcon />,
    };

    return (
      <CustomStepIconRoot ownerState={{ completed, active }}>
        {completed ? <Check /> : icons[String(icon)]}
      </CustomStepIconRoot>
    );
  }

  const [previewData, setPreviewData] = useState([]);
  const [fileType, setFileType] = useState("xlsx");
  const [file, setFile] = useState(null);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [validData, setValidData] = useState(false);
  const [isloading, setIsLoading] = useState(false);

  const requiredColumns = [
    // "leadowneremail",
    "source",
    "firstname",
    "lastname",
    "email",
    "contact",
  ];

  const validSources = [
  "api lead",
  "chatbot",
  "meta ad",
  "ivr",
  "expo",
  "sales team",
  "walk-in",
  "referral",
  "other"
];


  const handleTemplateDownload = () => {
    const templateUrl = `/format.${fileType}`;
    window.location.href = templateUrl;
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const workbook = XLSX.read(evt.target.result, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet);

      const columns = Object.keys(data[0] || {});
      const missingColumns = requiredColumns.filter(
        (col) => !columns.includes(col)
      );

      if (missingColumns.length > 0) {
        setError(`Missing required columns: ${missingColumns.join(", ")}`);
        setPreviewData([]);
        setValidData(false);
        setFile(null);
      } else {
        const invalidRows = data.filter(
          (row) =>
            !row.firstname?.trim() ||
            !row.lastname?.trim() ||
            // !row.leadowneremail?.trim() ||
            !row.source?.trim() ||
            !validSources.includes(row.source.trim().toLowerCase())
        );

        if (invalidRows.length > 0) {
          setError(
            "Some rows are missing required fields or have invalid source values. Valid sources are: api lead, chatbot, meta ad, ivr, expo, sales team, walk-in, referral, other."
          );
          setPreviewData([]);
          setValidData(false);
          setFile(null);
        } else {
          setError("");
          setPreviewData(data);
          setValidData(true);
          setStep(2);
        }
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleUpload = async () => {
    if (!validData || !file) {
      setError("Please validate the data before uploading.");
      return;
    }
    setIsLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      console.log("Uploading file:", file);
      for (let pair of formData.entries()) {
        console.log(pair[0] + ":", pair[1]);
      }

      const res = await axios.post(
        `${BACKEND_URL}/bulkupload/bulk-upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );
      

      if (res.data.message === "Leads uploaded and saved successfully") {
        setIsLoading(false);
        navigate("/manage-leads");
      }

      setPreviewData([]);
      setFile(null);
      setStep(0);
      setValidData(false);
      setError("");
      setFileType("xlsx");
    } catch (err) {
      console.error("Error uploading leads:", err);
      alert("Error uploading leads");
    }
  };

  return (
    <>
    <PageMeta
        title="Bulk Lead Upload"
        description="Upload multiple leads at once using a template file."
      />
    <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl mx-auto">
  <div className="mb-6">
    <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
      Bulk Lead Upload
    </h2>
    <Stepper activeStep={step} alternativeLabel>
      {["Info & Template", "Upload File", "Validation & Upload"].map((label, index) => (
        <Step key={index}>
          <StepLabel StepIconComponent={CustomStepIcon}>
            <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
          </StepLabel>
        </Step>
      ))}
    </Stepper>
  </div>

  {step === 0 && (
    <div className="text-gray-700 dark:text-gray-200">
      <p className="mb-4">
        Download a dummy template with required fields (e.g., Name, Contact).
      </p>
      <div className="flex items-center gap-3">
        <select
          value={fileType}
          onChange={(e) => setFileType(e.target.value)}
          className="border dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-3 py-2 rounded"
        >
          <option value="xlsx">Excel</option>
          <option value="csv">CSV</option>
        </select>
        <button
          onClick={handleTemplateDownload}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Download Template
        </button>
        <button
          onClick={() => setStep(1)}
          disabled={!user.can_add_bulk_lead}
          className={`bg-gray-500 text-white px-4 py-2 rounded ${
            user.can_add_bulk_lead ? "active hover:bg-gray-600" : "opacity-50 cursor-not-allowed"
          } ml-auto`}
        >
          Next
        </button>
      </div>
    </div>
  )}

  {step === 1 && (
    <div className="text-gray-700 dark:text-gray-200">
      <label className="block mb-2">Upload your filled template:</label>
      <input
        type="file"
        onChange={handleFileChange}
        accept=".xlsx,.xls,.csv"
        className="mb-4 border dark:border-gray-600 p-2 rounded w-full bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
      />
      {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
      <button
        onClick={() => setStep(0)}
        className="mr-2 bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
      >
        Back
      </button>
    </div>
  )}

  {step === 2 && previewData.length > 0 && (
    <div className="text-gray-700 dark:text-gray-200">
      <h3 className="font-bold mb-3 text-lg">Data Preview</h3>
      <div className="overflow-auto border dark:border-gray-700 rounded-lg max-h-[300px]">
        <table className="table-auto w-full">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              {Object.keys(previewData[0]).map((key, idx) => (
                <th
                  key={idx}
                  className="border dark:border-gray-700 px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300"
                >
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {previewData.map((row, idx) => (
              <tr
                key={idx}
                className="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-900 dark:even:bg-gray-800"
              >
                {Object.values(row).map((val, i) => (
                  <td
                    key={i}
                    className="border dark:border-gray-700 px-3 py-1 text-sm text-gray-800 dark:text-gray-200"
                  >
                    {val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => setStep(1)}
          className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
        >
          Back
        </button>
        <button
          onClick={handleUpload}
          className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700"
        >
          {isloading ? "Uploading..." : "Confirm & Upload"}
        </button>
      </div>
    </div>
  )}
</div>

    </>
  );
};

export default BulkUploadManager;
