import { Loader } from "@mantine/core";
import { GoogleMap, MarkerF, useLoadScript } from "@react-google-maps/api";
import { useState } from "react";

interface GoogleMapProps {
  height: string;
  center: { lat: number; lng: number };
  zoom?: number;
  marker: { lat: number; lng: number } | null;
  isEditable: boolean;
  onMarkerChange?: (location: { lat: number; lng: number }) => void;
}

const Map = ({
  height,
  center,
  zoom,
  marker,
  isEditable,
  onMarkerChange,
}: GoogleMapProps) => {
  const [markerLocation, setMarkerLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyCNpEuzahvLK7dsbPYuh7xmdZoNQKwn3hk",
  });

  return isLoaded ? (
    <GoogleMap
      center={center}
      zoom={zoom ?? 8}
      mapContainerStyle={{
        margin: "20px 0 0",
        height,
        width: "100%",
        border: "1.5px solid #ccc",
        borderRadius: "4px",
      }}
      onClick={(e) => {
        if (isEditable) {
          setMarkerLocation({
            lat: e.latLng?.lat() ?? 0,
            lng: e.latLng?.lng() ?? 0,
          });

          onMarkerChange?.({
            lat: e.latLng?.lat() ?? 0,
            lng: e.latLng?.lng() ?? 0,
          });
        }
      }}
    >
      {markerLocation !== null && <MarkerF position={markerLocation} />}
    </GoogleMap>
  ) : (
    <Loader size="lg" />
  );
};

export default Map;
