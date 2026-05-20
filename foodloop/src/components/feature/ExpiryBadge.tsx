"use client";
import { getExpiryInfo } from "@/lib/utils";

const colorMap = {
  green:  "bg-green-100 text-green-800",
  yellow: "bg-amber-100 text-amber-800",
  red:    "bg-red-100 text-red-800",
};

export function ExpiryBadge({ date }: { date: string }) {
  const { label, color } = getExpiryInfo(date);
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${colorMap[color]}`}>
      {label}
    </span>
  );
}
