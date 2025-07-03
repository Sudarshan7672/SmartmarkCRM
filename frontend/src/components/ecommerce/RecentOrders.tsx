import { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { Lead } from "../ui/table"; // Assuming Lead type is exported from here

import BACKEND_URL from "../../configs/constants";

export default function RecentOrders() {
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    const fetchRecentLeads = async () => {
      try {
        const response = await axios.get(
          `${BACKEND_URL}/dashboard/recent-ten`,
          {
            withCredentials: true,
          }
        );
        setLeads(response.data);
      } catch (error) {
        console.error("Failed to fetch leads:", error);
      }
    };

    fetchRecentLeads();
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] px-4 pb-3 pt-4 sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Recent Leads
        </h3>
      </div>

      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-y border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
            <TableRow>
              <TableCell
                isHeader
                className="text-left py-3 text-theme-xs text-gray-500 dark:text-gray-400"
              >
                Name
              </TableCell>
              <TableCell
                isHeader
                className="text-left py-3 text-theme-xs text-gray-500 dark:text-gray-400"
              >
                Email
              </TableCell>
              <TableCell
                isHeader
                className="text-left py-3 text-theme-xs text-gray-500 dark:text-gray-400"
              >
                Source
              </TableCell>
              <TableCell
                isHeader
                className="text-left py-3 text-theme-xs text-gray-500 dark:text-gray-400"
              >
                Status
              </TableCell>
              <TableCell
                isHeader
                className="text-left py-3 text-theme-xs text-gray-500 dark:text-gray-400"
              >
                Created At
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {leads.map((lead) => (
              <TableRow
                key={lead.id}
                className="bg-white dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
              >
                <TableCell className="text-left py-3 text-sm text-gray-800 dark:text-gray-200">
                  {lead.fullname}
                </TableCell>
                <TableCell className="text-left py-3 text-sm text-gray-800 dark:text-gray-200">
                  {lead.email}
                </TableCell>
                <TableCell className="text-left py-3 text-sm text-gray-800 dark:text-gray-200">
                  {lead.source}
                </TableCell>
                <TableCell className="text-left py-3 text-sm">
                  <Badge
                    size="sm"
                    color={
                      lead.status === "Converted"
                        ? "success"
                        : lead.status === "Pending"
                        ? "warning"
                        : "error"
                    }
                  >
                    {lead.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-left py-3 text-sm text-gray-800 dark:text-gray-200 whitespace-nowrap">
                  {new Date(lead.created_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
