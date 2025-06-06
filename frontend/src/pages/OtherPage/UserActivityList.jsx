import React, { useEffect, useState } from "react";
import axios from "axios";
import BACKEND_URL from "../../configs/constants";

export default function UserActivityList() {
  const [activities, setActivities] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState("");

  // Fetch users for dropdown
  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/user-activity/users`)
      .then((res) => {
        setUsers(res.data.users);
        console.log("Users:", res.data.users);
      })
      .catch(() => setError("Failed to load users"));
  }, []);

  // Fetch activities, filter by selected user
  useEffect(() => {
    setLoading(true);
    setError(null);

    const url = selectedUserId
      ? `${BACKEND_URL}/user-activity?userId=${selectedUserId}`
      : `${BACKEND_URL}/user-activity`;

    axios
      .get(url)
      .then((response) => {
        setActivities(response.data.activities);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Error fetching user activities");
        setLoading(false);
      });
  }, [selectedUserId]);

  return (
    <div className="p-4 max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow">
  <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">User Activity Log</h2>

  <div className="mb-4">
    <label htmlFor="userSelect" className="mr-2 font-medium text-gray-700 dark:text-gray-300">
      Filter by User:
    </label>
    <select
      id="userSelect"
      className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 px-2 py-1 rounded"
      value={selectedUserId}
      onChange={(e) => setSelectedUserId(e.target.value)}
    >
      <option value="">All Users</option>
      {users.map((user) => (
        <option key={user._id} value={user._id}>
          {user.fullname}
        </option>
      ))}
    </select>
  </div>

  {loading && <p className="text-gray-600 dark:text-gray-300">Loading activities...</p>}
  {error && <p className="text-red-600 dark:text-red-400">Error: {error}</p>}

  {!loading && !error && (
    <div className="overflow-x-auto rounded-md border border-gray-300 dark:border-gray-700">
      <table className="w-full text-sm text-left text-gray-800 dark:text-gray-100">
        <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
          <tr>
            <th className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">User</th>
            <th className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">Login Time</th>
            <th className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">Logout Time</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900">
          {(!activities || activities.length === 0) && (
            <tr>
              <td colSpan="3" className="text-center py-4 text-gray-500 dark:text-gray-400">
                No activity found
              </td>
            </tr>
          )}
          {activities?.map((activity) => (
            <tr key={activity._id} className="even:bg-gray-50 dark:even:bg-gray-800">
              <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                {activity.userId
                  ? activity.userId.fullname || activity.userId.username || "Unknown"
                  : "Unknown"}
              </td>
              <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                {new Date(activity.loginTime).toLocaleString()}
              </td>
              <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                {activity.logoutTime
                  ? new Date(activity.logoutTime).toLocaleString()
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</div>

  );
}
