/* eslint-disable react-hooks/exhaustive-deps */
import {
  ActionIcon,
  Button,
  Center,
  CopyButton,
  Group,
  Progress,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useInterval, useOs } from "@mantine/hooks";
import { useQRCode } from "next-qrcode";
import { useEffect, useState } from "react";
import { Copy } from "tabler-icons-react";
import { useUserControllerGenerateOtpPassword } from "../../services/api/theRoundComponents";

const OtpGenerator = () => {
  const secondsExpiration = 30;
  const [seconds, setSeconds] = useState(0);
  const interval = useInterval(() => setSeconds((s) => s + 1), 1000);
  const { Canvas } = useQRCode();
  const os = useOs();

  const { data, isLoading, error, refetch } =
    useUserControllerGenerateOtpPassword({});

  useEffect(() => {
    if (data) {
      setSeconds(0);
      interval.start();
    } else {
      setSeconds(0);
      interval.stop();
    }
  }, [data]);

  useEffect(() => {
    if (seconds >= secondsExpiration) {
      interval.stop();
    }
  }, [seconds]);

  return (
    <Center>
      {isLoading && <Progress />}
      {data && seconds < secondsExpiration && ["ios", "android"].includes(os) && (
        <Stack>
          <Group>
            <Title>{data?.otp.toString()}</Title>

            <CopyButton value={data?.otp.toString()}>
              {({ copied, copy }) => (
                <ActionIcon size="lg" onClick={copy}>
                  <Copy size={26} />
                </ActionIcon>
              )}
            </CopyButton>
          </Group>

          <Progress
            color="orange"
            radius="xs"
            value={100 - 100 * (seconds / secondsExpiration)}
          />
          <Text align="center">{secondsExpiration - seconds} seconds left</Text>
          <Button onClick={() => refetch()}>Generate new</Button>
        </Stack>
      )}
      {data && seconds < secondsExpiration && !["ios", "android"].includes(os) && (
        <Stack>
          <Canvas
            text={data?.otp.toString() ?? "hakuna"}
            options={{
              type: "image/jpeg",
              quality: 0.3,
              level: "M",
              margin: 3,
              scale: 4,
              width: 200,
              color: {
                dark: "#000000",
                light: "#ffffff",
              },
            }}
          />
          <Progress
            color="orange"
            radius="xs"
            value={100 - 100 * (seconds / secondsExpiration)}
          />
          <Text align="center">{secondsExpiration - seconds} seconds left</Text>
          <Button onClick={() => refetch()}>Generate new</Button>
        </Stack>
      )}
      {error && <Text>{error.payload}</Text>}
      {seconds >= secondsExpiration && (
        <Button onClick={() => refetch()}>Generate new</Button>
      )}
    </Center>
  );
};

export default OtpGenerator;
