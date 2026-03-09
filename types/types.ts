import React from "react";

export interface User {
  name: string;
  avatar: string;
  isLoggedIn: boolean;
}

export interface MenuItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  color?: string;
  active?: boolean;
}
