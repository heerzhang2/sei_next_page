import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function stripOrigin(url: string): string {
    try {
        const u = new URL(url);
        return u.pathname + u.search + u.hash;
    } catch {
        return url.startsWith('/') ? url : '/' + url;
    }
}
