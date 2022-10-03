import dynamic from "next/dynamic";
import { ModelViewerProps } from "./DynamicModelViewer";

const DyanmicModelViewer = dynamic(() => import("./DynamicModelViewer"), {
  ssr: false,
});

const ModelViewer = ({ src, poster, alt }: ModelViewerProps) => {
  return <DyanmicModelViewer src={src} poster={poster} alt={alt} />;
};

export default ModelViewer;
