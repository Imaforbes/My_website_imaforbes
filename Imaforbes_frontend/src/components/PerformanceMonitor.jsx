// src/components/PerformanceMonitor.jsx
import { useEffect } from "react";

const PerformanceMonitor = () => {
  useEffect(() => {
    // Only monitor in development mode
    if (
      import.meta.env.DEV &&
      typeof window !== "undefined" &&
      "performance" in window
    ) {
      // Monitor Largest Contentful Paint (LCP)
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === "largest-contentful-paint") {
            console.log("LCP:", entry.startTime);
          }
        }
      });

      try {
        observer.observe({ entryTypes: ["largest-contentful-paint"] });
      } catch (e) {
        // Fallback for browsers that don't support LCP
      }

      // Monitor First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === "first-input") {
            console.log("FID:", entry.processingStart - entry.startTime);
          }
        }
      });

      try {
        fidObserver.observe({ entryTypes: ["first-input"] });
      } catch (e) {
        // Fallback for browsers that don't support FID
      }

      // Monitor Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        console.log("CLS:", clsValue);
      });

      try {
        clsObserver.observe({ entryTypes: ["layout-shift"] });
      } catch (e) {
        // Fallback for browsers that don't support CLS
      }

      return () => {
        observer.disconnect();
        fidObserver.disconnect();
        clsObserver.disconnect();
      };
    }
  }, []);

  return null; // This component doesn't render anything
};

export default PerformanceMonitor;
