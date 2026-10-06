"use client";

import { createContext, useContext } from "react";

export type MemberData = {
  id: string;
  username: string;
  email: string | null;
  phone: string | null;
  personalNumber: string;
  firstName: string | null;
  lastName: string | null;
  parish: string | null;
  level: string | null;
  avatarUrl: string | null;
  isAdmin: boolean;
  roles: Array<{
    roleName: string | null;
    isPrincipal: boolean | null;
    scope: string | null;
  }>;
};

export type MemberNotification = {
  id: string;
  title: string;
  content: string;
  readAt: string | null;
  createdAt: string;
};

export type MemberContextValue = {
  member: MemberData;
  setMember: (member: MemberData) => void;
  notifications: MemberNotification[];
};

export const MemberContext = createContext<MemberContextValue | null>(null);

export function useMember() {
  const value = useContext(MemberContext);
  if (!value) {
    throw new Error("useMember doit être utilisé dans l’espace membre.");
  }
  return value;
}
