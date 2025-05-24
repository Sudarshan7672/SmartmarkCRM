import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import LeadManager from './pages/LeadManager/LeadManager.jsx'
import LeadForm from './pages/LeadManager/LeadForm.jsx'
import BulkUploadManager from './pages/LeadManager/BulkUploadManager.jsx'
import BulkAction from './pages/LeadManager/BulkAction.jsx'
import SignUp from "./pages/AuthPages/SignUp";
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
import SuperAdminUserManager from "./pages/SuperAdmin/SuperAdminUserManager.jsx"
import SearchLeads from "./pages/LeadManager/SearchLeads.jsx";
import DeleteLogs from "./pages/OtherPage/DeleteLogs.jsx";
import LeadLogs from "./pages/OtherPage/LeadLogs.jsx";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<SignIn />} />
            <Route index path="/dashboard" element={<Home />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/manage-leads" element={<LeadManager />} />
            <Route path="/search-leads" element={<SearchLeads />} />

            <Route path="/add-lead" element={<LeadForm />} />
            <Route path="/bulk-upload" element={<BulkUploadManager />} />
            <Route path="/bulk-actions" element={<BulkAction />} />
            {/* logs route */}
            <Route path="/lead-logs" element={<LeadLogs />} />
            <Route path="/delete-logs" element={<DeleteLogs />} />
            <Route path='/raise-ticket' element={<RaiseTicket />} />

           {/* SuperAdmin */}
            <Route path="/super-admin" element={<SuperAdminUserManager />} />

            {/* Lead Manager */}

            {/* Others Page */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} />

            {/* Forms */}
            <Route path="/form-elements" element={<FormElements />} />

            {/* Tables */}
            <Route path="/basic-tables" element={<BasicTables />} />

            {/* Ui Elements */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />

            {/* Charts */}
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />
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
