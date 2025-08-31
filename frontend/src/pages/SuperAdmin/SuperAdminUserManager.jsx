import React, { use, useEffect, useState } from "react";
import axios from "axios";
import BACKEND_URL from "../../configs/constants";
import PageMeta from "../../components/common/PageMeta";

export default function SuperAdminUserManager() {
  const [user, setUser] = useState({});
  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/auth/isAuthenticated`, {
        withCredentials: true,
      })
      .then((response) => {
        setUser(response.data.user);
        // console.log("User data:", response.data.user);
      })
      .catch((error) => {
        console.error("Error checking authentication:", error);
      });
  }, []);
  const initialForm = () => ({
    username: "",
    fullname: "",
    password: "",
    role: "Sales",
    assignedPrimaryCategories: [],
    assignedSecondaryCategories: [],
    cangeneratereportfor: [],
    can_add_individual_lead: false,
    can_add_bulk_lead: false,
    can_edit_lead: false,
    can_transfer_lead_department: false,
    can_transfer_lead_group: false,
    can_delete_lead: false,
    can_add_followup: false,
    can_edit_followup: false,
    can_delete_followup: false,
    can_add_remark: false,
    can_edit_remark: false,
    can_delete_remark: false,
    can_raise_ticket: false,
    can_generate_report: false,
  });

  const [form, setForm] = useState(initialForm());
  const [users, setUsers] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/superadmin/`, {
        withCredentials: true,
      });

      // Case 1: Response is an object like { users: [...] }
      if (Array.isArray(res.data.users)) {
        setUsers(res.data.users);
      }
      // Case 2: Response is directly an array
      else if (Array.isArray(res.data)) {
        setUsers(res.data);
      } else {
        console.error("Unexpected users response:", res.data);
        setUsers([]); // fallback to empty
      }
    } catch (err) {
      console.error("Failed to fetch users", err);
      setUsers([]);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (
      name === "assignedPrimaryCategories" ||
      name === "assignedSecondaryCategories" ||
      name === "cangeneratereportfor"
    ) {
      // Handle multiple select
      const selectedOptions = Array.from(
        e.target.selectedOptions,
        (option) => option.value
      );
      setForm((prev) => ({
        ...prev,
        [name]: selectedOptions,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let dataToSend = { ...form };

      // Remove password if empty (means no change to password)
      if (editMode && dataToSend.password === "") {
        delete dataToSend.password;
      }

      if (editMode) {
        await axios.put(`${BACKEND_URL}/superadmin/${editingId}`, dataToSend, {
          withCredentials: true,
        });
      } else {
        await axios.post(`${BACKEND_URL}/superadmin`, dataToSend, {
          withCredentials: true,
        });
      }

      setForm(initialForm());
      setEditMode(false);
      setEditingId(null);
      fetchUsers();
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  const handleEdit = (user) => {
    setForm({
      ...user,
      password: "", // Don't show existing password
      assignedPrimaryCategories: user.assignedPrimaryCategories || [],
      assignedSecondaryCategories: user.assignedSecondaryCategories || [],
      cangeneratereportfor: user.cangeneratereportfor || [],
    });
    setEditMode(true);
    setEditingId(user._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      await axios.delete(`${BACKEND_URL}/superadmin/${id}`, {
        withCredentials: true,
      });
      fetchUsers();
    }
  };

  const permissionFields = Object.keys(initialForm()).filter((key) =>
    key.startsWith("can_")
  );

  return (
    <>
      <PageMeta
        title="User Management"
        description="Manage users, roles, and permissions"
      />
      <div className="p-4 max-w-5xl mx-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">
          {editMode ? "Edit User" : "Add New User"}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-900 shadow-md rounded px-8 pt-6 pb-8 mb-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              name="username"
              placeholder="Username"
              className="border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              value={form.username}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="fullname"
              placeholder="Full Name"
              className="border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              value={form.fullname}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              value={form.password}
              onChange={handleChange}
              required={!editMode}
            />
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              required
            >
              <option value="SuperAdmin">SuperAdmin</option>
              <option value="Admin">Admin</option>
              <option value="CRM Manager">CRM Manager</option>
              <option value="Sales">Sales</option>
              <option value="Support">Support</option>
            </select>
          </div>

          {/* Category Assignment Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">
                Assigned Primary Categories
              </label>
              <select
                name="assignedPrimaryCategories"
                multiple
                value={form.assignedPrimaryCategories}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 h-24"
              >
                <option value="sales">Sales</option>
                <option value="support">Support</option>
                <option value="marketing">Marketing</option>
                <option value="other">Other</option>
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Hold Ctrl/Cmd to select multiple
              </p>
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">
                Assigned Secondary Categories
              </label>
              <select
                name="assignedSecondaryCategories"
                multiple
                value={form.assignedSecondaryCategories}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 h-24"
              >
                <option value="group 1">Group 1</option>
                <option value="group 2">Group 2</option>
                <option value="group 3">Group 3</option>
                <option value="group 4">Group 4</option>
                <option value="group 5">Group 5</option>
                <option value="group 6">Group 6</option>
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Hold Ctrl/Cmd to select multiple
              </p>
            </div>
          </div>

          {/* Report Generation Permissions */}
          <div className="mt-4">
            <label className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">
              Can Generate Reports For (Users)
            </label>
            <select
              name="cangeneratereportfor"
              multiple
              value={form.cangeneratereportfor}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 h-32"
            >
              {users.map((user) => (
                <option key={user._id} value={user.fullname}>
                  {user.fullname} ({user.role})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Select users for whom this user can generate reports. Hold
              Ctrl/Cmd to select multiple. SuperAdmin and Admin can generate
              reports for all users regardless of this setting.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-4">
            {permissionFields.map((perm) => (
              <label
                key={perm}
                className="flex items-center space-x-2 text-gray-700 dark:text-gray-200"
              >
                <input
                  type="checkbox"
                  name={perm}
                  checked={form[perm]}
                  onChange={handleChange}
                />
                <span>{perm.replaceAll("_", " ")}</span>
              </label>
            ))}
          </div>

          <button
            type="submit"
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            {editMode ? "Update User" : "Create User"}
          </button>
        </form>

        <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">
          Existing Users
        </h2>
        <div className="overflow-auto max-h-[400px] border border-gray-200 dark:border-gray-700 rounded">
          <table className="min-w-full table-auto text-sm text-left text-gray-800 dark:text-gray-100">
            <thead className="bg-gray-200 dark:bg-gray-800">
              <tr>
                <th className="px-2 py-1">Username</th>
                <th className="px-2 py-1">Full Name</th>
                <th className="px-2 py-1">Role</th>
                <th className="px-2 py-1">Primary Categories</th>
                <th className="px-2 py-1">Secondary Categories</th>
                <th className="px-2 py-1">Can Generate Reports For</th>
                <th className="px-2 py-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u._id}
                  className="border-t border-gray-200 dark:border-gray-700"
                >
                  <td className="px-2 py-1">{u?.username}</td>
                  <td className="px-2 py-1">{u?.fullname}</td>
                  <td className="px-2 py-1">{u?.role}</td>
                  <td className="px-2 py-1">
                    {u?.assignedPrimaryCategories?.length > 0
                      ? u.assignedPrimaryCategories.join(", ")
                      : "None"}
                  </td>
                  <td className="px-2 py-1">
                    {u?.assignedSecondaryCategories?.length > 0
                      ? u.assignedSecondaryCategories.join(", ")
                      : "None"}
                  </td>
                  <td className="px-2 py-1">
                    {u?.cangeneratereportfor?.length > 0
                      ? u.cangeneratereportfor.join(", ")
                      : u?.role === "SuperAdmin" || u?.role === "Admin"
                      ? "All Users"
                      : "Self Only"}
                  </td>
                  <td className="px-2 py-1 flex gap-2">
                    <button
                      onClick={() => handleEdit(u)}
                      className="text-blue-600 dark:text-blue-400"
                    >
                      Edit
                    </button>
                    {u.role !== "SuperAdmin" && (
                      <button
                        onClick={() => handleDelete(u._id)}
                        className="text-red-600 dark:text-red-400"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
