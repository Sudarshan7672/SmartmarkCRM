import { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import BACKEND_URL from "../../configs/constants";

interface BifurcationEntry {
  leadOwner: string;
  total: number;
  new: number;
  cold: number;
  notconnected: number;
  untouched: number;
}

interface Props {
  selectedUserId?: string;
}

export default function LeadBifurcation({ selectedUserId }: Props) {
  const [data, setData] = useState<BifurcationEntry[]>([]);

  useEffect(() => {
    const fetchBifurcation = async () => {
      try {
        const params = new URLSearchParams();
        if (selectedUserId && selectedUserId !== "") {
          params.append("userId", selectedUserId);
        }

        const response = await axios.get(
          `${BACKEND_URL}/dashboard/lead-bifurcation?${params.toString()}`,
          {
            withCredentials: true,
          }
        );
        setData(response.data);
      } catch (error) {
        console.error("Error fetching lead bifurcation:", error);
      }
    };

    fetchBifurcation();
  }, [selectedUserId]);

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] px-5 pb-5 pt-5 sm:px-6 sm:pt-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
        Lead Bifurcation
      </h3>

      <div className="w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-y border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
            <TableRow>
              {[
                "Lead Owner",
                "Total",
                "New",
                "Cold",
                "Not Connected",
                "Untouched",
              ].map((header) => (
                <TableCell
                  key={header}
                  isHeader
                  className="py-3 text-theme-xs text-gray-500 dark:text-gray-400"
                >
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {data.map((entry, index) => (
              <TableRow
                key={index}
                className="bg-white dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
              >
                <TableCell className="py-3 text-sm text-gray-800 dark:text-gray-200">
                  {entry.leadOwner}
                </TableCell>
                <TableCell className="py-3 text-sm text-gray-800 dark:text-gray-200">
                  {entry.total}
                </TableCell>
                <TableCell className="py-3 text-sm text-gray-800 dark:text-gray-200">
                  {entry.new}
                </TableCell>
                <TableCell className="py-3 text-sm text-gray-800 dark:text-gray-200">
                  {entry.cold}
                </TableCell>
                <TableCell className="py-3 text-sm text-gray-800 dark:text-gray-200">
                  {entry.notconnected}
                </TableCell>
                <TableCell className="py-3 text-sm text-gray-800 dark:text-gray-200">
                  {entry.untouched}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
