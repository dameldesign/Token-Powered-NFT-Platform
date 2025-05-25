import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const shortenAddress = (address: string) => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatBalance = (balance: string, decimals: number = 18) => {
  if (!balance) return "0";
  return (parseInt(balance) / 10 ** decimals).toFixed(2);
};

export const getNFTImageFromMetadata = async (tokenURI: string) => {
  try {
    const response = await fetch(tokenURI);
    const metadata = await response.json();
    return metadata.image || "";
  } catch (error) {
    console.error("Error fetching NFT metadata:", error);
    return "";
  }
};

export const handleError = (error: any) => {
  console.error("Error:", error);
  if (error.code === "ACTION_REJECTED") {
    return "Transaction rejected by user";
  } else if (error.message) {
    return error.message.includes("execution reverted") 
      ? error.message.split("execution reverted:")[1]?.trim() || "Transaction failed"
      : error.message;
  }
  return "An unknown error occurred";
};