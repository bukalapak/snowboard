import React, { useEffect, useState } from "react";
import { Block } from "baseui/block";
import qs from "querystringify";
import { useNavigation } from "react-navi";
import {
  exchangeToken,
  getState,
  clearState,
  getChallengePair,
  clearChallengePair,
  setRefreshToken,
} from "snowboard-theme-helper";
import Markdown from "../components/Markdown";
import { useStore } from "../lib/store";
import { isAuth } from "../lib/helper";

export default function Home({ config, description }) {
  const [store, dispatch] = useStore();
  const navigation = useNavigation();
  const challengePair = getChallengePair();

  useEffect(() => {
    if (config.playground.enabled) {
      const environment = config.playground.environments[store.env];
      const authParam = qs.parse(location.search);

      if (isAuth(environment, "oauth2")) {
        if (authParam.code) {
          const process = async () => {
            const { accessToken, refreshToken } = await exchangeToken({
              code: authParam.code,
              state: getState(),
              clientId: environment.auth.options.clientId,
              tokenUrl: environment.auth.options.tokenUrl,
              callbackUrl: environment.auth.options.callbackUrl,
              codeVerifier: challengePair.codeVerifier,
            });

            if (accessToken) {
              dispatch({
                type: "setToken",
                env: store.env,
                token: accessToken,
              });

              if (refreshToken) {
                setRefreshToken(store.env, refreshToken);
              }
            }

            clearChallengePair();
            clearState();

            if (store.redirectTo) {
              navigation.navigate(store.redirectTo);
            }
          };

          process();
        }
      }
    }
  }, []);

  return (
    <Block marginRight="scale800">
      <Markdown source={description} />
    </Block>
  );
}
