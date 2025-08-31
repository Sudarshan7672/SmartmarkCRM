import { useEffect, useState } from "react";
// import {
//   GroupIcon,
//   BoxIconLine,
// } from "../../icons";
import axios from "axios";
import BACKEND_URL from "../../configs/constants";

import {
  Users,
  UserPlus,
  PhoneOff,
  Flame,
  Snowflake,
  RotateCcw,
  CheckCircle,
  Share,
  UserX,
} from "lucide-react";

type Metrics = {
  total: number;
  newLeads: number;
  notConnected: number;
  hot: number;
  cold: number;
  reEnquired: number;
  converted: number;
  transferred: number;
  unassigned: number;
  followUp: number;
};

interface Props {
  selectedUserId?: string;
}

export default function EcommerceMetrics({ selectedUserId }: Props) {
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  console.log("EcommerceMetrics - selectedUserId:", selectedUserId);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        console.log("=== Frontend: Fetching metrics ===");
        console.log("selectedUserId:", selectedUserId);

        const params = new URLSearchParams();
        if (selectedUserId && selectedUserId !== "") {
          params.append("userId", selectedUserId);
        }

        const url = `${BACKEND_URL}/dashboard/lead-metrics?${params.toString()}`;
        console.log("Request URL:", url);

        const res = await axios.get(url, {
          withCredentials: true,
        });

        console.log("Response data:", res.data);
        setMetrics(res.data);
      } catch (err) {
        console.error("Error fetching lead metrics:", err);
        if (axios.isAxiosError(err)) {
          console.error("Error response:", err.response?.data);
          console.error("Error status:", err.response?.status);
        }
      }
    };
    fetchMetrics();
  }, [selectedUserId]);

  if (!metrics) return <p>Loading metrics...</p>;

  const cardData = [
    { label: "Total Leads", value: metrics.total, icon: Users },
    { label: "New Leads", value: metrics.newLeads, icon: UserPlus },
    { label: "Not Connected", value: metrics.notConnected, icon: PhoneOff },
    { label: "Hot Leads", value: metrics.hot, icon: Flame },
    { label: "Cold Leads", value: metrics.cold, icon: Snowflake },
    { label: "Re-Enquired", value: metrics.reEnquired, icon: RotateCcw },
    { label: "Follow Up", value: metrics.followUp, icon: RotateCcw },
    { label: "Converted", value: metrics.converted, icon: CheckCircle },
    {
      label: "Transferred to Dealers",
      value: metrics.transferred,
      icon: Share,
    },
    { label: "Unassigned Leads", value: metrics.unassigned, icon: UserX },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 md:gap-6">
      {cardData.map((item, index) => {
        const Icon = item.icon;
        return (
          <div
            key={index}
            className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
              <Icon className="text-gray-800 size-6 dark:text-white/90" />
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
        );
      })}
    </div>
  );
}
