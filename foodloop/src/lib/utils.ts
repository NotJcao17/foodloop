import { differenceInHours, differenceInDays, format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export function getExpiryInfo(expirationDate: string): {
  label: string;
  color: "green" | "yellow" | "red";
  urgent: boolean;
} {
  const now = new Date();
  const expiry = parseISO(expirationDate + "T23:59:59");
  const hours = differenceInHours(expiry, now);
  const days = differenceInDays(expiry, now);

  if (hours <= 0) return { label: "Expirado", color: "red", urgent: true };
  if (hours <= 24) return { label: `${hours}h restantes`, color: "red", urgent: true };
  if (days <= 2) return { label: `${days} día${days > 1 ? "s" : ""}`, color: "yellow", urgent: false };
  return { label: `${days} días`, color: "green", urgent: false };
}

export function formatDate(date: string) {
  return format(parseISO(date), "d 'de' MMMM", { locale: es });
}

export function formatTime(date: string) {
  return format(parseISO(date), "HH:mm", { locale: es });
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}
