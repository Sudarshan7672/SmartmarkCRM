import React, { useEffect, useState, useRef } from "react";
import {
  Modal,
  TextField,
  MenuItem,
  Button,
  Checkbox,
  Tabs,
  Tab,
} from "@mui/material";
import axios from "axios";
import BACKEND_URL from "../../configs/constants";
import isEqual from "lodash/isEqual";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

const LeadFilterModal = ({ isOpen, onClose, filters, setFilters }) => {
  const [tab, setTab] = useState(0);
  const [primarycategory, setprimarycategory] = useState("");
  const [secondarycategory, setSecondarycategory] = useState("");
  const [leadowner, setLeadOwner] = useState("");
  const [source, setSource] = useState("");
  const [untouchedLeads, setUntouchedLeads] = useState(false);
  const [unassignedLeads, setUnassignedLeads] = useState(false);
  const [createdDateFrom, setCreatedDateFrom] = useState("");
  const [createdDateTo, setCreatedDateTo] = useState("");
  const [updatedDateFrom, setUpdatedDateFrom] = useState("");
  const [updatedDateTo, setUpdatedDateTo] = useState("");
  const [reenquiredDateFrom, setReenquiredDateFrom] = useState("");
  const [reenquiredDateTo, setReenquiredDateTo] = useState("");
  const [leadAgeFrom, setLeadAgeFrom] = useState("");
  const [leadAgeTo, setLeadAgeTo] = useState("");
  const [recentCountFrom, setRecentCountFrom] = useState("");
  const [recentCountTo, setRecentCountTo] = useState("");
  const [owners, setOwners] = useState([]);
  const previousOwnersRef = useRef([]);

  useEffect(() => {
    const savedFilters = localStorage.getItem("leadFilters");
    if (savedFilters) {
      const filters = JSON.parse(savedFilters);
      setprimarycategory(filters.primarycategory || "");
      setSecondarycategory(filters.secondarycategory || "");
      setLeadOwner(filters.leadOwner || "");
      setSource(filters.source || "");
      setUntouchedLeads(filters.untouchedLeads || false);
      setUnassignedLeads(filters.unassignedLeads || false);
      setCreatedDateFrom(filters.createdDateFrom || "");
      setCreatedDateTo(filters.createdDateTo || "");
      setUpdatedDateFrom(filters.updatedDateFrom || "");
      setUpdatedDateTo(filters.updatedDateTo || "");
      setReenquiredDateFrom(filters.reenquiredDateFrom || "");
      setReenquiredDateTo(filters.reenquiredDateTo || "");
      setLeadAgeFrom(filters.leadAgeFrom || "");
      setLeadAgeTo(filters.leadAgeTo || "");
      setRecentCountFrom(filters.recentCountFrom || "");
      setRecentCountTo(filters.recentCountTo || "");
    }
  }, []);

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/users/leadowners`);
        const newOwners = response.data;
        if (!isEqual(previousOwnersRef.current, newOwners)) {
          setOwners(newOwners);
          previousOwnersRef.current = newOwners;
        }
      } catch (error) {
        console.error("Error fetching owners:", error);
      }
    };
    fetchOwners();
  }, []);

  const handleApplyFilters = () => {
    setFilters({
      primarycategory,
      secondarycategory,
      leadowner,
      source,
      untouchedLeads,
      unassignedLeads,
      createdDateFrom,
      createdDateTo,
      updatedDateFrom,
      updatedDateTo,
      reenquiredDateFrom,
      reenquiredDateTo,
      leadAgeFrom,
      leadAgeTo,
      recentCountFrom,
      recentCountTo,
    });
    console.log("Filters applied:", {
      primarycategory,
      secondarycategory,
      leadowner,
      source,
      untouchedLeads,
      unassignedLeads,
      createdDateFrom,
      createdDateTo,
      updatedDateFrom,
      updatedDateTo,
      reenquiredDateFrom,
      reenquiredDateTo,
      leadAgeFrom,
      leadAgeTo,
      recentCountFrom,
      recentCountTo,
    });
    onClose();
  };

  const handleReset = () => {
    localStorage.removeItem("leadFilters");
    setprimarycategory("");
    setSecondarycategory("");
    setLeadOwner("");
    setSource("");
    setUntouchedLeads(false);
    setUnassignedLeads(false);
    setCreatedDateFrom("");
    setCreatedDateTo("");
    setUpdatedDateFrom("");
    setUpdatedDateTo("");
    setReenquiredDateFrom("");
    setReenquiredDateTo("");
    setLeadAgeFrom("");
    setLeadAgeTo("");
    setRecentCountFrom("");
    setRecentCountTo("");
  };

  return (
    <Modal open={isOpen} onClose={onClose}>
      <div className="max-w-3xl mx-auto p-6 scale-90 h-[500px] overflow-auto no-scrollbar bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-lg rounded-2xl transition-colors duration-300">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Tabs
            value={tab}
            onChange={(e, newTab) => setTab(newTab)}
            className="mb-4"
            TabIndicatorProps={{
              sx: {
                backgroundColor: "rgb(59 130 246)", // Tailwind blue-500
                ".dark &": {
                  backgroundColor: "rgb(147 197 253)", // lighter blue in dark mode
                },
              },
            }}
          >
            {["Lead Filters", "Date Filters", "Range Filters"].map(
              (label, index) => (
                <Tab
                  key={index}
                  label={label}
                  sx={{
                    color: "rgb(31 41 55)", // text-gray-800
                    "&.Mui-selected": {
                      color: "rgb(59 130 246)", // blue-500
                    },
                    ".dark &": {
                      color: "rgb(229 231 235)", // text-gray-200
                      "&.Mui-selected": {
                        color: "rgb(147 197 253)", // light blue
                      },
                    },
                  }}
                />
              )
            )}
          </Tabs>

          {tab === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 dark:text-white">
              <div className="col-span-2">
                <label className="flex items-center space-x-2 font-medium text-gray-800 dark:text-gray-200">
                  <Checkbox
                    checked={untouchedLeads}
                    onChange={(e) => setUntouchedLeads(e.target.checked)}
                    sx={{ color: "#4f46e5" }}
                  />
                  <span>Untouched Leads</span>
                </label>
                <label className="flex items-center space-x-2 font-medium text-gray-800 dark:text-gray-200">
                  <Checkbox
                    checked={unassignedLeads}
                    onChange={(e) => setUnassignedLeads(e.target.checked)}
                    sx={{ color: "#4f46e5" }}
                  />
                  <span>Unassigned Leads</span>
                </label>
              </div>

              <TextField
                label="Primary Category"
                select
                fullWidth
                size="small"
                value={primarycategory}
                onChange={(e) => setprimarycategory(e.target.value)}
                slotProps={{
                  inputLabel: {
                    sx: {
                      color: "black", // Light mode
                      ".dark &": { color: "white" }, // Dark mode (if using Tailwind's dark class)
                    },
                  },
                }}
              >
                <MenuItem value="sales">Sales</MenuItem>
                <MenuItem value="support">Support</MenuItem>
              </TextField>

              <TextField
                label="Secondary Category"
                select
                fullWidth
                size="small"
                value={secondarycategory}
                onChange={(e) => setSecondarycategory(e.target.value)}
                slotProps={{
                  inputLabel: {
                    sx: {
                      color: "black", // Light mode
                      ".dark &": { color: "white" }, // Dark mode (if using Tailwind's dark class)
                    },
                  },
                }}
              >
                <MenuItem value="group 1">Group 1</MenuItem>
                <MenuItem value="group 2">Group 2</MenuItem>
                <MenuItem value="group 3">Group 3</MenuItem>
                <MenuItem value="group 4">Group 4</MenuItem>
                <MenuItem value="group 5">Group 5</MenuItem>
                <MenuItem value="group 6">Group 6</MenuItem>
              </TextField>

              <TextField
                label="Lead Owner"
                select
                fullWidth
                size="small"
                value={leadowner}
                onChange={(e) => setLeadOwner(e.target.value)}
                slotProps={{
                  inputLabel: {
                    sx: {
                      color: "black", // Light mode
                      ".dark &": { color: "white" }, // Dark mode (if using Tailwind's dark class)
                    },
                  },
                }}
              >
                {owners.map((owner, index) => (
                  <MenuItem key={index} value={owner.name}>
                    {owner.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Source"
                select
                fullWidth
                size="small"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                slotProps={{
                  inputLabel: {
                    sx: {
                      color: "black", // Light mode
                      ".dark &": { color: "white" }, // Dark mode (if using Tailwind's dark class)
                    },
                  },
                }}
              >
                <MenuItem value="api lead">API Lead</MenuItem>
                <MenuItem value="chatbot">Chatbot</MenuItem>
                <MenuItem value="google ads">Google Ads</MenuItem>
                <MenuItem value="meta ad">Meta Ads</MenuItem>
                <MenuItem value="ivr">IVR</MenuItem>
                <MenuItem value="expo">Expo</MenuItem>
                <MenuItem value="sales team">Sales Team</MenuItem>
                <MenuItem value="walk-in">Walk-in</MenuItem>
                <MenuItem value="referral">Referral</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>
            </div>
          )}

          {tab === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 dark:text-white">
              {[
                "Added From",
                "Added To",
                "Updated From",
                "Updated To",
                "Re-enquired From",
                "Re-enquired To",
              ].map((label, idx) => {
                const setters = [
                  setCreatedDateFrom,
                  setCreatedDateTo,
                  setUpdatedDateFrom,
                  setUpdatedDateTo,
                  setReenquiredDateFrom,
                  setReenquiredDateTo,
                ];
                const values = [
                  createdDateFrom,
                  createdDateTo,
                  updatedDateFrom,
                  updatedDateTo,
                  reenquiredDateFrom,
                  reenquiredDateTo,
                ];
                return (
                  <DatePicker
                    key={idx}
                    label={label}
                    value={values[idx] ? dayjs(values[idx]) : null}
                    onChange={(val) =>
                      setters[idx](val ? val.format("YYYY-MM-DD") : "")
                    }
                    maxDate={dayjs()}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: "small",
                        sx: {
                          "& label": {
                            color: "black", // Default (light)
                            ".dark &": { color: "white" }, // Tailwind dark mode override
                          },
                          "& .MuiInputBase-input": {
                            color: "black",
                            ".dark &": { color: "white" },
                          },
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "gray",
                            ".dark &": { borderColor: "white" },
                          },
                        },
                      },
                    }}
                  />
                );
              })}
            </div>
          )}

          {tab === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "Lead Age From (days)",
                "Lead Age To (days)",
                "Recent Count From",
                "Recent Count To",
              ].map((label, idx) => {
                const setters = [
                  setLeadAgeFrom,
                  setLeadAgeTo,
                  setRecentCountFrom,
                  setRecentCountTo,
                ];
                const values = [
                  leadAgeFrom,
                  leadAgeTo,
                  recentCountFrom,
                  recentCountTo,
                ];
                return (
                  <TextField
                    key={idx}
                    label={label}
                    type="number"
                    fullWidth
                    size="small"
                    value={values[idx]}
                    slotProps={{
                      inputLabel: {
                        sx: {
                          color: "black", // Light mode
                          ".dark &": { color: "white" }, // Dark mode (if using Tailwind's dark class)
                        },
                      },
                    }}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || (/^\d+$/.test(val) && Number(val) >= 0))
                        setters[idx](val);
                    }}
                    InputLabelProps={{ className: "dark:text-gray-300" }}
                  />
                );
              })}
            </div>
          )}

          <div className="flex justify-between pt-4">
            <button
              onClick={handleReset}
              className="px-5 py-2 border border-gray-400 dark:border-gray-600 text-gray-800 dark:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              Reset
            </button>
            <button
              onClick={handleApplyFilters}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Apply Filters
            </button>
          </div>
        </LocalizationProvider>
      </div>
    </Modal>
  );
};

export default LeadFilterModal;
