import React from "react";
import Breadcrumb from "../components/Breadcrumb";
import JSONTree from "../components/JSONTree";
import Markdown from "../components/Markdown";
import { H3 } from "baseui/typography";
import { Block } from "baseui/block";
import { Card, StyledBody, StyledAction } from "baseui/card";
import { StatefulTabs, Tab } from "baseui/tabs";
import { Button, KIND } from "baseui/button";
import { Accordion, Panel } from "baseui/accordion";
import HeaderTable from "../components/HeaderTable";
import ParameterTable from "../components/ParameterTable";
import MethodButton from "../components/MethodButton";
import { toTransactions } from "snowboard-theme-helper";

export default ({ transition }) => {
  const transactions = toTransactions(transition.transactions);

  return (
    <>
      <Block marginTop="scale800">
        <Breadcrumb
          group={transition.meta.group}
          resource={transition.meta.resource}
          transition={transition}
        />
      </Block>
      <H3>{transition.title}</H3>
      <Markdown source={transition.description} />

      <Block marginTop="scale800">
        <MethodButton
          method={transition.method}
          path={transition.path}
          pathTemplate={transition.pathTemplate}
        />
      </Block>

      {transition.parameters.length > 0 && (
        <Block marginTop="scale800">
          <ParameterTable parameters={transition.parameters} />
        </Block>
      )}

      <Block marginTop="scale800">
        {transactions.map((transaction, index) => (
          <Block marginBottom="scale800" key={index}>
            <Transaction transaction={transaction} index={index} />
          </Block>
        ))}
      </Block>
    </>
  );
};

function Transaction({ transaction, index }) {
  const { request, responses } = transaction;

  const title =
    request.title === "" ? `Request #${index + 1}` : `Request ${request.title}`;

  return (
    <Card
      overrides={{
        Root: {
          style: ({ $theme }) => {
            return {
              borderTopWidth: "1px",
              borderBottomWidth: "1px",
              borderRightWidth: "1px",
              borderLeftWidth: "1px"
            };
          }
        }
      }}
    >
      <StyledAction>
        <Button
          overrides={{
            BaseButton: { style: { width: "100%" } }
          }}
          kind={KIND.primary}
        >
          {title}
        </Button>
      </StyledAction>
      <StyledBody>
        {request.headers.length > 0 && (
          <Block marginTop="scale800" marginBottom="scale800">
            <HeaderTable headers={request.headers} />
          </Block>
        )}

        {request.body && (
          <Block marginBottom="scale600">
            <StatefulTabs
              initialState={{ activeKey: "0" }}
              overrides={{
                TabBar: {
                  style: ({ $theme }) => {
                    return {
                      justifyContent: "center",
                      backgroundColor: $theme.colors.buttonPrimaryActive,
                      backgroundColor: $theme.colors.buttonPrimaryText
                    };
                  }
                }
              }}
            >
              <Tab title="Body">
                <JSONTree
                  src={request.body}
                  contentType={request.contentType}
                />
              </Tab>
              <Tab title="Schema">
                <JSONTree src={request.schema} contentType="application/json" />
              </Tab>
            </StatefulTabs>
          </Block>
        )}

        <Accordion>
          {responses.map((response, index) => (
            <Panel
              title={`Response ${response.statusCode}`}
              key={index}
              expanded={index === 0}
            >
              {response.description !== "" && (
                <Block marginBottom="scale1000">
                  <Markdown source={response.description} />
                </Block>
              )}
              <Block marginBottom="scale1000">
                <HeaderTable headers={response.headers} />
              </Block>
              <StatefulTabs initialState={{ activeKey: "0" }}>
                <Tab title="Body">
                  <JSONTree
                    src={response.body}
                    contentType={response.contentType}
                  />
                </Tab>
                <Tab title="Schema">
                  <JSONTree
                    src={response.schema}
                    contentType="application/json"
                  />
                </Tab>
              </StatefulTabs>
            </Panel>
          ))}
        </Accordion>
      </StyledBody>
    </Card>
  );
}
