import { useEffect, useRef, useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import axios from "axios";
import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";
import BACKEND_URL from "../../configs/constants";

dayjs.extend(isToday);
dayjs.extend(isYesterday);

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifying, setNotifying] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isMuted, setIsMuted] = useState(false); // 🔇 Mute state
  const lastNotificationId = useRef<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load audio
  useEffect(() => {
    audioRef.current = new Audio("/notification_tone.mp3");
  }, []);

  // Fetch notifications every 10 seconds
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/notifications`, {
          withCredentials: true,
        });

        const data = res.data.notifications || [];
        // console.log("Fetched notifications:", data);

        if (data.length > 0 && data[0]._id !== lastNotificationId.current) {
          setNotifying(true);
          lastNotificationId.current = data[0]._id;

          if (hasInteracted && audioRef.current && !isMuted) {
            audioRef.current.play().catch((err) => {
              console.warn("Audio playback failed:", err);
            });
          }
        }

        setNotifications(data);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [hasInteracted, isMuted]);

  const toggleDropdown = () => setIsOpen(!isOpen);
  const closeDropdown = () => setIsOpen(false);

  const handleClick = () => {
    toggleDropdown();
    setNotifying(false);
    setHasInteracted(true);

    if (audioRef.current && !isMuted) {
      audioRef.current.play().catch(() => {});
    }
  };

  const toggleMute = () => setIsMuted(!isMuted);

  const groupByDate = () => {
    const groups: { [date: string]: any[] } = {};

    for (const notif of notifications) {
      const date = dayjs(notif.timestamp);
      let label = "";

      if (date.isToday()) label = "Today";
      else if (date.isYesterday()) label = "Yesterday";
      else label = date.format("DD MMM YYYY");

      if (!groups[label]) groups[label] = [];
      groups[label].push(notif);
    }

    return groups;
  };

  const groupedNotifications = groupByDate();

  return (
    <div className="relative">
      <button
        className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={handleClick}
      >
        {notifying && (
          <span className="absolute right-0 top-0.5 z-10 h-2 w-2 rounded-full bg-orange-400">
            <span className="absolute inline-flex w-full h-full bg-orange-400 rounded-full opacity-75 animate-ping"></span>
          </span>
        )}
        <svg
          className="fill-current text-red-500 hover:text-red-600 transition-colors duration-200"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="currentColor"
            d="M12 2C10.343 2 9 3.343 9 5V5.268C6.165 6.14 4 8.828 4 12V17L2 19V20H22V19L20 17V12C20 8.828 17.835 6.14 15 5.268V5C15 3.343 13.657 2 12 2ZM12 22C13.104 22 14 21.104 14 20H10C10 21.104 10.896 22 12 22Z"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute -right-[240px] mt-[17px] flex h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark sm:w-[361px] lg:right-0"
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-700">
          <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Notifications
          </h5>
          <button
            onClick={toggleMute}
            className="text-sm text-gray-500 dark:text-gray-300 hover:text-blue-600"
            title="Toggle sound"
          >
            {isMuted ? "🔇" : "🔔"}
          </button>
        </div>

        <div className="overflow-y-auto max-h-[400px] space-y-4 pr-1">
          {notifications.length === 0 ? (
            <p className="text-gray-500 text-sm text-center">
              No notifications
            </p>
          ) : (
            Object.entries(groupedNotifications).map(([date, notifs]) => (
              <div key={date}>
                <h6 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">
                  {date}
                </h6>
                <div className="space-y-2">
                  {notifs.map((notif: any) => (
                    <DropdownItem
                      key={notif._id}
                      className="flex flex-col p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
                    >
                      <p className="text-sm text-gray-800 dark:text-white">
                        {notif.msg}
                      </p>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {dayjs(notif.timestamp).format("hh:mm A")}
                      </div>
                      <div className="text-xs text-orange-500 font-medium capitalize">
                        {notif.type}
                      </div>
                    </DropdownItem>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </Dropdown>
    </div>
  );
}
