import React, { useState, useReducer, useEffect } from "react";
import { Accordion, Panel } from "baseui/accordion";
import { ChevronDown, ChevronUp } from "baseui/icon";
import { Button, KIND } from "baseui/button";
import { Tabs, Tab } from "baseui/tabs";
import { Textarea } from "baseui/textarea";
import { StyledSpinnerNext as Spinner } from "baseui/spinner";
import { Block } from "baseui/block";
import { useAsync } from "react-async";
import { Notification, KIND as NOTIF_KIND } from "baseui/notification";
import { useCurrentRoute } from "react-navi";
import { styled } from "baseui";
import { isEmpty } from "lodash";
import {
  getChallengePair,
  getState,
  urlParse,
  urlJoin,
  toCurl,
} from "snowboard-theme-helper";
import LoginButton from "../LoginButton";
import { sendRequest, isAuth } from "../../lib/helper";
import { useStore } from "../../lib/store";
import HeaderPanel from "./HeaderPanel";
import ParameterPanel from "./ParameterPanel";
import ResponsePanel from "./ResponsePanel";
import {
  copyUrl,
  fullUrl,
  isAllowBody,
  populate,
  formatCurl,
  prepareHeaders,
  updateHeader,
  updateParameter,
} from "../../lib/playground";

const Pre = styled("pre", ({ $theme }) => ({
  backgroundColor: $theme.colors.tabBarFill,
  color: $theme.colors.contentPrimary,
  paddingTop: $theme.sizing.scale400,
  paddingBottom: $theme.sizing.scale400,
  paddingLeft: $theme.sizing.scale800,
  paddingRight: $theme.sizing.scale800,
  whiteSpace: "pre",
  overflowY: "auto",
}));

const ErrorNotification = ({ error }) => {
  return (
    <Notification
      kind={NOTIF_KIND.negative}
      overrides={{
        Body: { style: { width: "auto" } },
      }}
    >
      {() => error.message}
    </Notification>
  );
};

