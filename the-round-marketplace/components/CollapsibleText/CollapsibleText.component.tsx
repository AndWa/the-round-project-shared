import { Button, Collapse, Text } from "@mantine/core";
import { useState } from "react";

const CollabsibleText = ({
  children,
  characterLimit,
}: React.PropsWithChildren<{ characterLimit?: number }>) => {
  const [opened, setOpened] = useState(false);
  const [isButtonHidden, setIsButtonHidden] = useState(false);

  const collabsible = (
    <Text>
      {!opened &&
        (children as string).substring(0, characterLimit ?? 30) + "..."}
      <Collapse
        in={opened}
        onTransitionEnd={() => {
          setIsButtonHidden(false);
        }}
      >
        {children}{" "}
        <Button
          hidden={isButtonHidden || !opened}
          compact
          variant="subtle"
          onClick={() => {
            setOpened((o) => !o);
            setIsButtonHidden(true);
          }}
        >
          Read Less
        </Button>
      </Collapse>{" "}
      <Button
        hidden={isButtonHidden || opened}
        compact
        variant="subtle"
        onClick={() => {
          setOpened((o) => !o);
          setIsButtonHidden(true);
        }}
      >
        Read More
      </Button>
    </Text>
  );

  return (
    <>
      {(children as string)?.length <= (characterLimit ?? 30) && (
        <Text>{children}</Text>
      )}
      {(children as string)?.length > (characterLimit ?? 30) && collabsible}{" "}
    </>
  );
};

export default CollabsibleText;
