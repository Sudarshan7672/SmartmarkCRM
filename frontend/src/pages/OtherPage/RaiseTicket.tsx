import { useState } from "react";
import axios from "axios";
import BACKEND_URL from "../../configs/constants"
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";


const RaiseTicket = () => {
  const [name, setName] = useState("");
  const [issue, setIssue] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    interface User {
      can_raise_ticket: boolean;
      [key: string]: any; // Add this to allow other properties if needed
    }

    const [user, setUser] = useState<User>({ can_raise_ticket: false });
  
    useEffect(() => {
      axios.get(`${BACKEND_URL}/auth/isauthenticated`, {
        withCredentials: true,
      }).then((response) => {
        setIsLoggedIn(response.data.isauthenticated);
        setUser(response.data.user);
        console.log("User data:", response.data.user);
        if (!response.data.isauthenticated) {
          navigate("/");
        }
      }).catch((error) => {
        console.error("Error checking authentication:", error);
      });
    }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate the form inputs
    if (!name || !issue || !description) {
      alert("All fields are required.");
      return;
    }

    setLoading(true);

    const ticketData = {
      name,
      issue,
      description,
    };

    try {
      // Send a POST request to your backend to raise the ticket
      const response = await axios.post(`${BACKEND_URL}/raiseticket/new`, ticketData);

      // Handle the response from the backend
      console.log(response.data);
      alert("Ticket raised successfully and email sent!");
      setName("");
      setIssue("");
      setDescription("");
    } catch (error) {
      console.error("Error submitting ticket:", error);
      alert("Failed to raise ticket.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Raise a Ticket</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Name</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Issue Type</label>
          <select
            className="w-full border p-2 rounded"
            value={issue}
            onChange={(e) => setIssue(e.target.value)}
          >
            <option value="">Select an issue</option>
            <option value="Login Issue">Login Issue</option>
            <option value="Data Missing">Data Missing</option>
            <option value="Bug Report">Bug Report</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">Description</label>
          <textarea
            className="w-full border p-2 rounded"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your issue in detail"
          />
        </div>

        {user.can_raise_ticket && (
          <div className="text-right">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Ticket"}
          </button>
        </div>
        )}
      </form>
    </div>
  );
};

export default RaiseTicket;
