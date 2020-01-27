import React, { useReducer, useContext } from "react";
import store from "store2";

const StoreContext = React.createContext();

const initialState = {
  env: store.get("env")
};

const reducer = (state, action) => {
  switch (action.type) {
    case "setEnv":
      store.set("env", action.env);
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
