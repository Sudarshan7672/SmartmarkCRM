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

import BASE_URL from '../../configs/constants'

export default function RecentOrders() {
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    const fetchRecentLeads = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/dashboard/recent-ten`);
        setLeads(response.data);
      } catch (error) {
        console.error("Failed to fetch leads:", error);
      }
    };

    fetchRecentLeads();
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Recent Leads
        </h3>
      </div>

      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell isHeader className="text-left py-3 text-theme-xs text-gray-500 dark:text-gray-400">Name</TableCell>
              <TableCell isHeader className="text-left py-3 text-theme-xs text-gray-500 dark:text-gray-400">Email</TableCell>
              <TableCell isHeader className="text-left py-3 text-theme-xs text-gray-500 dark:text-gray-400">Source</TableCell>
              <TableCell isHeader className="text-left py-3 text-theme-xs text-gray-500 dark:text-gray-400">Status</TableCell>
              <TableCell isHeader className="text-left py-3 text-theme-xs text-gray-500 dark:text-gray-400">Created At</TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {leads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell className="text-left py-3 text-sm">{lead.firstname} {lead.lastname}</TableCell>
                <TableCell className="text-left py-3 text-sm">{lead.email}</TableCell>
                <TableCell className="text-left py-3 text-sm">{lead.source}</TableCell>
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
                <TableCell className="text-left py-3 text-sm whitespace-nowrap">
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
