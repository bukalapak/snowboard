import React, { useReducer, useContext } from "react";
import { getEnv, setEnv } from "snowboard-theme-helper";

const StoreContext = React.createContext();

const initialState = {
  env: getEnv()
};

const reducer = (state, action) => {
  switch (action.type) {
    case "setEnv":
      setEnv(action.env);
      return { ...state, env: action.env };
    default:
      throw new Error("unexpected action");
  }
};

export const StoreProvider = ({ children }) => {
  const value = useReducer(reducer, initialState);

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
};

export const useStore = () => {
  return useContext(StoreContext);
};
