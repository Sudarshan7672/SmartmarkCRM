import { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";
import { Modal } from "../components/ui/modal";
import { useModal } from "../hooks/useModal";
import PageMeta from "../components/common/PageMeta";
import BACKEND_URL from "../configs/constants";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";

interface FollowUp {
  _id: string;
  title: string;
  followUpDate: string;
  status: string;
  notes?: string;
  leadId: string;
}

interface Lead {
  _id: string;
  name?: string;
  firstname?: string;
  lastname?: string;
  contact: string;
  email?: string;
  whatsapp?: string;
  lead_id?: string;
}

const Calendar = () => {
  const [selectedFollowUp, setSelectedFollowUp] = useState<FollowUp | null>(null);
  const [followUpTitle, setFollowUpTitle] = useState("");
  const [followUpDate, setFollowUpDate] = useState<Date | null>(null);
  const [followUpStatus, setFollowUpStatus] = useState("Pending");
  const [followUpNotes, setFollowUpNotes] = useState("");
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [leadDetails, setLeadDetails] = useState<Lead | null>(null);
  const calendarRef = useRef(null);
  const { isOpen, openModal, closeModal } = useModal();
  const [originalDate, setOriginalDate] = useState<Date | null>(null);

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
  const [confirmMessage, setConfirmMessage] = useState("");

  const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState({});
  
    useEffect(() => {
      axios.get(`${BACKEND_URL}/auth/isauthenticated`, {
        withCredentials: true,
      }).then((response) => {
        setIsLoggedIn(response.data.isauthenticated);
        setUser(response.data.user);
        // console.log("User data:", response.data.user);
        if (!response.data.isauthenticated) {
          navigate("/");
        }
      }).catch((error) => {
        console.error("Error checking authentication:", error);
      });
    }, [navigate]);

  useEffect(() => {
    fetchFollowUps();
  }, []);

  const fetchFollowUps = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/followups`,{
        withCredentials: true,
      });
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const updatedFollowUps = response.data.map((followUp: FollowUp) => {
        const date = new Date(followUp.followUpDate);
        date.setHours(0, 0, 0, 0);

        let className = "bg-yellow-400";
        if (followUp.status === "Rescheduled") {
          className = "bg-orange-500";
        } else if (followUp.status === "Pending") {
          if (date < today) className = "bg-red-500";
          else if (date.getTime() === today.getTime()) className = "bg-blue-500";
        } else if (followUp.status === "Completed") {
          className = "bg-green-500";
        }

        return {
          id: followUp._id,
          title: followUp.title,
          start: followUp.followUpDate,
          status: followUp.status,
          notes: followUp.notes,
          leadId: followUp.leadId,
          className,
        };
      });

      setFollowUps(updatedFollowUps);
    } catch (error) {
      console.error("Error fetching follow-ups:", error);
    }
  };

  const handleDateSelect = (selectInfo: any) => {
    resetModalFields();
    setFollowUpDate(new Date(selectInfo.startStr));
    openModal();
  };

  const handleFollowUpClick = async (clickInfo: any) => {
    const followUp = clickInfo.event;
    const leadId = followUp.extendedProps.leadId;
    const followUpDate = new Date(followUp.startStr);

    setSelectedFollowUp({
      _id: followUp.id,
      title: followUp.title,
      followUpDate: followUp.startStr,
      status: followUp.extendedProps.status,
      notes: followUp.extendedProps.notes || "",
      leadId,
    });

    setFollowUpTitle(followUp.title);
    setFollowUpDate(followUpDate);
    setOriginalDate(followUpDate);
    setFollowUpStatus(followUp.extendedProps.status);
    setFollowUpNotes(followUp.extendedProps.notes || "");

    try {
      const resolvedLeadId = typeof leadId === "object" ? leadId._id : leadId;
      const res = await axios.get(`${BACKEND_URL}/leads/${resolvedLeadId}`,{
        withCredentials: true,
      });
      setLeadDetails(res.data);
    } catch (err) {
      setLeadDetails(null);
    }

    openModal();
  };

  const confirmDeleteFollowUp = () => {
    if (!selectedFollowUp) return;

    setConfirmMessage(`Are you sure you want to delete the follow-up titled "${selectedFollowUp.title}"?`);
    setConfirmAction(() => async () => {
      try {
        await axios.delete(`${BACKEND_URL}/followups/${selectedFollowUp._id}`,{
          withCredentials: true,
        });
        fetchFollowUps();
        closeModal();
        resetModalFields();
      } catch (error) {
        console.error("Error deleting follow-up:", error);
      } finally {
        setConfirmModalOpen(false);
      }
    });
    setConfirmModalOpen(true);
  };

  const handleAddOrUpdateFollowUp = async () => {
    const formattedDate = followUpDate?.toISOString();

    if (selectedFollowUp) {
      const isDateChanged = originalDate && followUpDate?.toISOString() !== originalDate.toISOString();
      const newStatus = isDateChanged ? "Rescheduled" : followUpStatus;

      setConfirmMessage(`Are you sure you want to update the follow-up titled "${selectedFollowUp.title}"?`);
      setConfirmAction(() => async () => {
        try {
          await axios.put(`${BACKEND_URL}/followups/${selectedFollowUp._id}`, {
            title: followUpTitle,
            followUpDate: formattedDate,
            status: newStatus,
            notes: followUpNotes,
          },{
            withCredentials: true,
          });
          fetchFollowUps();
          closeModal();
          resetModalFields();
        } catch (error) {
          console.error("Error updating follow-up:", error);
        } finally {
          setConfirmModalOpen(false);
        }
      });
      setConfirmModalOpen(true);
    } else {
      try {
        await axios.post(`${BACKEND_URL}/follow-ups`, {
          title: followUpTitle,
          followUpDate: formattedDate,
          status: followUpStatus,
          notes: followUpNotes,
        },{
          withCredentials: true,
        });
        fetchFollowUps();
        closeModal();
        resetModalFields();
      } catch (error) {
        console.error("Error creating follow-up:", error);
      }
    }
  };

  const resetModalFields = () => {
    setFollowUpTitle("");
    setFollowUpDate(null);
    setFollowUpStatus("Pending");
    setFollowUpNotes("");
    setSelectedFollowUp(null);
    setOriginalDate(null);
    setLeadDetails(null);
  };

  const ConfirmModal = ({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) => (
    <Modal isOpen={true}  onClose={onCancel} className="w-full max-w-md mx-auto">
      <div className="bg-white p-10 rounded-2xl max-w-md mx-auto shadow-2xl">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Please Confirm</h3>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium">Confirm</button>
        </div>
      </div>
    </Modal>
  );

  return (
    <>
      <PageMeta title="Follow-up Manager" description="Manage your follow-ups and schedules." />
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-lg">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{ left: "prev,next", center: "title", right: "dayGridMonth,timeGridWeek,timeGridDay" }}
          events={followUps}
          selectable
          // select={handleDateSelect}
          eventClick={handleFollowUpClick}
          // customButtons={{ addFollowUpButton: { text: "Add Follow-Up +", click: openModal } }}
        />
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} user={user}>
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto p-6 md:p-8 transition-all duration-300">
            <h2 className="mb-2 text-2xl font-semibold text-gray-900 text-center">
              {selectedFollowUp ? "Edit Follow-Up" : "Add Follow-Up"}
            </h2>
            <p className="mb-6 text-sm text-gray-500 text-center">
              {selectedFollowUp ? "Modify the follow-up details." : "Fill out the form to add a new follow-up."}
            </p>

            {leadDetails && (
              <div className="mb-4 p-4 bg-gray-100 rounded-lg shadow-sm">
                <h3 className="text-sm font-semibold text-gray-700">Lead Info</h3>
                <p className="text-sm text-gray-600">Name: {leadDetails.firstname} {leadDetails.lastname}</p>
                <p className="text-sm text-gray-600">Lead ID: {leadDetails.lead_id}</p>
                <p className="text-sm text-gray-600">Contact: {leadDetails.contact}</p>
                <p className="text-sm text-gray-600">Email: {leadDetails.email}</p>
                {leadDetails.whatsapp && <p className="text-sm text-gray-600">Whatsapp: {leadDetails.whatsapp}</p>}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Title</label>
                <input type="text" placeholder="e.g. Call after demo" value={followUpTitle} onChange={(e) => setFollowUpTitle(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 focus:outline-none" />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Follow-Up Date</label>
                <DatePicker selected={followUpDate} onChange={(date: Date | null) => setFollowUpDate(date)} minDate={new Date()} className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 focus:outline-none" dateFormat="yyyy-MM-dd" placeholderText="Select date" />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Status</label>
                <select value={followUpStatus} onChange={(e) => setFollowUpStatus(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 focus:outline-none">
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Rescheduled">Rescheduled</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Notes</label>
                <textarea rows={3} placeholder="Additional notes or context..." value={followUpNotes} onChange={(e) => setFollowUpNotes(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 focus:outline-none"></textarea>
              </div>
            </div>

            <div className="flex justify-end items-center space-x-3 mt-8">
              {user.can_delete_followup && (selectedFollowUp && <button onClick={confirmDeleteFollowUp} className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg shadow">Delete</button>)}
              <button onClick={closeModal} className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg shadow">Cancel</button>
              {user.can_edit_followup && <button onClick={handleAddOrUpdateFollowUp} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow">{selectedFollowUp ? "Update" : "Add"}</button>}
            </div>
          </div>
        </div>
      </Modal>

      {confirmModalOpen && <ConfirmModal message={confirmMessage} onConfirm={confirmAction} onCancel={() => setConfirmModalOpen(false)} />}
    </>
  );
};

export default Calendar;
