import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
// import axios from "axios";

// Assume these icons are imported from an icon library
import {
  BoxCubeIcon,
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PageIcon,
  PieChartIcon,
  PlugInIcon,
  UserCircleIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import axios from "axios";
// import SidebarWidget from "./SidebarWidget";

import BACKEND_URL from "../configs/constants";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const loginItems: NavItem[] = [
  {
    icon: <CalenderIcon />,
    name: "Log in",
    path: "/",
  },
];

const superadminnavItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/dashboard",
    subItems: [{ name: "Analytics", path: "/dashboard", pro: false }],
  },
  {
    icon: <PageIcon />,
    name: "Lead Manager",
    path: "/manage-leads",
  },
  {
    icon: <HorizontaLDots />,
    name: "Follow Up Manager",
    path: "/calendar",
  },
  {
    icon: <BoxCubeIcon />,
    name: "Raw Data Manager",
    path: "/add-lead",
  },
  {
    icon: <PieChartIcon />,
    name: "Bulk Upload Manager",
    path: "/bulk-upload",
  },
  {
    icon: <ListIcon />,
    name: "Bulk Actions",
    path: "/bulk-actions",
  },
  {
    icon: <PageIcon />,
    name: "Raise a Ticket",
    path: "/raise-ticket",
  },
  {
    icon: <PageIcon />,
    name: "Manage Users",
    path: "/super-admin",
  },
  {
    icon: <CalenderIcon />,
    name: "Lead Logs",
    path: "/lead-logs",
  },
  {
    icon: <PageIcon />,
    name: "Lead Delete Logs",
    path: "/delete-logs",
  },
  {
    icon: <UserCircleIcon />,
    name: "User Activity",
    path: "/user-activity",
  },
];

const adminnavItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/dashboard",
    subItems: [{ name: "Analytics", path: "/dashboard", pro: false }],
  },
  {
    icon: <PageIcon />,
    name: "Lead Manager",
    path: "/manage-leads",
  },
  {
    icon: <HorizontaLDots />,
    name: "Follow Up Manager",
    path: "/calendar",
  },
  {
    icon: <BoxCubeIcon />,
    name: "Raw Data Manager",
    path: "/add-lead",
  },
  {
    icon: <PieChartIcon />,
    name: "Bulk Upload Manager",
    path: "/bulk-upload",
  },
  {
    icon: <ListIcon />,
    name: "Bulk Actions",
    path: "/bulk-actions",
  },
  {
    icon: <PageIcon />,
    name: "Raise a Ticket",
    path: "/raise-ticket",
  },
  {
    icon: <CalenderIcon />,
    name: "Lead Logs",
    path: "/lead-logs",
  },
  {
    icon: <PageIcon />,
    name: "Lead Delete Logs",
    path: "/delete-logs",
  },
  {
    icon: <UserCircleIcon />,
    name: "User Activity",
    path: "/user-activity",
  },
];

const usernavItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/dashboard",
    subItems: [{ name: "Analytics", path: "/dashboard", pro: false }],
  },
  {
    icon: <PageIcon />,
    name: "Lead Manager",
    path: "/manage-leads",
  },
  {
    icon: <HorizontaLDots />,
    name: "Follow Up Manager",
    path: "/calendar",
  },
  {
    icon: <BoxCubeIcon />,
    name: "Raw Data Manager",
    path: "/add-lead",
  },
  // {
  //   icon: <PieChartIcon />,
  //   name: "Bulk Upload Manager",
  //   path: "/bulk-upload",
  // },
  // {
  //   icon: <ListIcon />,
  //   name: "Bulk Actions",
  //   path: "/bulk-actions",
  // },
  {
    icon: <PageIcon />,
    name: "Raise a Ticket",
    path: "/raise-ticket",
  },
]

const othersItems: NavItem[] = [
  {
    icon: <PieChartIcon />,
    name: "Charts",
    subItems: [
      { name: "Line Chart", path: "/line-chart", pro: false },
      { name: "Bar Chart", path: "/bar-chart", pro: false },
    ],
  },
  {
    icon: <BoxCubeIcon />,
    name: "UI Elements",
    subItems: [
      { name: "Alerts", path: "/alerts", pro: false },
      { name: "Avatar", path: "/avatars", pro: false },
      { name: "Badge", path: "/badge", pro: false },
      { name: "Buttons", path: "/buttons", pro: false },
      { name: "Images", path: "/images", pro: false },
      { name: "Videos", path: "/videos", pro: false },
    ],
  },
  {
    icon: <PlugInIcon />,
    name: "Authentication",
    subItems: [
      { name: "Sign In", path: "/signin", pro: false },
      { name: "Sign Up", path: "/signup", pro: false },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const [isauthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>({});
  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/auth/isAuthenticated`, {
        withCredentials: true,
        validateStatus: () => true, // <-- allow all status codes to be handled in `.then`
      })
      .then((response) => {
        console.log("Authentication response:", response.data.isauthenticated);
        if (response.status === 200 && response.data.isauthenticated) {
          setIsAuthenticated(true);
          setUser(response.data.user);
        } else {
          setIsAuthenticated(false);
        }
      })
      .catch((error) => {
        console.error("Unexpected error checking authentication:", error);
      });
  }, []);

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => location.pathname === path;
  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items =
        menuType === "main"
          ? isauthenticated
            ? usernavItems
            : loginItems
          : othersItems;

      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };
type UserRole = "SuperAdmin" | "Admin" | "CRM Manager" | "Sales" | "Support";

// Use NavItem[] directly for role-based menus
const roleBasedMenus: Record<UserRole, NavItem[]> = {
  SuperAdmin: superadminnavItems,
  Admin: adminnavItems,
  "CRM Manager": adminnavItems,
  Sales: usernavItems,
  Support: usernavItems,
};



  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={`menu-item-icon-size  ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/dashboard">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              {/* Smartmark Company logo light mode */}
              <img
                className="dark:hidden"
                src="/images/logo/smartmarklogo.png"
                alt="Logo"
                // width={150}
                height={40}
              />
              {/* Smartmark Company logo Dark mode */}
              <img
                className="hidden dark:block"
                src="/images/logo/smartmarklogo.png"
                alt="Logo"
                // width={150}
                height={40}
              />
            </>
          ) : (
            // Logo for mobile view
            <img
              src="/images/logo/smartmarklogo.png"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(
                isauthenticated
                  ? roleBasedMenus[user.role as UserRole] || usernavItems // fallback to default usernavItems if role not found
                  : loginItems,
                "main"
              )}
            </div>
            {/* <div className="">
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Others"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(othersItems, "others")}
            </div> */}
          </div>
        </nav>
        {/* {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null} */}
      </div>
    </aside>
  );
};

export default AppSidebar;
