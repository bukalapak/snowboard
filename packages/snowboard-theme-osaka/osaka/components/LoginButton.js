import React from "react";
import { Button } from "baseui/button";
import { buildAuthorizeUrl } from "snowboard-theme-helper";
import { useCurrentRoute } from "react-navi";
import { useStore } from "../lib/store";

export default function ({ authOptions, codeChallenge, codeState }) {
  const route = useCurrentRoute();
  const [store, dispatch] = useStore();

  const authorizeUrl = buildAuthorizeUrl(authOptions.authorizeUrl, {
    clientId: authOptions.clientId,
    callbackUrl: authOptions.callbackUrl,
    state: codeState,
    scope: authOptions.scopes,
    codeChallenge: codeChallenge,
  });

  function handleClick() {
    dispatch({ type: "setRedirectTo", value: route.url.pathname });
    window.location = authorizeUrl;
  }

  return (
    <Button
      onClick={handleClick}
      overrides={{
        BaseButton: { style: { width: "20%" } },
      }}
    >
      LOGIN
    </Button>
  );
}
