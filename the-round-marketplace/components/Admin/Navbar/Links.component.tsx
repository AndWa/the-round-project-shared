import { Box, NavLink, ThemeIcon } from "@mantine/core";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import {
  BuildingCarousel,
  BuildingStore,
  CalendarEvent,
  Logout,
  Ticket,
  User,
} from "tabler-icons-react";

const topSectionData = [
  {
    icon: <BuildingCarousel size={24} />,
    color: "cyan",
    label: "Venues",
    href: "/admin/venues",
  },
  {
    icon: <CalendarEvent size={24} />,
    color: "teal",
    label: "Events",
    href: "/admin/events",
  },
  {
    icon: <Ticket size={24} />,
    color: "blue",
    label: "Tickets",
    href: "/admin/tickets",
  },
  {
    icon: <BuildingStore size={24} />,
    color: "grape",
    label: "Merchandise",
    href: "/admin/merchandise",
  },
];

const adminSectionData = [
  {
    icon: <User size={24} />,
    color: "red",
    label: "Users",
    href: "/admin/users",
  },
];

const bottomSectionData = [
  {
    icon: <Logout size={24} />,
    color: "indigo",
    label: "Leave Admin",
    href: "/",
  },
];

export interface MainLinkProps {
  icon: React.ReactNode;
  color: string;
  label: string;
  href: string;
}

export function AdminLink({ icon, color, label, href }: MainLinkProps) {
  const router = useRouter();

  return (
    <Box mt={8}>
      <Link href={href} passHref>
        <NavLink
          label={label}
          sx={(theme) => ({
            padding: theme.spacing.xs,
            borderRadius: theme.radius.sm,
          })}
          color={color}
          variant="filled"
          active={router.pathname === href}
          icon={
            <ThemeIcon size="xl" color={color} variant="light">
              {icon}
            </ThemeIcon>
          }
        />
      </Link>
    </Box>
  );
}

export function VenueLinks() {
  const links = topSectionData.map((link) => (
    <AdminLink {...link} key={link.label} />
  ));
  return <div>{links}</div>;
}

export function AdminSectionLinks() {
  const links = adminSectionData.map((link) => (
    <AdminLink {...link} key={link.label} />
  ));
  return <div>{links}</div>;
}

export function BottomLinks() {
  const links = bottomSectionData.map((link) => (
    <AdminLink {...link} key={link.label} />
  ));
  return <div>{links}</div>;
}
