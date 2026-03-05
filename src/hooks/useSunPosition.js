import { useEffect, useState } from 'react';

export const useSunPosition = () => {
  const [sun, setSun] = useState({ shadowX: 0, shadowY: 10, blur: 20, intensity: 0.15, isDay: true });

  useEffect(() => {
    const calculateSun = () => {
      const d = new Date();
      const utc = d.getTime() + d.getTimezoneOffset() * 60000;
      const omanTime = new Date(utc + 4 * 3600000);
      const hour = omanTime.getHours() + omanTime.getMinutes() / 60;
      const sunrise = 6;
      const sunset = 18;
      const isDay = hour >= sunrise && hour <= sunset;

      if (!isDay) {
        setSun({ shadowX: 0, shadowY: 15, blur: 30, intensity: 0.2, isDay: false });
        return;
      }

      const fraction = (hour - sunrise) / (sunset - sunrise);
      const angle = fraction * Math.PI;
      setSun({
        shadowX: -Math.cos(angle) * 40,
        shadowY: (1.5 - Math.sin(angle)) * 28,
        blur: 28 - Math.sin(angle) * 12,
        intensity: 0.15 + Math.sin(angle) * 0.18,
        isDay: true
      });
    };

    calculateSun();
    const interval = setInterval(calculateSun, 60000);
    return () => clearInterval(interval);
  }, []);

  return sun;
};
