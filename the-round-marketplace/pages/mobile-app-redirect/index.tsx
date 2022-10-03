import { useOs } from "@mantine/hooks";
import { useRouter } from "next/router";
import { useEffect } from "react";

const MobileAppRedirect = () => {
  const router = useRouter();
  const os = useOs();

  useEffect(() => {
    if (os === "ios") {
      window.location.href =
        "https://apps.apple.com/gb/app/the-round/id1560213647";
    }

    if (os === "android") {
      window.location.href =
        "https://play.google.com/store/apps/details?id=com.RealityCheck.TheRound&hl=en&gl=us";
    }

    router.push("/");
  }, [os, router]);

  return <p>You should not be seeing this... please go back...</p>;
};

export default MobileAppRedirect;
