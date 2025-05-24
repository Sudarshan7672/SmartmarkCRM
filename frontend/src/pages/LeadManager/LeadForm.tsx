import React, { useState } from "react";
import axios from "axios";
import BACKEND_URL from '../../configs/constants';
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
const LeadForm = () => {

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


  const [formData, setFormData] = useState({
    leadowneremail: "",
    source: "",
    firstname: "",
    lastname: "",
    email: "",
    contact: "",
    whatsapp: "",
    designation: "",
    company: "",
    address: "",
    Zone: "",
    country: "",
    requirements: "",
    status: "New",
    primarycategory: "",
    secondarycategory: "",
    isfca: false,
    referredby: "",
    referredto: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? e.target.checked : value,
    });
  };

  const validatePhoneNumber = (number) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(number);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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

    setLoading(true);
    setMessage("");

    try {
      // Step 1: Create Lead
      const leadResponse = await axios.post(`${BACKEND_URL}/leads/add`, formData,{
        withCredentials: true,
      });
      console.log("Lead added successfully:", leadResponse.data);
      setMessage("Lead added successfully");
      // Reset form data
      setFormData({
        leadowneremail: "",
        source: "",
        firstname: "",
        lastname: "",
        email: "",
        contact: "",
        whatsapp: "",
        designation: "",
        company: "",
        address: "",
        Zone: "",
        country: "",
        requirements: "",
        status: "New",
        primarycategory: "",
        secondarycategory: "",
        isfca: false,
        referredby: "",
        referredto: "",
      });
      
    } catch (error) {
      console.error("Error submitting lead:", error);
      const errorMessage = error.response?.data?.error || error.message || "Something went wrong";
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
    <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-3 mt-1 border border-blue-300">
      <h2 className="text-xl font-semibold text-blue-600 mb-4">Add New Lead</h2>
      {message && <p className="text-center text-red-500">{message}</p>}

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-2">

        <select name="source" className="border border-gray-300 rounded px-3 py-2" onChange={handleChange} value={formData.source}>
          <option disabled value="">Source (Required)</option>
          <option value="chatbot">Google Ads/Chatbot</option>
          <option value="expo">Expo</option>
          <option value="manual">Manual</option>
        </select>

        <select name="leadowneremail" className="border border-gray-300 rounded px-3 py-2" onChange={handleChange} value={formData.leadowneremail}>
          <option disabled value="">Select Leadowner Email (Required)</option>
          <option value="sudarshankakad7672@gmail.com">sudarshankakad7672@gmail.com</option>
          <option value="sudarshankakad7673@gmail.com">sudarshankakad7673@gmail.com</option>
        </select>
        
        <input type="text" name="firstname" placeholder="First Name (Required) *" required className="border border-gray-300 rounded px-3 py-2" onChange={handleChange} value={formData.firstname} />
        <input type="text" name="lastname" placeholder="Last Name (Required) *" required className="border border-gray-300 rounded px-3 py-2" onChange={handleChange} value={formData.lastname} />
        
        <input type="email" name="email" placeholder="Email (Required) *" required className="border border-gray-300 rounded px-3 py-2" onChange={handleChange} value={formData.email} />
        
        <input type="number" name="contact" placeholder="Contact (Required) *" required className="border border-gray-300 rounded px-3 py-2" onChange={handleChange} value={formData.contact} />

        <input type="number" name="whatsapp" placeholder="WhatsApp" className="border border-gray-300 rounded px-3 py-2" onChange={handleChange} value={formData.whatsapp} />
        
        <input type="text" name="designation" placeholder="Designation" className="border border-gray-300 rounded px-3 py-2" onChange={handleChange} value={formData.designation} />
        
        <input type="text" name="company" placeholder="Company" className="border border-gray-300 rounded px-3 py-2" onChange={handleChange} value={formData.company} />
        
        <textarea name="address" placeholder="Address" className="border border-gray-300 rounded px-3 py-2 resize-y" onChange={handleChange} value={formData.address} />

        <input type="text" name="Zone" placeholder="Zone" className="border border-gray-300 rounded px-3 py-2" onChange={handleChange} value={formData.Zone} />
        
        <input type="text" name="country" placeholder="Country" className="border border-gray-300 rounded px-3 py-2" onChange={handleChange} value={formData.country} />
        
        <textarea name="requirements" placeholder="Requirements" className="border border-gray-300 rounded px-3 py-2 resize-y" onChange={handleChange} value={formData.requirements} />
       

        <select name="status" className="border border-gray-300 rounded px-3 py-2" onChange={handleChange} value={formData.status}>
          <option disabled value="">Select Status</option>
          <option value="New">New</option>
          <option value="Not-Connected">Not Connected</option>
          <option value="Hot">Hot</option>
          <option value="Cold">Cold</option>
          <option value="Re-enquired">Re-enquired</option>
          <option value="Follow-up">Follow-up</option>
          <option value="Converted">Converted</option>
          <option value="Transferred-to-Dealer">Transferred-to-Dealeers</option>
        </select>

        <select name="primarycategory" className="border border-gray-300 rounded px-3 py-2" onChange={handleChange} value={formData.primarycategory}>
          <option disabled value="">Select Primary Category</option>
          <option value="sales">Sales</option>
          <option value="support">Support</option>
        </select>

        <select name="secondarycategory" className="border border-gray-300 rounded px-3 py-2" onChange={handleChange} value={formData.secondarycategory}>
          <option disabled value="">Select Secondary Category</option>
          {[...Array(6)].map((_, index) => (
            <option key={`group-${index + 1}`} value={`group ${index + 1}`}>Group {index + 1}</option>
          ))}
        </select>

        <input type='text' name='referredby' placeholder='Referred By' className='border border-gray-300 rounded px-3 py-2' onChange={handleChange} value={formData.referredby}/>
        <input type='text' name='referredto' placeholder='Referred To' className='border border-gray-300 rounded px-3 py-2' onChange={handleChange} value={formData.referredto}/>
        
        {/* Removed transferredto field as it doesn't exist in the schema */}
        
        {/* Checkbox for Is FCA */}
        <label className='flex items-center space-x-2 col-span-2'>
          <input type='checkbox' name='isfca' onChange={handleChange} checked={formData.isfca}/>
          <span>Is FCA</span>
        </label>

         {/* Submit Button */}
        {user.can_add_individual_lead && (
           <div className='col-span-2'>
           <button 
             type='submit' 
             className={`w-full ${loading ? 'bg-gray-400' : 'bg-blue-600'} text-white py-2 rounded-lg hover:bg-blue-${loading ? '400' : '700'}`} 
             disabled={loading}
           >
             {loading ? "Submitting..." : "Add Lead"}
           </button>
         </div>
         )}

       </form>
     </div>
    </>
   );
};

export default LeadForm;
