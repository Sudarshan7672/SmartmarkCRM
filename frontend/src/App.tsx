import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import LeadManager from "./pages/LeadManager/LeadManager.jsx";
import LeadForm from "./pages/LeadManager/LeadForm.jsx";
import BulkUploadManager from "./pages/LeadManager/BulkUploadManager.jsx";
import BulkAction from "./pages/LeadManager/BulkAction.jsx";
// import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import RaiseTicket from "./pages/OtherPage/RaiseTicket";
import Logout from "./pages/AuthPages/Logout";
import SuperAdminUserManager from "./pages/SuperAdmin/SuperAdminUserManager.jsx";
import SearchLeads from "./pages/LeadManager/SearchLeads.jsx";
import DeleteLogs from "./pages/OtherPage/DeleteLogs.jsx";
import LeadLogs from "./pages/OtherPage/LeadLogs.jsx";
import UserActivityList from "./pages/OtherPage/UserActivityList.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProtectedRoute from "./components/ProtectedRoute";


export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<SignIn />} />

            <Route index path="/dashboard" element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } />
            <Route path="/logout" element={
              <ProtectedRoute>
                <Logout />
              </ProtectedRoute>
            } />
            <Route path="/manage-leads" element={
              <ProtectedRoute>
                <LeadManager />
              </ProtectedRoute>
            } />
            <Route path="/search-leads" element={
              <ProtectedRoute>
                <SearchLeads />
              </ProtectedRoute>
            } />

            <Route path="/add-lead" element={
              <ProtectedRoute>
                <LeadForm />
              </ProtectedRoute>
            } />
            <Route path="/bulk-upload" element={
              <ProtectedRoute>
                <BulkUploadManager />
              </ProtectedRoute>
            } />
            <Route path="/bulk-actions" element={
              <ProtectedRoute>
                <BulkAction />
              </ProtectedRoute>
            } />
            {/* logs route */}
            <Route path="/lead-logs" element={
              <ProtectedRoute>
                <LeadLogs />
              </ProtectedRoute>
            } />
            <Route path="/delete-logs" element={
              <ProtectedRoute>
                <DeleteLogs />
              </ProtectedRoute>
            } />
            {/* user-activity */}
            <Route path="/user-activity" element={
              <ProtectedRoute>
                <UserActivityList />
              </ProtectedRoute>
            } />
            {/* Raise Ticket */}
            <Route path="/raise-ticket" element={
              <ProtectedRoute>
                <RaiseTicket />
              </ProtectedRoute>
            } />

            {/* SuperAdmin */}
            <Route path="/super-admin" element={
              <ProtectedRoute>
                <SuperAdminUserManager />
              </ProtectedRoute>
            } />

            {/* Lead Manager */}

            {/* Others Page */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <UserProfiles />
              </ProtectedRoute>
            } />
            <Route path="/calendar" element={
              <ProtectedRoute>
                <Calendar />
              </ProtectedRoute>
            } />
            <Route path="/blank" element={
              <ProtectedRoute>
                <Blank />
              </ProtectedRoute>
            } />

            {/* Forms */}
            <Route path="/form-elements" element={
              <ProtectedRoute>
                <FormElements />
              </ProtectedRoute>
            } />

            {/* Tables */}
            <Route path="/basic-tables" element={
              <ProtectedRoute>
                <BasicTables />
              </ProtectedRoute>
            } />

            {/* Ui Elements */}
            <Route path="/alerts" element={
              <ProtectedRoute>
                <Alerts />
              </ProtectedRoute>
            } />
            <Route path="/avatars" element={
              <ProtectedRoute>
                <Avatars />
              </ProtectedRoute>
            } />
            <Route path="/badge" element={
              <ProtectedRoute>
                <Badges />
              </ProtectedRoute>
            } />
            <Route path="/buttons" element={
              <ProtectedRoute>
                <Buttons />
              </ProtectedRoute>
            } />
            <Route path="/images" element={
              <ProtectedRoute>
                <Images />
              </ProtectedRoute>
            } />
            <Route path="/videos" element={
              <ProtectedRoute>
                <Videos />
              </ProtectedRoute>
            } />

            {/* Charts */}
            <Route path="/line-chart" element={
              <ProtectedRoute>
                <LineChart />
              </ProtectedRoute>
            } />
            <Route path="/bar-chart" element={
              <ProtectedRoute>
                <BarChart />
              </ProtectedRoute>
            } />
          </Route>

          {/* Auth Layout */}
          {/* <Route path="/signup" element={<SignUp />} /> */}

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