export default function ({ transition, config }) {
  const [transaction] = transition.transactions;
  const [store] = useStore();

  const getEnvironment = (env) => {
    return config.playground.environments[env];
  };

  const getCurrentUrl = (env) => {
    const environment = getEnvironment(env);
    return urlParse(urlJoin(environment.url, transition.path));
  };

  const initialState = {
    environment: getEnvironment(store.env),
    currentUrl: getCurrentUrl(store.env),
    headers: prepareHeaders(
      store,
      getEnvironment(store.env),
      transaction.request.headers
    ),
    parameters: transition.parameters.map((val) => {
      const param = Object.assign({}, val);
      param.used = true;
      return param;
    }),
    body: undefined,
    response: undefined,
  };

  function reducer(state, action) {
    switch (action.type) {
      case "set-environment":
        return {
          ...state,
          environment: getEnvironment(action.env),
          currentUrl: getCurrentUrl(action.env),
          headers: prepareHeaders(
            store,
            getEnvironment(store.env),
            transaction.request.headers
          ),
        };
      case "set-header":
        return updateHeader(state, action.name, { value: action.value });
      case "toggle-header":
        return updateHeader(state, action.name, { checked: action.checked });
      case "set-parameter":
        return updateParameter(state, action.name, { value: action.value });
      case "toggle-parameter":
        return updateParameter(state, action.name, { checked: action.checked });
      case "set-body":
        const { body, ...rest } = state;
        return { body: action.body, ...rest };
      case "reset":
        return initialState;
      default:
        throw new Error();
    }
  }

  const [expanded, setExpanded] = useState(true);
  const [copying, setCopying] = useState(false);
  const [activeTab, setActiveTab] = React.useState("0");
  const [state, dispatch] = useReducer(reducer, initialState);

  const route = useCurrentRoute();
  const challengePair = getChallengePair();
  const codeState = getState();

  const doRequest = (
    [environment, method, pathTemplate, headers, parameters, body],
    props,
    { signal }
  ) => {
    return sendRequest({
      environment: environment,
      method: method,
      pathTemplate: pathTemplate,
      headers: headers,
      parameters: parameters,
      body: body,
    });
  };

  const { isLoading, data, error, run, setData } = useAsync({
    deferFn: doRequest,
  });

  useEffect(() => {
    dispatch({ type: "reset" });
    setData(undefined);
  }, [route]);

  useEffect(() => {
    dispatch({ type: "set-environment", env: store.env });
  }, [store.env]);

  const [currentFullUrl, setCurrentFullUrl] = useState(
    fullUrl(state.currentUrl, populate(state.parameters))
  );

  const [curl, setCurl] = useState(
    toCurl({
      environment: state.environment,
      pathTemplate: transition.pathTemplate,
      method: transition.method,
      body: state.body,
      headers: populate(state.headers),
      parameters: populate(state.parameters),
    })
  );

  useEffect(() => {
    setCurrentFullUrl(fullUrl(state.currentUrl, populate(state.parameters)));
    setCurl(
      toCurl({
        environment: state.environment,
        pathTemplate: transition.pathTemplate,
        method: transition.method,
        body: state.body,
        headers: populate(state.headers),
        parameters: populate(state.parameters),
      })
    );
  }, [state]);

  function handleCopy() {
    setCopying(true);

    setTimeout(() => {
      setCopying(false);
    }, 2000);

    copyUrl(state.currentUrl, populate(state.parameters));
  }

  function onParameterChange(event, name) {
    dispatch({
      type: "set-parameter",
      name: name,
      value: event.target.value,
    });
  }

  function setParameterChecked(event, name) {
    dispatch({
      type: "toggle-parameter",
      name: name,
      checked: event.target.checked,
    });
  }

  function onHeaderChange(event, name) {
    dispatch({
      type: "set-header",
      name: name,
      value: event.target.value,
    });
  }

  function setHeaderChecked(event, name) {
    dispatch({
      type: "toggle-header",
      name: name,
      checked: event.target.checked,
    });
  }

  function isSendEnabled() {
    if (isAuth(state.environment, "oauth2")) {
      return !isEmpty(store.token);
    }

    return true;
  }

  return (
    <Accordion
      overrides={{
        Header: {
          style: ({ $expanded, $theme }) => {
            return {
              marginTop: $theme.sizing.scale800,
              borderTop: `1px solid ${
                $expanded ? $theme.colors.mono500 : $theme.colors.mono400
              }`,
              backgroundColor: $theme.colors.backgroundTertiary,
              color: $theme.colors.contentPrimary,
            };
          },
        },
        Content: {
          style: ({ $theme }) => {
            return {
              backgroundColor: $theme.colors.backgroundSecondary,
              color: $theme.colors.contentPrimary,
              paddingLeft: $theme.sizing.scale500,
              paddingRight: $theme.sizing.scale500,
            };
          },
        },
        ToggleIcon: (props) => {
          if (props.$expanded) {
            return <ChevronDown />;
          }
          return <ChevronUp />;
        },
      }}
      onChange={(props) => {
        setExpanded(props.expanded.length != 0);
      }}
    >
      <Panel title="API Playground" expanded={expanded}>
        <Button
          kind={KIND.primary}
          onClick={() => {
            handleCopy();
          }}
          overrides={{
            BaseButton: { style: { width: "80%", justifyContent: "start" } },
          }}
        >
          {copying ? "URL has been copied to clipboard." : currentFullUrl}
        </Button>

        {isSendEnabled() ? (
          <Button
            onClick={() => {
              run(
                state.environment,
                transition.method,
                transition.pathTemplate,
                populate(state.headers),
                populate(state.parameters),
                state.body
              );
            }}
            overrides={{
              BaseButton: { style: { width: "20%" } },
            }}
          >
            SEND
          </Button>
        ) : (
          <LoginButton
            authOptions={state.environment.auth.options}
            codeChallenge={challengePair.codeChallenge}
            codeState={codeState}
          />
        )}

        <Pre>{formatCurl(curl)}</Pre>

        <Tabs
          onChange={({ activeKey }) => {
            setActiveTab(activeKey);
          }}
          activeKey={activeTab}
          overrides={{
            Root: {
              style: ({ $theme }) => {
                return {
                  marginTop: $theme.sizing.scale800,
                };
              },
            },
            TabContent: {
              style: ({ $theme }) => {
                return {
                  paddingLeft: $theme.sizing.scale400,
                  paddingRight: $theme.sizing.scale400,
                  backgroundColor: $theme.colors.backgroundPrimary,
                  borderWidth: "1px",
                  borderStyle: "solid",
                  borderColor: $theme.colors.borderTransparent,
                };
              },
            },
          }}
        >
          <Tab title="Parameters">
            <ParameterPanel
              parameters={state.parameters}
              onChange={onParameterChange}
              setChecked={setParameterChecked}
            />
          </Tab>
          <Tab title="Headers">
            <HeaderPanel
              headers={state.headers}
              onChange={onHeaderChange}
              setChecked={setHeaderChecked}
            />
          </Tab>
          <Tab title="Body">
            {!isAllowBody(transition.method) ? (
              <Block
                overrides={{
                  Block: {
                    style: { textAlign: "center" },
                  },
                }}
              >
                <em>Body is only available for POST, PUT and PATCH.</em>
              </Block>
            ) : (
              <Block marginTop="scale400" marginBottom="scale400">
                <Textarea
                  value={state.body}
                  onChange={(e) =>
                    dispatch({ type: "set-body", body: e.target.value })
                  }
                  autoFocus
                />
              </Block>
            )}
          </Tab>
        </Tabs>

        <Block>
          {isLoading && <Spinner />}
          {error && <ErrorNotification error={error} />}
          {!error && data && <ResponsePanel response={data} />}
        </Block>
      </Panel>
    </Accordion>
  );
}
