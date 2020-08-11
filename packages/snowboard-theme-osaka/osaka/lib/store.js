import React, { useReducer, useContext } from "react";
import { getEnv, setEnv, setToken, getToken } from "snowboard-theme-helper";
import { basePath } from "./helper";

const StoreContext = React.createContext();

const initialState = {
  env: getEnv(),
  token: getToken(),
  redirectTo: basePath,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "setEnv":
      setEnv(action.env);
      return { ...state, env: action.env };
    case "setRedirectTo":
      return { ...state, redirectTo: action.redirectTo };
    case "setToken":
      setToken(action.env, action.token);
      return { ...state, env: action.env, token: action.token };
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
