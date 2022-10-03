import {
  ActionIcon,
  Box,
  Button,
  Group,
  Image,
  SimpleGrid,
  Text,
} from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { useEffect, useRef, useState } from "react";
import { X } from "tabler-icons-react";

export interface FileUploadProps {
  dropzoneText: string;
  multiple: boolean;
  onFilesChange: (files: File[]) => void;
}

const FileUpload = ({
  dropzoneText,
  multiple,
  onFilesChange,
}: FileUploadProps) => {
  const openRef = useRef<() => void>(null);
  const [files, setFiles] = useState<File[]>([]);

  const previews = files.map((file, index) => {
    const imageUrl = URL.createObjectURL(file);
    return (
      <Box key={imageUrl} sx={{ position: "relative" }} p="lg">
        <ActionIcon
          onClick={() => {
            setFiles(files.filter((f, i) => i !== index));
          }}
          sx={{
            position: "absolute",
            top: "0px",
            right: "0",
            zIndex: 1,
          }}
          color="red"
          size="xl"
          radius="xl"
          variant="filled"
        >
          <X />
        </ActionIcon>
        <Image
          key={imageUrl}
          src={imageUrl}
          withPlaceholder
          alt="Upload Preview"
          imageProps={{ onLoad: () => URL.revokeObjectURL(imageUrl) }}
        />
      </Box>
    );
  });

  useEffect(() => {
    onFilesChange(files);
  }, [files, onFilesChange]);

  return (
    <div>
      <Dropzone
        multiple={multiple}
        accept={IMAGE_MIME_TYPE}
        onDrop={setFiles}
        openRef={openRef}
        hidden={previews.length > 0}
      >
        <Text align="center">{dropzoneText}</Text>
      </Dropzone>

      <SimpleGrid
        cols={4}
        breakpoints={[{ maxWidth: "sm", cols: 1 }]}
        mt={previews.length > 0 ? "xl" : 0}
      >
        {previews}
      </SimpleGrid>

      {previews.length > 0 && multiple && (
        <Group position="center" mt="md">
          <Button onClick={() => openRef.current?.()}>
            Choose another file
          </Button>
        </Group>
      )}
    </div>
  );
};

export default FileUpload;
