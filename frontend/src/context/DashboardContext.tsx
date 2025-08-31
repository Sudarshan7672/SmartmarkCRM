import { createContext, useContext, ReactNode } from "react";

interface DashboardContextType {
  selectedUserId: string;
  selectedUserName?: string;
}

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined
);

interface DashboardProviderProps {
  children: ReactNode;
  selectedUserId: string;
  selectedUserName?: string;
}

export function DashboardProvider({
  children,
  selectedUserId,
  selectedUserName,
}: DashboardProviderProps) {
  return (
    <DashboardContext.Provider value={{ selectedUserId, selectedUserName }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
