import { useState } from "react";
import axios from "axios";
import BACKEND_URL from "../../configs/constants";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import ButtonLoader from "../../components/common/ButtonLoader";
import { toast } from "react-toastify";
// import { set } from "lodash";
type User = {
  can_add_individual_lead?: boolean;
  can_add_bulk_lead?: boolean;
  // add other user properties as needed
};

const LeadForm = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User>({});
  const [isLoading, setIsLoading] = useState(false);
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

  const [formData, setFormData] = useState({
    leadowner: "",
    source: "",
    fullname: "",
    email: "",
    contact: "",
    whatsapp: "",
    designation: "",
    company: "",
    address: "",
    territory: "",
    region: "",
    state: "",
    country: "",
    requirements: "",
    status: "New",
    primarycategory: "",
    secondarycategory: "",
    isfca: false,
    leadfor: "",
    ivrticketcode: "",
    isivrticketopen: false,
    warrantystatus: "",
    domesticorexport: "",
    referredby: "",
    referredto: "",
  });

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
    "West Bengal",
  ];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    });
  };

  // Validation functions
  // fullname
  const validatefullname = (name: string) => {
    const nameRegex = /^[a-zA-Z\s]+$/;
    return nameRegex.test(name);
  };

  // lastname
  // const validateLastName = (name: string) => {
  //   const nameRegex = /^[a-zA-Z\s]+$/;
  //   return nameRegex.test(name);
  // };

  // whatsapp
  // const validateWhatsappNumber = (number: string) => {
  //   const phoneRegex = /^[0-9]{10}$/;
  //   return phoneRegex.test(number);
  // };

  // contact
  const validatePhoneNumber = (number: string) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(number);
  };

  // email
  const validateEmail = (email: string) => {
    if (email.trim() === "") return true; // Accept empty
    const emailRegex =
      /^[a-zA-Z0-9](?:[a-zA-Z0-9._%+-]{0,63})@[a-zA-Z0-9-]+(?:\.[a-zA-Z]{2,})+$/;
    return emailRegex.test(email);
  };

  // designation
  const validateDesignation = (designation: string) => {
    const designationRegex = /^[a-zA-Z\s]+$/;
    return designationRegex.test(designation);
  };

  // country
  const validateCountry = (country: string) => {
    const countryRegex = /^[a-zA-Z\s]+$/;
    return countryRegex.test(country);
  };

  // ivrticketcode
  const validateIvrTicketCode = (code: string) => {
    const codeRegex = /^[a-zA-Z0-9]+$/;
    return codeRegex.test(code);
  };

  // refeerredby
  const validateReferredBy = (referredBy: string) => {
    const referredByRegex = /^[a-zA-Z\s]+$/; // Adjust regex as per your referred by format
    return referredByRegex.test(referredBy);
  };
  // referredto
  const validateReferredTo = (referredTo: string) => {
    const referredToRegex = /^[a-zA-Z\s]+$/; // Adjust regex as per your referred to format
    return referredToRegex.test(referredTo);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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

    setIsLoading(true);
    setMessage("");

    let leadResponse;
    try {
      // Step 1: Create Lead
      leadResponse = await axios.post(`${BACKEND_URL}/leads/add`, formData, {
        withCredentials: true,
      });
      // console.log("Lead added successfully:", leadResponse.data);
      toast.success("Lead added!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        theme: "colored",
      });
      setMessage("Lead added successfully");
      // Reset form data
      setFormData({
        leadowner: "",
        source: "",
        fullname: "",
        email: "",
        contact: "",
        whatsapp: "",
        designation: "",
        company: "",
        address: "",
        territory: "",
        region: "",
        state: "",
        country: "",
        requirements: "",
        status: "New",
        primarycategory: "",
        secondarycategory: "",
        isfca: false,
        leadfor: "",
        ivrticketcode: "",
        isivrticketopen: false,
        warrantystatus: "",
        domesticorexport: "",
        referredby: "",
        referredto: "",
      });
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error("Error submitting lead:", error);
      let errorMessage = "Something went wrong";
      if (axios.isAxiosError(error)) {
        errorMessage =
          error.response?.data?.error ||
          error.message ||
          "Something went wrong";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      setMessage(`Error: ${errorMessage}`);

      // Rollback lead creation if follow-up fails
      if (leadResponse?.data?._id) {
        await axios.delete(`${BACKEND_URL}/leads/${leadResponse.data._id}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta
        title="Add New Lead"
        description="Add a new lead to the system. Fill in the required details and submit the form."
      />
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-3 mt-1 border border-blue-300 dark:bg-gray-800 dark:text-white">
        <h2 className="text-xl font-semibold text-blue-600 mb-4">
          Add New Lead
        </h2>
        {message && <p className="text-center text-red-500">{message}</p>}

        <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-2">
          <select
            name="source"
            className="border border-gray-300 rounded px-3 py-2 dark:bg-gray-800 dark:text-white"
            onChange={handleChange}
            value={formData.source}
          >
            <option disabled value="">
              Source (Required)
            </option>
            {/* <option value="">Select Source</option> */}
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

          <select
            name="leadowner"
            className="border border-gray-300 rounded px-3 py-2 dark:bg-gray-800 dark:text-white"
            onChange={handleChange}
            value={formData.leadowner}
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

          <input
            type="text"
            name="fullname"
            placeholder="First Name (Required) *"
            required
            className="border border-gray-300 rounded px-3 py-2 dark:bg-gray-800 "
            onChange={handleChange}
            value={formData.fullname}
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            className="border border-gray-300 rounded px-3 py-2"
            onChange={handleChange}
            value={formData.email}
          />

          <input
            type="number"
            name="contact"
            placeholder="Contact (Required) *"
            required
            className="border border-gray-300 rounded px-3 py-2"
            onChange={handleChange}
            value={formData.contact}
          />

          <input
            type="number"
            name="whatsapp"
            placeholder="WhatsApp"
            className="border border-gray-300 rounded px-3 py-2"
            onChange={handleChange}
            value={formData.whatsapp}
          />

          <input
            type="text"
            name="designation"
            placeholder="Designation"
            className="border border-gray-300 rounded px-3 py-2"
            onChange={handleChange}
            value={formData.designation}
          />
          {/* dropdown for states */}
          <select
            name="state"
            className="border border-gray-300 rounded px-3 py-2 dark:bg-gray-800 dark:text-white"
            onChange={handleChange}
            value={formData.state}
          >
            <option disabled value="">
              Select State
            </option>
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>

          <input
            type="text"
            name="company"
            placeholder="Company"
            className="border border-gray-300 rounded px-3 py-2"
            onChange={handleChange}
            value={formData.company}
          />

          <textarea
            name="address"
            placeholder="Address"
            className="border border-gray-300 rounded px-3 py-2 resize-y"
            onChange={handleChange}
            value={formData.address}
          />

          <select
            name="territory"
            className="border border-gray-300 rounded px-3 py-2"
            onChange={handleChange}
            value={formData.territory}
          >
            <option value="" disabled>
              Select Territory
            </option>
            <option value="T1 - South and West">T1 - South and West</option>
            <option value="T2 - North, East and Central">
              T2 - North, East and Central
            </option>
          </select>

          <select
            name="region"
            className="border border-gray-300 rounded px-3 py-2"
            onChange={handleChange}
            value={formData.region}
          >
            <option value="" disabled>
              Select Region
            </option>
            <option value="east">East</option>
            <option value="west">West</option>
            <option value="north">North</option>
            <option value="south">South</option>
            <option value="central">Central</option>
          </select>

          <input
            type="text"
            name="country"
            placeholder="Country"
            className="border border-gray-300 rounded px-3 py-2"
            onChange={handleChange}
            value={formData.country}
          />

          <textarea
            name="requirements"
            placeholder="Requirements"
            className="border border-gray-300 rounded px-3 py-2 resize-y"
            onChange={handleChange}
            value={formData.requirements}
          />

          <select
            name="status"
            className="border border-gray-300 rounded px-3 py-2 dark:bg-gray-800 dark:text-white"
            onChange={handleChange}
            value={formData.status}
          >
            <option disabled value="">
              Select Status
            </option>
            <option value="New">New</option>
            <option value="Not-Connected">Not Connected</option>
            <option value="Hot">Hot</option>
            <option value="Cold">Cold</option>
            <option value="Re-enquired">Re-enquired</option>
            <option value="Follow-up">Follow-up</option>
            <option value="Converted">Converted</option>
            <option value="Transferred-to-Dealer">
              Transferred-to-Dealeers
            </option>
          </select>

          <select
            name="primarycategory"
            className="border border-gray-300 rounded px-3 py-2 dark:bg-gray-800 dark:text-white"
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

          <select
            name="secondarycategory"
            className="border border-gray-300 rounded px-3 py-2 dark:bg-gray-800 dark:text-white"
            onChange={handleChange}
            value={formData.secondarycategory}
          >
            <option disabled value="">
              Select Secondary Category
            </option>
            {[...Array(6)].map((_, index) => (
              <>
                <option key={`group-${index + 1}`} value={`group ${index + 1}`}>
                  Group {index + 1}
                </option>
              </>
            ))}
            {<option value="other">Other</option>}
          </select>
          <select
            name="leadfor"
            className="border border-gray-300 rounded px-3 py-2 dark:bg-gray-800 dark:text-white"
            onChange={handleChange}
            value={formData.leadfor}
          >
            <option disabled value="">
              Select Lead For
            </option>
            <option value="dotpeen">Dotpeen</option>
            <option value="laser">Laser</option>
            <option value="others">Others</option>
            {/* <option value="warranty">Warranty</option> */}
          </select>
          <select
            name="domesticorexport"
            className="border border-gray-300 rounded px-3 py-2 dark:bg-gray-800 dark:text-white"
            onChange={handleChange}
            value={formData.domesticorexport}
          >
            <option disabled value="">
              Domestic or export
            </option>
            <option value="domestic">Domestic</option>
            <option value="export">export</option>
          </select>

          <input
            type="text"
            name="ivrticketcode"
            placeholder="IVR Ticket Code"
            className="border border-gray-300 rounded px-3 py-2"
            onChange={handleChange}
            value={formData.ivrticketcode}
          />
          <select
            name="warrantystatus"
            className="border border-gray-300 rounded px-3 py-2 dark:bg-gray-800 dark:text-white"
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

          <input
            type="text"
            name="referredby"
            placeholder="Referred By"
            className="border border-gray-300 rounded px-3 py-2"
            onChange={handleChange}
            value={formData.referredby}
          />
          <input
            type="text"
            name="referredto"
            placeholder="Referred To"
            className="border border-gray-300 rounded px-3 py-2"
            onChange={handleChange}
            value={formData.referredto}
          />

          {/* Removed transferredto field as it doesn't exist in the schema */}

          {/* Checkbox for Is FCA */}
          <label className="flex items-center space-x-2 col-span-">
            <input
              type="checkbox"
              name="isfca"
              onChange={handleChange}
              checked={formData.isfca}
            />
            <span>Is FCA</span>
          </label>

          {/* Submit Button */}
          {user.can_add_individual_lead && isLoggedIn && (
            <div className="col-span-3">
              <button
                type="submit"
                className={`w-full h-[40px] text-white py-2 rounded-lg flex items-center justify-center
      ${
        isLoading
          ? "bg-blue-400 hover:bg-blue-400 cursor-not-allowed"
          : "bg-blue-600 hover:bg-blue-700"
      }`}
                disabled={isLoading}
              >
                {loading ? <ButtonLoader /> : "Add Lead"}
              </button>
            </div>
          )}
        </form>
      </div>
    </>
  );
};

export default LeadForm;
