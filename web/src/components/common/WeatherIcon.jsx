import { Cloud, CloudDrizzle, CloudRain, CloudSun, Sun } from 'lucide-react';

export default function WeatherIcon({ rainMm = 0, tempC = 0, className = 'h-9 w-9' }) {
  let Icon = Cloud;
  let color = 'text-slate-500 dark:text-slate-300';
  if (rainMm >= 8) {
    Icon = CloudRain;
    color = 'text-sky-600 dark:text-sky-400';
  } else if (rainMm >= 1) {
    Icon = CloudDrizzle;
    color = 'text-sky-600 dark:text-sky-400';
  } else if (tempC >= 29) {
    Icon = Sun;
    color = 'text-amber-500 dark:text-amber-400';
  } else if (tempC >= 22) {
    Icon = CloudSun;
    color = 'text-amber-500 dark:text-amber-400';
  }
  return <Icon className={`${className} ${color}`} aria-hidden="true" />;
}
