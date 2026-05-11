import { useContext } from "react";

import { AuthContext } from "../providers/authProvider";

const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used inside AuthProvider");
  }

  return context;
};

export { useAuthContext };
