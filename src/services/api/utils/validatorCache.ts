
// Cache utility for validator information
import { ValidatorInfo } from "../types";

// Cache for validator details to improve performance
const validatorInfoCache = new Map<string, ValidatorInfo & { timestamp: number }>();
const CACHE_VALIDITY_MS = 5 * 60 * 1000; // 5 minutes

export const getFromCache = (
  votePubkey: string
): { validatorInfo: ValidatorInfo; timestamp: number } | null => {
  const now = Date.now();
  const cachedInfo = validatorInfoCache.get(votePubkey);
  
  if (cachedInfo && now - cachedInfo.timestamp < CACHE_VALIDITY_MS) {
    const { timestamp, ...validatorInfo } = cachedInfo;
    return { validatorInfo, timestamp };
  }
  
  return null;
};

export const saveToCache = (
  votePubkey: string, 
  validatorInfo: ValidatorInfo
): void => {
  validatorInfoCache.set(votePubkey, { 
    ...validatorInfo, 
    timestamp: Date.now() 
  });
};
