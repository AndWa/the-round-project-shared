import React, { useContext, useEffect, useState } from "react";
import {
  fetchUserControllerFindMe,
  fetchUserControllerOwnedNfts,
  fetchUserControllerVenuesOwned,
} from "../services/api/theRoundComponents";
import { Listing, User, Venue } from "../services/api/theRoundSchemas";

interface UserContextValue {
  user: User | null;
  roles: string[];
  venues: Venue[];
  ownedNfts: Listing[];
  onLogin: (token: string) => void;
  onSignOut: () => void;
  getUser: () => void;
}

const UserContext = React.createContext<UserContextValue | null>(null);

export const UserContextProvider = ({ children }: any) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [ownedNfts, setOwnedNfts] = useState<Listing[]>([]);

  const getOwnedNfts = () => {
    console.log("getOwnedNfts");
    fetchUserControllerOwnedNfts({}).then((nfts) => {
      console.log("nfts", nfts);
      localStorage.setItem("nfts", JSON.stringify(nfts));
      setOwnedNfts(nfts);
    });
  };

  const getUser = async () => {
    try {
      console.log("getUser");
      const userData = await fetchUserControllerFindMe({});
      localStorage.setItem("user", JSON.stringify(userData));
      setRoles(userData.roles);
      setUser(userData);

      if (userData.roles.includes("venue")) {
        const venues = await fetchUserControllerVenuesOwned({});
        localStorage.setItem("venues", JSON.stringify(venues));
        setVenues(venues);
      }

      getOwnedNfts();
    } catch {
      setUser(null);
      setRoles([]);
      setOwnedNfts([]);
      setVenues([]);
    }
  };

  useEffect(() => {
    const getUser = async () => {
      try {
        console.log("getUser");
        const userData = await fetchUserControllerFindMe({});
        localStorage.setItem("user", JSON.stringify(userData));
        setRoles(userData.roles);
        setUser(userData);

        if (userData.roles.includes("venue")) {
          const venues = await fetchUserControllerVenuesOwned({});
          localStorage.setItem("venues", JSON.stringify(venues));
          setVenues(venues);
        }

        getOwnedNfts();
      } catch {
        setUser(null);
        setRoles([]);
        setOwnedNfts([]);
        setVenues([]);
      }
    };

    if (token) {
      getUser();
    } else {
      setUser(null);
      setRoles([]);
      setOwnedNfts([]);
      setVenues([]);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      const existingToken = localStorage.getItem("token");
      if (existingToken) {
        setToken(existingToken);
      }
    }

    if (!user) {
      const existing = localStorage.getItem("user");
      if (existing) {
        setUser(JSON.parse(existing));
      }
    }

    if (!venues) {
      const existing = localStorage.getItem("venues");
      if (existing) {
        setVenues(JSON.parse(existing));
      }
    }

    if (!ownedNfts) {
      const existing = localStorage.getItem("nfts");
      if (existing) {
        setOwnedNfts(JSON.parse(existing));
      }
    }
  }, []);

  return (
    <UserContext.Provider
      value={{
        ownedNfts,
        venues,
        roles,
        user,
        onLogin: (token: string) => {
          localStorage.setItem("token", token);
          setToken(token);
        },
        onSignOut: () => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          localStorage.removeItem("venues");
          localStorage.removeItem("nfts");
          setToken(null);
          setUser(null);
          setRoles([]);
          setOwnedNfts([]);
          setVenues([]);
        },
        getUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export function useUserContext() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUserContext must be used within a UserContextProvider");
  }

  return context;
}
