import axios from "axios";
import oauth from "axios-oauth-client";
import qs from "querystringify";

const requestToken = async (client, options) => {
  const authRequest = oauth.client(client, options);
  const authCode = await authRequest();

  if (typeof authCode === "string") {
    const authParsed = qs.parse(authCode);

    return {
      accessToken: authParsed.access_token,
      refreshToken: authParsed.refresh_token,
    };
  }

  return {
    accessToken: authCode.access_token,
    refreshToken: authCode.refresh_token,
  };
};

export const exchangeToken = async ({
  code,
  state,
  clientId,
  tokenUrl,
  callbackUrl,
  codeVerifier,
}) => {
  return requestToken(axios.create(), {
    url: tokenUrl,
    grant_type: "authorization_code",
    state: state,
    client_id: clientId,
    redirect_uri: callbackUrl,
    code: code,
    code_verifier: codeVerifier,
  });
};

export const buildAuthorizeUrl = (
  authorizeUrl,
  {
    clientId,
    callbackUrl,
    scope = "",
    codeChallenge,
    codeChallengeMethod = "S256",
    state = "",
  }
) => {
  const authorizeParams = qs.stringify(
    {
      client_id: clientId,
      redirect_uri: callbackUrl,
      response_type: "code",
      state: state,
      scope: scope,
      code_challenge: codeChallenge,
      code_challenge_method: codeChallengeMethod,
    },
    true
  );

  return `${authorizeUrl}${authorizeParams}`;
};
