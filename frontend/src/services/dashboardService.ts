import axios from "axios";
import BACKEND_URL from "../configs/constants";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "SuperAdmin" | "Admin" | "CRM Manager" | "Sales" | "Support";
  can_generate_report: boolean;
  department?: string;
  created_at: string;
}

export interface MonthlyPerformance {
  month: string;
  sales: number;
  leads: number;
  conversion_rate: number;
  revenue: number;
}

export interface AnalyticsData {
  totalSales: number;
  totalLeads: number;
  conversionRate: number;
  totalRevenue: number;
  monthlyPerformance: MonthlyPerformance[];
  demographicData: {
    age_groups: Record<string, number>;
    locations: Record<string, number>;
    sources: Record<string, number>;
  };
  categoryData: {
    categories: Array<{
      name: string;
      leads: number;
      sales: number;
      revenue: number;
    }>;
  };
  channelData: {
    channels: Array<{
      name: string;
      leads: number;
      conversion_rate: number;
      cost_per_lead: number;
    }>;
  };
  recentOrders: Array<{
    id: string;
    customer_name: string;
    amount: number;
    status: string;
    date: string;
    product: string;
  }>;
  topPerformers?: Array<{
    user_id: string;
    user_name: string;
    sales: number;
    leads: number;
    conversion_rate: number;
  }>;
}

export class DashboardService {
  private static instance: DashboardService;

  public static getInstance(): DashboardService {
    if (!DashboardService.instance) {
      DashboardService.instance = new DashboardService();
    }
    return DashboardService.instance;
  }

  /**
   * Check if user is authenticated
   */
  async checkAuthentication(): Promise<{ success: boolean; user?: User }> {
    try {
      const response = await axios.get(`${BACKEND_URL}/auth/isAuthenticated`, {
        withCredentials: true,
      });

      console.log("Auth response:", response.data);

      if (response.data.success || response.data.isauthenticated) {
        // Transform the user data to match our interface
        const userData = response.data.user;
        const user: User = {
          id: userData._id || userData.id,
          name: userData.fullname || userData.name,
          email: userData.email || "",
          role: userData.role,
          can_generate_report: userData.can_generate_report || false,
          department: userData.department,
          created_at: userData.created_at || userData.createdAt,
        };

        console.log("Transformed user:", user);

        return {
          success: true,
          user: user,
        };
      }

      return { success: false };
    } catch (error) {
      console.error("Authentication check failed:", error);
      return { success: false };
    }
  }

  /**
   * Fetch all users (for SuperAdmin, Admin, CRM Manager)
   */
  async getAllUsers(): Promise<{ success: boolean; users: User[] }> {
    try {
      const response = await axios.get(`${BACKEND_URL}/dashboard/users/all`, {
        withCredentials: true,
      });

      if (response.data.success) {
        return {
          success: true,
          users: response.data.users,
        };
      }

      return { success: false, users: [] };
    } catch (error) {
      console.error("Failed to fetch users:", error);
      return { success: false, users: [] };
    }
  }

  /**
   * Fetch analytics data for all users (SuperAdmin, Admin, CRM Manager only)
   */
  async getAllAnalytics(): Promise<{
    success: boolean;
    analytics?: AnalyticsData;
  }> {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/dashboard/analytics/all`,
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        return {
          success: true,
          analytics: response.data.analytics,
        };
      }

      return { success: false };
    } catch (error) {
      console.error("Failed to fetch all analytics:", error);
      return { success: false };
    }
  }

  /**
   * Fetch analytics data for current user
   */
  async getMyAnalytics(): Promise<{
    success: boolean;
    analytics?: AnalyticsData;
  }> {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/dashboard/analytics/me`,
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        return {
          success: true,
          analytics: response.data.analytics,
        };
      }

      return { success: false };
    } catch (error) {
      console.error("Failed to fetch my analytics:", error);
      return { success: false };
    }
  }

  /**
   * Fetch analytics data for specific user
   */
  async getUserAnalytics(
    userId: string
  ): Promise<{ success: boolean; analytics?: AnalyticsData }> {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/dashboard/analytics/${userId}`,
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        return {
          success: true,
          analytics: response.data.analytics,
        };
      }

      return { success: false };
    } catch (error) {
      console.error(`Failed to fetch analytics for user ${userId}:`, error);
      return { success: false };
    }
  }

  /**
   * Generate and download report
   */
  async generateReport(
    reportType: "all" | "me" | "user",
    userId?: string,
    options: {
      includeMetrics?: boolean;
      includeTrends?: boolean;
      includeComparisons?: boolean;
      dateRange?: "week" | "month" | "quarter" | "year";
      format?: "pdf" | "excel" | "csv";
    } = {}
  ): Promise<{ success: boolean; blob?: Blob; filename?: string }> {
    try {
      let endpoint = "";
      let filename = "";

      const defaultOptions = {
        includeMetrics: true,
        includeTrends: true,
        includeComparisons: true,
        dateRange: "month" as const,
        format: "pdf" as const,
        ...options,
      };

      switch (reportType) {
        case "all":
          endpoint = "/dashboard/generate-report/all";
          filename = `company-analytics-report-${
            new Date().toISOString().split("T")[0]
          }.${defaultOptions.format}`;
          break;
        case "me":
          endpoint = "/dashboard/generate-report/me";
          filename = `my-analytics-report-${
            new Date().toISOString().split("T")[0]
          }.${defaultOptions.format}`;
          break;
        case "user":
          if (!userId)
            throw new Error("User ID is required for user-specific reports");
          endpoint = `/dashboard/generate-report/${userId}`;
          filename = `user-${userId}-analytics-report-${
            new Date().toISOString().split("T")[0]
          }.${defaultOptions.format}`;
          break;
        default:
          throw new Error("Invalid report type");
      }

      const response = await axios.post(
        `${BACKEND_URL}${endpoint}`,
        defaultOptions,
        {
          responseType: "blob",
          withCredentials: true,
        }
      );

      return {
        success: true,
        blob: new Blob([response.data]),
        filename,
      };
    } catch (error) {
      console.error("Failed to generate report:", error);
      return { success: false };
    }
  }

  /**
   * Download file from blob
   */
  downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
}

// Export singleton instance
export const dashboardService = DashboardService.getInstance();
