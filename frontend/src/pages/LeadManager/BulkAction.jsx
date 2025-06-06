import React, { useEffect, useState } from "react";
import axios from "axios";
import BACKEND_URL from "../../configs/constants";
import PageMeta from "../../components/common/PageMeta";

const BulkActions = () => {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const fetchActions = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/bulkupload/actions`, {
        withCredentials: true,
      });
      setActions(res.data.actions.reverse() || []);
    } catch (err) {
      console.error("Error fetching actions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
  }, []);

  const totalPages = Math.ceil(actions.length / itemsPerPage);
  const paginatedActions = actions.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <>
      <PageMeta
        title="Bulk Upload History"
        description="View the history of bulk uploads and their statuses."
      />
      <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
          Bulk Upload History
        </h2>

        {loading ? (
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        ) : actions.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-300">No uploads found.</p>
        ) : (
          <>
            <div className="overflow-auto">
              <table className="table-auto w-full border dark:border-gray-700">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800 text-left text-sm text-gray-700 dark:text-gray-200">
                    <th className="px-4 py-2 border dark:border-gray-700">
                      Filename
                    </th>
                    <th className="px-4 py-2 border dark:border-gray-700">
                      Uploaded At
                    </th>
                    <th className="px-4 py-2 border dark:border-gray-700">
                      Uploaded By
                    </th>
                    <th className="px-4 py-2 border dark:border-gray-700">
                      Records Count
                    </th>
                    <th className="px-4 py-2 border dark:border-gray-700">
                      Stage
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedActions.map((action, index) => (
                    <tr
                      key={index}
                      className="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-900 dark:even:bg-gray-800 text-sm dark:text-gray-100"
                    >
                      <td className="px-4 py-2 border dark:border-gray-700">
                        {action.filename}
                      </td>
                      <td className="px-4 py-2 border dark:border-gray-700">
                        {new Date(action.uploadedat).toLocaleDateString(
                          "en-GB",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          }
                        )}
                      </td>
                      <td className="px-4 py-2 border dark:border-gray-700">
                        {action.uploadedby}
                      </td>
                      <td className="px-4 py-2 border dark:border-gray-700">
                        {action.count}
                      </td>
                      <td className="px-4 py-2 border capitalize dark:border-gray-700">
                        {action.stage}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="mt-4 flex justify-center items-center gap-3 text-sm text-gray-800 dark:text-gray-200">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-3 py-1 bg-gray-300 dark:bg-gray-700 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="px-3 py-1 bg-gray-300 dark:bg-gray-700 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default BulkActions;
