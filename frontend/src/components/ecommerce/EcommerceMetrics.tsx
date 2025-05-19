import { useEffect, useState } from "react";
import {
  GroupIcon,
  BoxIconLine,
} from "../../icons";
import axios from "axios";
import BACKEND_URL from "../../configs/constants";

export default function EcommerceMetrics() {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/dashboard/lead-metrics`);
        setMetrics(res.data);
      } catch (err) {
        console.error("Error fetching lead metrics:", err);
      }
    };
    fetchMetrics();
  }, []);

  if (!metrics) return <p>Loading metrics...</p>;

  const cardData = [
    { label: "Total Leads", value: metrics.total },
    // { label: "Closed Leads", value: metrics.closed },
    { label: "New Leads", value: metrics.newLeads },
    { label: "Not Connected", value: metrics.notConnected },
    { label: "Hot Leads", value: metrics.hot },
    { label: "Cold Leads", value: metrics.cold },
    { label: "Re-Enquired", value: metrics.reEnquired },
    { label: "Converted", value: metrics.converted },
    { label: "Transferred to Dealers", value: metrics.transferred },
    { label: "Unassigned Leads", value: metrics.unassigned },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 md:gap-6">
      {cardData.map((item, index) => (
        <div key={index} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
          </div>
          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {item.label}
              </span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {item.value}
              </h4>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
