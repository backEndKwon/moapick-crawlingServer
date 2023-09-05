import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const imgSrc = {
  wanted: "https://d1elz4g2bnstoc.cloudfront.net/logo/Logo_wanted_294x94.png",
  intellipick:
    "https://d1elz4g2bnstoc.cloudfront.net/logo/Logo_intellipick_294x94.png",
  greeting:
    "https://d1elz4g2bnstoc.cloudfront.net/logo/Logo_greeting_294x94.png",
  ninehire:
    "https://d1elz4g2bnstoc.cloudfront.net/logo/Logo_ninehire_294x94.png",
  greeting_small:
    "https://d1elz4g2bnstoc.cloudfront.net//Users/bangminseog/Documents/image%2011.png",
  moapcik_logo:
    "https://d1elz4g2bnstoc.cloudfront.net//Users/bangminseog/Documents/Logo_%E1%84%8B%E1%85%A7%E1%86%BC%E1%84%86%E1%85%AE%E1%86%AB.png",
};
