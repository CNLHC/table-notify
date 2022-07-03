import type { AppProps } from "next/app";
import "antd/dist/antd.css";
import React from "react";
import { LoadingContext, useLoadingValue } from "../libs/loading";
import { getOrInitializeStore } from "../libs/state";
import { Provider } from "react-redux";
import "./global.css";

type UserKeyContext = {
  logout: () => void;
  isValid: boolean;
  setKey: React.Dispatch<React.SetStateAction<string | undefined>>;
  key: string | undefined;
};
export const AuthContext = React.createContext<UserKeyContext>(
  {} as UserKeyContext
);
const redux_store = getOrInitializeStore();

export default function MyApp({ Component, pageProps }: AppProps) {
  const loading_value = useLoadingValue();

  return (
    <Provider store={redux_store}>
      <LoadingContext.Provider value={loading_value}>
        <Component {...pageProps} />
      </LoadingContext.Provider>
    </Provider>
  );
}
