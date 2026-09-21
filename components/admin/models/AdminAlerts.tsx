"use client";

import { useEffect } from "react";
import toast from "react-hot-toast";

export default function AdminAlerts() {
  useEffect(() => {
    const eventSource = new EventSource("/api/admin-alerts");

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      toast(`New Registration: ${data.email}`, {
        icon: "🚨",
        duration: 5000,
      });

      return () => {
        eventSource.close();
      };
    };
  }, []);

  return null;
}
