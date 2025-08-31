import { useState, useEffect, useCallback } from "react";
import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import StatisticsChart from "../../components/ecommerce/StatisticsChart";
import MonthlyTarget from "../../components/ecommerce/MonthlyTarget";
import RecentOrders from "../../components/ecommerce/RecentOrders";
import DemographicCard from "../../components/ecommerce/DemographicCard";
import PageMeta from "../../components/common/PageMeta";
import CategorySummaryTable from "../../components/ecommerce/CategorySummaryTable";
import ChannelSourceConversionTable from "../../components/ecommerce/ChannelSourceConversionTable";
import MonthlyConversionRatios from "../../components/ecommerce/MonthlyConversionRatios";
// import LeadBifurcation from "../../components/ecommerce/LeadBifurcation";

import GenerateReport from "../../components/ecommerce/GenerateReport";
import { useNavigate } from "react-router-dom";
import {
  dashboardService,
  User,
  AnalyticsData,
} from "../../services/dashboardService";

// User Selector Component
function UserSelector({
  users,
  selectedUserId,
  onUserSelect,
  currentUser,
}: {
  users: User[];
  selectedUserId: string;
  onUserSelect: (userId: string) => void;
  currentUser: User;
}) {
  // Only show user selector for SuperAdmin, Admin, CRM Manager
  if (!["SuperAdmin", "Admin", "CRM Manager"].includes(currentUser.role)) {
    return null;
  }

  return (
    <div className="col-span-12 mb-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
          View Analytics For:
        </h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => onUserSelect("all")}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              selectedUserId === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            All Users
          </button>
          <button
            onClick={() => onUserSelect(currentUser.id)}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              selectedUserId === currentUser.id
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            My Analytics
          </button>
          <select
            value={selectedUserId}
            onChange={(e) => onUserSelect(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select User</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} - {user.role}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

// Role-based Analytics Component
function RoleBasedAnalytics({
  analyticsData,
  user,
  selectedUserId,
}: {
  analyticsData: AnalyticsData | null;
  user: User;
  selectedUserId: string;
}) {
  if (!analyticsData) {
    return (
      <div className="col-span-12 flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const canViewAllData = ["SuperAdmin", "Admin", "CRM Manager"].includes(
    user.role
  );

  return (
    <>
      {/* Analytics Summary Card - Only for SuperAdmin, Admin, CRM Manager */}
      {canViewAllData && (
        <div className="col-span-12 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
              Analytics Summary
              {selectedUserId !== "all" && selectedUserId !== user.id && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  (User-specific data)
                </span>
              )}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  Total Sales
                </h4>
                <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                  ${analyticsData.totalSales.toLocaleString()}
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-green-600 dark:text-green-400">
                  Total Leads
                </h4>
                <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                  {analyticsData.totalLeads.toLocaleString()}
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-purple-600 dark:text-purple-400">
                  Conversion Rate
                </h4>
                <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                  {analyticsData.conversionRate}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Original Components - These will use their own data fetching logic */}
      <div className="col-span-12 space-y-6 xl:col-span-12">
        <EcommerceMetrics selectedUserId={selectedUserId} />
        <MonthlySalesChart selectedUserId={selectedUserId} />
      </div>

      <div className="col-span-12 xl:col-span-12">
        <MonthlyTarget selectedUserId={selectedUserId} />
      </div>

      <div className="col-span-12">
        <CategorySummaryTable selectedUserId={selectedUserId} />
      </div>

      <div className="col-span-12">
        <ChannelSourceConversionTable selectedUserId={selectedUserId} />
      </div>

      <div className="col-span-12">
        <MonthlyConversionRatios selectedUserId={selectedUserId} />
      </div>

      <div className="col-span-12">
        <StatisticsChart selectedUserId={selectedUserId} />
      </div>

      <div className="col-span-12 xl:col-span-12">
        <DemographicCard selectedUserId={selectedUserId} />
      </div>

      {/* Recent Orders - Only for SuperAdmin, Admin, CRM Manager or if viewing own data */}
      {(canViewAllData || selectedUserId === user.id) && (
        <div className="col-span-12 xl:col-span-12">
          <RecentOrders selectedUserId={selectedUserId} />
        </div>
      )}

      {/* <div className="col-span-12 xl:col-span-12">
        <LeadBifurcation selectedUserId={selectedUserId} />
      </div> */}
    </>
  );
}

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const navigate = useNavigate();

  // Check authentication and get user data
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const result = await dashboardService.checkAuthentication();

        if (result.success && result.user) {
          const userData = result.user;
          setUser(userData);
          setIsLoggedIn(true);

          // Set initial selected user based on role
          if (["SuperAdmin", "Admin", "CRM Manager"].includes(userData.role)) {
            setSelectedUserId("all"); // Default to all users for managers
            await fetchAllUsers(); // Fetch users for selector
          } else {
            setSelectedUserId(userData.id); // Default to own data for sales/support
          }
        } else {
          navigate("/");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  // Fetch all users for user selector (SuperAdmin, Admin, CRM Manager only)
  const fetchAllUsers = async () => {
    try {
      const result = await dashboardService.getAllUsers();
      if (result.success) {
        setUsers(result.users);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  // Fetch analytics data based on selected user
  const fetchAnalyticsData = useCallback(
    async (userId: string) => {
      if (!user) return;

      setLoadingAnalytics(true);

      try {
        // For Sales/Support users, skip analytics API calls but set empty data
        if (!["SuperAdmin", "Admin", "CRM Manager"].includes(user.role)) {
          setAnalyticsData({
            totalSales: 0,
            totalLeads: 0,
            conversionRate: 0,
            totalRevenue: 0,
            monthlyPerformance: [],
            demographicData: {
              age_groups: {},
              locations: {},
              sources: {},
            },
            categoryData: {
              categories: [],
            },
            channelData: {
              channels: [],
            },
            recentOrders: [],
          });
          return;
        }

        // Only Admin roles make API calls
        let result;
        if (userId === "all") {
          result = await dashboardService.getAllAnalytics();
        } else if (userId === user.id) {
          result = await dashboardService.getMyAnalytics();
        } else {
          result = await dashboardService.getUserAnalytics(userId);
        }

        if (result.success && result.analytics) {
          setAnalyticsData(result.analytics);
        } else {
          console.error("Failed to fetch analytics:", result);
          // Set default empty analytics data for fallback
          setAnalyticsData({
            totalSales: 0,
            totalLeads: 0,
            conversionRate: 0,
            totalRevenue: 0,
            monthlyPerformance: [],
            demographicData: {
              age_groups: {},
              locations: {},
              sources: {},
            },
            categoryData: {
              categories: [],
            },
            channelData: {
              channels: [],
            },
            recentOrders: [],
          });
        }
      } catch (error) {
        console.error("Error fetching analytics:", error);
        // Set default empty analytics data
        setAnalyticsData({
          totalSales: 0,
          totalLeads: 0,
          conversionRate: 0,
          totalRevenue: 0,
          monthlyPerformance: [],
          demographicData: {
            age_groups: {},
            locations: {},
            sources: {},
          },
          categoryData: {
            categories: [],
          },
          channelData: {
            channels: [],
          },
          recentOrders: [],
        });
      } finally {
        setLoadingAnalytics(false);
      }
    },
    [user]
  );

  // Fetch analytics when user or selectedUserId changes
  useEffect(() => {
    if (user && selectedUserId) {
      fetchAnalyticsData(selectedUserId);
    }
  }, [user, selectedUserId, fetchAnalyticsData]);

  // Handle user selection change
  const handleUserSelect = (userId: string) => {
    // Only allow user selection for admin roles
    if (!user || !["SuperAdmin", "Admin", "CRM Manager"].includes(user.role)) {
      return;
    }
    setSelectedUserId(userId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isLoggedIn || !user) {
    return null;
  }

  return (
    <>
      <PageMeta
        title={`${user.role} Dashboard - SmartMark CRM`}
        description={`Dynamic analytics dashboard for ${user.role}`}
      />

      <div className="grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
        {/* Header with user info and role */}
        <div className="col-span-12 mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Welcome back, {user.name}!
            </h1>
            <p className="text-blue-100 text-lg">
              {user.role} Dashboard -
              {selectedUserId === "all"
                ? " Company Overview"
                : selectedUserId === user.id
                ? " Your Performance"
                : " User Analytics"}
            </p>
          </div>
        </div>

        {/* User Selector - Only for SuperAdmin, Admin, CRM Manager */}
        <UserSelector
          users={users}
          selectedUserId={selectedUserId}
          onUserSelect={handleUserSelect}
          currentUser={user}
        />

        {/* Generate Report Button - Use existing working component */}
        {user.can_generate_report && (
          <div className="col-span-12 xl:col-span-12 justify-end flex">
            <GenerateReport />
          </div>
        )}

        {/* Loading State */}
        {loadingAnalytics && (
          <div className="col-span-12 flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">
                Loading analytics data...
              </p>
            </div>
          </div>
        )}

        {/* Role-based Analytics */}
        {!loadingAnalytics && (
          <RoleBasedAnalytics
            analyticsData={analyticsData}
            user={user}
            selectedUserId={selectedUserId}
          />
        )}

        {/* Empty State */}
        {!loadingAnalytics && !analyticsData && (
          <div className="col-span-12 text-center py-12">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8">
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No Data Available
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Analytics data is not available for the selected user.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
