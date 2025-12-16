import React from "react";
import CIcon from "@coreui/icons-react";
import { cilHome, cilFolder, cilGraph } from "@coreui/icons";
import { CNavItem, CNavTitle } from "@coreui/react";

const _nav = [
  {
    component: CNavTitle,
    name: "Movie Trend",
  },
  {
    component: CNavItem,
    name: "Home",
    to: "/introduction",
    icon: <CIcon icon={cilHome} customClassName="nav-icon" />,
    badge: {
      color: "info",
    },
  },
  {
    component: CNavItem,
    name: "Statistics",
    to: "/statistics",
    icon: <CIcon icon={cilGraph} customClassName="nav-icon" />,
    badge: {
      color: "info",
    },
  },
  {
    component: CNavItem,
    name: "Movies List",
    to: "/category",
    icon: <CIcon icon={cilFolder} customClassName="nav-icon" />,
    badge: {
      color: "info",
    },
  },
];

export default _nav;
