import { useEffect, useState } from "react";
import axios from "axios";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "../../icons";
import CountryMap from "./CountryMap";
import BACKEND_URL  from "../../configs/constants";

export default function DemographicCard() {
  const [isOpen, setIsOpen] = useState(false);
  const [countryData, setCountryData] = useState([]);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  useEffect(() => {
    axios.get(`${BACKEND_URL}/dashboard/leads-by-country`)
      .then(res => setCountryData(res.data.data))
      .catch(err => console.error("Failed to fetch country data", err));
  }, []);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="flex justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Customers Demographic
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Number of customer based on country
          </p>
        </div>
        <div className="relative inline-block">
          <button className="dropdown-toggle" onClick={toggleDropdown}>
            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-6" />
          </button>
          <Dropdown isOpen={isOpen} onClose={closeDropdown} className="w-40 p-2">
            <DropdownItem onItemClick={closeDropdown}>View More</DropdownItem>
            <DropdownItem onItemClick={closeDropdown}>Delete</DropdownItem>
          </Dropdown>
        </div>
      </div>

      {/* <div className="px-4 py-6 my-6 overflow-hidden border border-gray-200 rounded-2xl dark:border-gray-800 sm:px-6">
        <div id="mapOne" className="mapOne map-btn -mx-4 -my-6 h-[212px] w-[252px] sm:w-full">
          <CountryMap />
        </div>
      </div> */}
      <div className="p-3"></div>

      <div className="space-y-5">
        {countryData.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* <div className="items-center w-full rounded-full max-w-8">
                <img src={`./images/country/${item.country.toLowerCase()}.svg`} alt={item.country} />
              </div> */}
              <div>
                <p className="font-semibold text-gray-800 text-theme-sm dark:text-white/90">
                  {item.country}
                </p>
                <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                  {item.total} Customers
                </span>
              </div>
            </div>
            <div className="flex w-full max-w-[140px] items-center gap-3">
              <div className="relative block h-2 w-full max-w-[100px] rounded-sm bg-gray-200 dark:bg-gray-800">
                <div
                  className="absolute left-0 top-0 h-full rounded-sm bg-brand-500 text-xs font-medium text-white"
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
              <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                {item.percentage}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
