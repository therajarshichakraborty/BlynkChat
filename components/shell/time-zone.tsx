"use client";

import { createContext, use, type ReactNode } from "react";

const TimeZoneContext = createContext("UTC");

type TimeZoneProviderProps = {
  timeZone: string;
  children: ReactNode;
};

export function TimeZoneProvider({ timeZone, children }: TimeZoneProviderProps) {
  return <TimeZoneContext value={timeZone}>{children}</TimeZoneContext>;
}

export function useTimeZone() {
  return use(TimeZoneContext);
}
