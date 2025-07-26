import React, { useState } from "react";
import axios from "axios";
import BACKEND_URL from "../../configs/constants";
import { toast } from "react-toastify";

const LeadUpdate = ({ isOpen, onClose, existingData }) => {
  const [formData, setFormData] = useState(existingData);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const states = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal"
];


  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Validation functions
  // fullname
  const validatefullname = (name) => {
    const nameRegex = /^[a-zA-Z\s]+$/;
    return nameRegex.test(name);
  };

  // lastname
  // const validateLastName = (name) => {
  //   const nameRegex = /^[a-zA-Z\s]+$/;
  //   return nameRegex.test(name);
  // };

  // whatsapp
  const validateWhatsappNumber = (number) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(number);
  };

  // contact
  const validatePhoneNumber = (number) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(number);
  };

  // email
  const validateEmail = (email) => {
    if (email.trim() === "") return true; // Accept empty
    const emailRegex =
      /^[a-zA-Z0-9](?:[a-zA-Z0-9._%+-]{0,63})@[a-zA-Z0-9-]+(?:\.[a-zA-Z]{2,})+$/;
    return emailRegex.test(email);
  };

  // designation
  const validateDesignation = (designation) => {
    const designationRegex = /^[a-zA-Z\s]+$/;
    return designationRegex.test(designation);
  };

  // country
  const validateCountry = (country) => {
    const countryRegex = /^[a-zA-Z\s]+$/;
    return countryRegex.test(country);
  };

  // ivrticketcode
  const validateIvrTicketCode = (code) => {
    const codeRegex = /^[a-zA-Z0-9]+$/;
    return codeRegex.test(code);
  };

  // refeerredby
  const validateReferredBy = (referredBy) => {
    const referredByRegex = /^[a-zA-Z\s]+$/; // Adjust regex as per your referred by format
    return referredByRegex.test(referredBy);
  };
  // referredto
  const validateReferredTo = (referredTo) => {
    const referredToRegex = /^[a-zA-Z\s]+$/; // Adjust regex as per your referred to format
    return referredToRegex.test(referredTo);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate phone numbers
    if (!validatePhoneNumber(formData.contact)) {
      setMessage("Invalid contact number (10 digits required)");
      return;
    }

    if (formData.whatsapp && !validatePhoneNumber(formData.whatsapp)) {
      setMessage("Invalid WhatsApp number (10 digits required)");
      return;
    }

    // Validate email
    if (!validateEmail(formData.email)) {
      setMessage("Invalid email address");
      return;
    }
    // Validate first name
    if (!validatefullname(formData.fullname)) {
      setMessage("Invalid first name (only letters and spaces allowed)");
      return;
    }
    // Validate last name
    // if (!validateLastName(formData.lastname)) {
    //   setMessage("Invalid last name (only letters and spaces allowed)");
    //   return;
    // }
    // Validate designation
    if (formData.designation && !validateDesignation(formData.designation)) {
      setMessage("Invalid designation (only letters and spaces allowed)");
      return;
    }
    // Validate country
    if (formData.country && !validateCountry(formData.country)) {
      setMessage("Invalid country (only letters and spaces allowed)");
      return;
    }
    // Validate IVR ticket code
    if (
      formData.ivrticketcode &&
      !validateIvrTicketCode(formData.ivrticketcode)
    ) {
      setMessage("Invalid IVR ticket code (alphanumeric allowed)");
      return;
    }
    // Validate referred by
    if (formData.referredby && !validateReferredBy(formData.referredby)) {
      setMessage("Invalid referred by (only letters and spaces allowed)");
      return;
    }
    // Validate referred to
    if (formData.referredto && !validateReferredTo(formData.referredto)) {
      setMessage("Invalid referred to (only letters and spaces allowed)");
      return;
    }

    setLoading(true);
    try {
      console.log("Submitting form data:", formData);
      await axios.put(`${BACKEND_URL}/leads/update`, formData, {
        withCredentials: true,
      });
      // alert("Lead updated successfully!");

      onClose();
      setTimeout(() => {
        window.location.reload(); // Reload the page to reflect the updated lead
      }, 1000);
      toast.success("Lead Updated!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        theme: "colored",
      });
    } catch (error) {
      console.error("Error updating lead:", error);
      alert("Failed to update lead.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex pt-20 pl-40 items-center justify-center bg-opacity-30 backdrop-blur-sm">
      <div className="max-w-5xl w-full bg-white dark:bg-gray-900 dark:text-white shadow-lg rounded-lg p-6 border border-blue-400 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-red-600 text-xl"
        >
          &times;
        </button>
        <h2 className="text-xl font-semibold text-blue-600 mb-4">
          Update Lead
        </h2>
        {message && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            <strong>Error:</strong> {message}
          </div>
        )}
        <form onSubmit={handleSubmit} className="grid grid-cols-5 gap-2">
          {/* Source */}
          <label className="flex flex-col font-medium">
            Source (Required)
            <select
              name="source"
              className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white"
              onChange={handleChange}
              value={formData.source}
              required
            >
              <option disabled value="">
                Select Source (Required)
              </option>
              <option value="api lead">API Lead</option>
              <option value="chatbot">Google Ads/Chatbot</option>
              <option value="meta ad">Meta Ads</option>
              <option value="ivr">IVR</option>
              <option value="expo">Expo</option>
              <option value="sales team">Sales Team</option>
              <option value="walk-in">Walk-in</option>
              <option value="referral">Referral</option>
              <option value="other">Other</option>
            </select>
          </label>
          {/* Lead Owner Email */}
          <label className="flex flex-col font-medium">
            Leadowner(Required)
            <select
              name="leadowner"
              className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white"
              onChange={handleChange}
              value={formData.leadowner}
              required
            >
              <option disabled value="">
                Select Leadowner (Required)
              </option>
              <option value="Aniket S. Kulkarni">Aniket S. Kulkarni</option>
              <option value="Bharat Kokatnur">Bharat Kokatnur</option>
              <option value="Aakansha Rathod">Aakansha Rathod</option>
              <option value="Prathamesh Mane">Prathamesh Mane</option>
              <option value="Shweta Giri">Shweta Giri</option>
              <option value="Sheela Swamy">Sheela Swamy</option>
              <option value="Harish Gosavi">Harish Gosavi</option>
              <option value="Dheeraj Sharma">Dheeraj Sharma</option>
              <option value="Rajesh Das">Rajesh Das</option>
              <option value="Abhishek Haibatpure">Abhishek Haibatpure</option>
            </select>
          </label>
          <label className="flex flex-col font-medium">
            Territory
            <select
              name="territory"
              className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white"
              onChange={handleChange}
              value={formData.territory}
            >
              <option disabled value="">
                Select Territory
              </option>
              <option value="T1 - South and West">T1 - South and West</option>
              <option value="T2 - North, East and Central">
                T2 - North, East and Central
              </option>
              {/* Add more if needed */}
            </select>
          </label>

          {/* for region */}
          <label className="flex flex-col font-medium">
            Region
            <select
              name="region"
              className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white"
              onChange={handleChange}
              value={formData.region}
            >
              <option disabled value="">
                Select Region
              </option>
              <option value="east">East</option>
              <option value="west">West</option>
              <option value="north">North</option>
              <option value="south">South</option>
              <option value="central">Central</option>
            </select>
          </label>

          {/* for state */}
          <label className="flex flex-col font-medium">
            State
            <select
              name="state"
              className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white"
              onChange={handleChange}
              value={formData.state}
            >
              <option value="">Select State</option>
              {states.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </label>

          {/* Other Fields */}
          {[
            {
              label: "Full Name (Required)",
              name: "fullname",
              type: "text",
              required: true,
            },
            {
              label: "Email ",
              name: "email",
              type: "email",
              required: false,
            },
            {
              label: "Contact (Required)",
              name: "contact",
              type: "number",
              required: true,
            },
            { label: "WhatsApp", name: "whatsapp", type: "number" },
            { label: "Designation", name: "designation", type: "text" },
            { label: "Company", name: "company", type: "textarea" },
            { label: "Country", name: "country", type: "textarea" },
            { label: "Address", name: "address", type: "textarea" },
            // { label: "territory", name: "territory", type: "text" },
            { label: "Requirements", name: "requirements", type: "textarea" },
            { label: "Referred By", name: "referredby", type: "textarea" },
            { label: "Referred To", name: "referredto", type: "text" },
          ].map(({ label, name, type, required }) => (
            <label key={name} className="flex flex-col font-medium">
              {label}
              {type === "textarea" ? (
                <textarea
                  name={name}
                  className="border rounded px-3 py-2 w-full"
                  onChange={handleChange}
                  value={formData[name] || ""}
                />
              ) : (
                <input
                  type={type}
                  name={name}
                  className="border rounded px-3 py-2 w-full"
                  onChange={handleChange}
                  value={formData[name] || ""}
                  required={required}
                />
              )}
            </label>
          ))}

          {/* Primary & Secondary Category */}
          <label className="flex flex-col font-medium">
            Primary Category
            <select
              name="primarycategory"
              className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white"
              onChange={handleChange}
              value={formData.primarycategory}
            >
              <option disabled value="">
                Select Primary Category
              </option>
              <option value="sales">Sales</option>
              <option value="support">Support</option>
              <option value="marketing">Marketing</option>
              <option value="other">other</option>
            </select>
          </label>
          <label className="flex flex-col font-medium">
            Secondary Category
            <select
              name="secondarycategory"
              className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white"
              onChange={handleChange}
              value={formData.secondarycategory}
            >
              <option disabled value="">
                Select Secondary Category
              </option>
              {[...Array(6)].map((_, index) => (
                <>
                  <option
                    key={`group-${index + 1}`}
                    value={`group ${index + 1}`}
                  >
                    Group {index + 1}
                  </option>
                </>
              ))}
              <option value="other">Other</option>
            </select>
          </label>

          {/* Status */}
          <label className="flex flex-col font-medium">
            Status
            <select
              name="status"
              className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white"
              onChange={handleChange}
              value={formData.status}
            >
              <option disabled value="">
                Select Status
              </option>
              {[
                "New",
                "Not-Connected",
                "Hot",
                "Cold",
                "Closed",
                "Re-enquired",
                "Follow-up",
                "Converted",
                "Transferred-to-Dealer",
              ].map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col font-medium">
            Lead for
            <select
              name="leadfor"
              className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white"
              onChange={handleChange}
              value={formData.leadfor}
            >
              <option disabled value="">
                Select Lead For
              </option>
              <option value="dotpeen">Dotpeen</option>
              <option value="laser">Laser</option>
              <option value="others">Others</option>
            </select>
          </label>

          {/* for domestic and export */}
          <label className="flex flex-col font-medium">
            Domestic/export
            <select
              name="domesticorexport"
              className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white"
              onChange={handleChange}
              value={formData.domesticorexport}
            >
              <option disabled value="">
                Select Domestic/export
              </option>
              <option value="domestic">Domestic</option>
              <option value="export">export</option>
            </select>
          </label>

          {/* ivr ticket code input */}
          <label className="flex flex-col font-medium">
            IVR Ticket Code
            <input
              type="text"
              name="ivrticketcode"
              className="border rounded px-3 py-2 w-full"
              onChange={handleChange}
              value={formData.ivrticketcode || ""}
            />
          </label>

          {/* select status warranty dropdown */}
          <label className="flex flex-col font-medium">
            Warranty Status
            <select
              name="warrantystatus"
              className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white"
              onChange={handleChange}
              value={formData.warrantystatus}
            >
              <option disabled value="">
                Select Warranty Status
              </option>
              <option value="underwarranty">Under Warranty</option>
              <option value="notunderwarranty">Not Under Warranty</option>
              <option value="underamc">Under AMC</option>
            </select>
          </label>

          {/* Is FCA Checkbox */}
          <label className="flex items-center space-x-2 font-medium pt-6 pl-5">
            <input
              type="checkbox"
              name="isfca"
              onChange={handleChange}
              checked={formData.isfca}
              className="w-5 h-5"
            />
            <span>Is FCA</span>
          </label>

          {/* isivrticketopen */}
          <label className="flex items-center space-x-2 font-medium pt-6 pl-6">
            <input
              type="checkbox"
              name="isivrticketopen"
              onChange={handleChange}
              checked={formData.isivrticketopen}
              className="w-5 h-5"
            />
            <span>Is IVR Ticket Open</span>
          </label>

          <div className="col-span-4 m-auto">
            <button
              type="submit"
              className="w-[200px] bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeadUpdate;
