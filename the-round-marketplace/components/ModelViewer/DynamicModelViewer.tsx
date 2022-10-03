import "@google/model-viewer";
import { Box } from "@mantine/core";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": MyElementAttributes;
    }
    interface MyElementAttributes {
      src: string;
      poster: string;
      alt: string;
      ar: boolean;
    }
  }
}

export interface ModelViewerProps {
  src: string;
  poster: string;
  alt: string;
}

const DyanmicModelViewer = ({ src, poster, alt }: ModelViewerProps) => (
  <Box sx={{ width: "100%" }}>
    <model-viewer
      src={src}
      poster={poster}
      alt={alt}
      shadow-intensity="1"
      camera-controls
      auto-rotate
      ar
      ar-modes="scene-viewer webxr quick-look"
    ></model-viewer>
  </Box>
);

export default DyanmicModelViewer;
