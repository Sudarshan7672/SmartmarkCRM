import { useState } from "react";
import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import StatisticsChart from "../../components/ecommerce/StatisticsChart";
import MonthlyTarget from "../../components/ecommerce/MonthlyTarget";
import RecentOrders from "../../components/ecommerce/RecentOrders";
import DemographicCard from "../../components/ecommerce/DemographicCard";
import PageMeta from "../../components/common/PageMeta";
import CategorySummaryTable from "../../components/ecommerce/CategorySummaryTable";
import ChannelSourceConversionTable from "../../components/ecommerce/ChannelSourceConversionTable";
import LeadBifurcation from "../../components/ecommerce/LeadBifurcation";
import GenerateReport from "../../components/ecommerce/GenerateReport";
import { useEffect } from "react";
import axios from "axios";
import BACKEND_URL from "../../configs/constants";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>({});
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/auth/isauthenticated`, {
        withCredentials: true,
      })
      .then((response: any) => {
        if (response.data.isauthenticated) {
          setIsLoggedIn(true);
          setUser(response.data.user);
        } else {
          setIsLoggedIn(false);
          navigate("/");
        }
      })
      .catch((error: any) => {
        console.error("Error checking authentication:", error);
      });
  }, [navigate]);

  return (
    isLoggedIn && (
      <>
        <PageMeta
          title="Dashboard"
          description="View your dashboard to get insights on your ecommerce performance, sales metrics, and more."
        />
        <div className="grid grid-cols-12 gap-4 md:gap-6 text-left w-full">
          {user.can_generate_report && (
            <div className="col-span-12 xl:col-span-12 justify-end flex">
              <GenerateReport />
            </div>
          )}
          <div className="col-span-12 space-y-6 xl:col-span-12">
            <EcommerceMetrics />
            <MonthlySalesChart />
          </div>

          <div className="col-span-12 xl:col-span-12">
            <MonthlyTarget />
          </div>
          <div className="col-span-12">
            <CategorySummaryTable />
          </div>
          <div className="col-span-12">
            <ChannelSourceConversionTable />
          </div>

          <div className="col-span-12">
            <StatisticsChart />
          </div>

          <div className="col-span-12 xl:col-span-12">
            <DemographicCard />
          </div>

          <div className="col-span-12 xl:col-span-12">
            {
              (user.role === "SuperAdmin" || user.role === "Admin" || user.role === "CRM Manager") && (
                <RecentOrders />
              )
            }
          </div>

          <div className="col-span-12 xl:col-span-12">
            <LeadBifurcation />
          </div>
        </div>
      </>
    )
  );
}
