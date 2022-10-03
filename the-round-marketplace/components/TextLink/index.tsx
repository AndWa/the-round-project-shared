import { Text } from "@mantine/core";
import Link from "next/link";
import { useRouter } from "next/router";

const customerLinks = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Venues",
    href: "/venues",
  },
  {
    label: "Events",
    href: "/events",
  },
];

const TextLink = ({ label, href }: { label: string; href: string }) => {
  const router = useRouter();

  return (
    <Link href={href}>
      <Text
        underline={router.pathname === href}
        sx={{
          fontSize: 32,
          textUnderlineOffset: 6,
          cursor: "pointer",
          ":hover": { textDecoration: "underline" },
        }}
        size="xl"
        weight={500}
      >
        {label}
      </Text>
    </Link>
  );
};

export { TextLink, customerLinks };
