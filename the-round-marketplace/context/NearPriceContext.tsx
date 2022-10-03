import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import React, { useContext, useEffect } from "react";

interface NearPriceContextValue {
  nearPrice: number | undefined;
  refresh: () => void;
}

const NearPriceContext = React.createContext<NearPriceContextValue | null>(
  null
);

export const NearPriceContextProvider = ({ children }: any) => {
  const getCurrentNearPrice: () => Promise<number> = async () => {
    const { data } = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price?ids=NEAR&vs_currencies=USD"
    );

    return data.near.usd as number;
  };

  const { data, refetch } = useQuery(["near_price"], getCurrentNearPrice);

  useEffect(() => {
    const intervalId = setInterval(() => {
      refetch();
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <NearPriceContext.Provider
      value={{
        nearPrice: data,
        refresh: () => {
          refetch();
        },
      }}
    >
      {children}
    </NearPriceContext.Provider>
  );
};

export function useNearPriceContext() {
  const context = useContext(NearPriceContext);

  if (!context) {
    throw new Error(
      "useNearPriceContext must be used within a NearPriceContextProvider"
    );
  }

  return context;
}
