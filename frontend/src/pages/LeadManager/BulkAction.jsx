import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BACKEND_URL from '../../configs/constants';

const BulkActions = () => {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const fetchActions = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/bulkupload/actions`);
      setActions(res.data.actions || []);
    } catch (err) {
      console.error('Error fetching actions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
  }, []);

  const totalPages = Math.ceil(actions.length / itemsPerPage);
  const paginatedActions = actions.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Bulk Upload History</h2>

      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : actions.length === 0 ? (
        <p className="text-gray-600">No uploads found.</p>
      ) : (
        <>
          <div className="overflow-auto">
            <table className="table-auto w-full border">
              <thead>
                <tr className="bg-gray-100 text-left text-sm text-gray-700">
                  <th className="px-4 py-2 border">Filename</th>
                  <th className="px-4 py-2 border">Uploaded At</th>
                  <th className="px-4 py-2 border">Uploaded By</th>
                  <th className="px-4 py-2 border">Records Count</th>
                  <th className="px-4 py-2 border">Stage</th>
                </tr>
              </thead>
              <tbody>
                {paginatedActions.map((action, index) => (
                  <tr key={index} className="odd:bg-white even:bg-gray-50 text-sm">
                    <td className="px-4 py-2 border">{action.filename}</td>
                    <td className="px-4 py-2 border">{new Date(action.uploadedat).toLocaleString()}</td>
                    <td className="px-4 py-2 border">{action.uploadedby}</td>
                    <td className="px-4 py-2 border">{action.count}</td>
                    <td className="px-4 py-2 border capitalize">{action.stage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="mt-4 flex justify-center items-center gap-3 text-sm">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default BulkActions;
