import { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import BASE_URL from "../../configs/constants";

interface BifurcationEntry {
  leadOwner: string;
  total: number;
  new: number;
  cold: number;
  notconnected: number;
  untouched: number;
}

export default function LeadBifurcation() {
  const [data, setData] = useState<BifurcationEntry[]>([]);

  useEffect(() => {
    const fetchBifurcation = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/dashboard/lead-bifurcation`);
        setData(response.data);
      } catch (error) {
        console.error("Error fetching lead bifurcation:", error);
      }
    };

    fetchBifurcation();
  }, []);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
        Lead Bifurcation
      </h3>

      <div className="w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-y border-gray-200 dark:border-gray-800">
            <TableRow>
              <TableCell isHeader className="py-3 text-theme-xs text-gray-500 dark:text-gray-400">Lead Owner</TableCell>
              <TableCell isHeader className="py-3 text-theme-xs text-gray-500 dark:text-gray-400">Total</TableCell>
              <TableCell isHeader className="py-3 text-theme-xs text-gray-500 dark:text-gray-400">New</TableCell>
              <TableCell isHeader className="py-3 text-theme-xs text-gray-500 dark:text-gray-400">Cold</TableCell>
              <TableCell isHeader className="py-3 text-theme-xs text-gray-500 dark:text-gray-400">Not Connected</TableCell>
              <TableCell isHeader className="py-3 text-theme-xs text-gray-500 dark:text-gray-400">Untouched</TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {data.map((entry, index) => (
              <TableRow key={index}>
                <TableCell className="py-3 text-sm">{entry.leadOwner}</TableCell>
                <TableCell className="py-3 text-sm">{entry.total}</TableCell>
                <TableCell className="py-3 text-sm">{entry.new}</TableCell>
                <TableCell className="py-3 text-sm">{entry.cold}</TableCell>
                <TableCell className="py-3 text-sm">{entry.notconnected}</TableCell>
                <TableCell className="py-3 text-sm">{entry.untouched}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
