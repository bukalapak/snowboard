import React, { useEffect } from "react";
import BusyIndicator from "react-busy-indicator";
import { useLoadingRoute } from "react-navi";
import { NotFoundBoundary } from "react-navi";
import { StyledLink } from "baseui/link";
import {
  HeaderNavigation,
  ALIGN,
  StyledNavigationList,
  StyledNavigationItem,
} from "baseui/header-navigation";
import { Block } from "baseui/block";
import { Grid, Cell } from "baseui/layout-grid";
import { getEnv } from "snowboard-theme-helper";
import Navigation from "./Navigation";
import { H6, Label3, Display4 } from "baseui/typography";
import ThemeButton from "../components/ThemeButton";
import SearchButton from "../components/SearchButton";
import EnvButton from "../components/EnvButton";
import { useStore } from "../lib/store";

function renderNotFound() {
  return <Display4>404 - Not Found</Display4>;
}

export default function ({ ctx, children }) {
  const loadingRoute = useLoadingRoute();
  const [store, dispatch] = useStore();

  useEffect(() => {
    if (ctx.config.playground.enabled) {
      const savedEnv = getEnv();
      let currentEnv = ctx.config.playground.env;

      if (
        savedEnv &&
        Object.keys(ctx.config.playground.environments).includes(savedEnv)
      ) {
        currentEnv = savedEnv;
      }

      dispatch({
        type: "setToken",
        env: currentEnv,
        token: getEnv(currentEnv),
      });
    }
  }, []);

  return (
    <Block backgroundColor="backgroundSecondary" height="100vh">
      <BusyIndicator isBusy={!!loadingRoute} delayMs={200} />
      <HeaderNavigation
        overrides={{
          Root: {
            style: ({ $theme }) => {
              return {
                borderBottomWidth: $theme.sizing.scale0,
                borderBottomColor: $theme.colors.backgroundTertiary,
                backgroundColor: $theme.colors.backgroundPrimary,
                position: "sticky",
                top: 0,
                zIndex: 100,
              };
            },
          },
        }}
      >
        <StyledNavigationList $align={ALIGN.left}>
          <StyledNavigationItem>
            <StyledLink href={ctx.config.basePath}>
              <H6 marginTop={0} marginBottom={0}>
                {ctx.title}
              </H6>
            </StyledLink>
          </StyledNavigationItem>
        </StyledNavigationList>
        <StyledNavigationList $align={ALIGN.center}></StyledNavigationList>
        <StyledNavigationList $align={ALIGN.right}>
          <StyledNavigationItem>
            <SearchButton groups={ctx.groups} />
          </StyledNavigationItem>
          <StyledNavigationItem>
            <EnvButton config={ctx.config} />
          </StyledNavigationItem>
          <StyledNavigationItem>
            <Block paddingRight="scale800">
              <ThemeButton />
            </Block>
          </StyledNavigationItem>
        </StyledNavigationList>
      </HeaderNavigation>
      <Block backgroundColor="backgroundSecondary">
        <Grid>
          <Cell
            span={[0, 2, 4]}
            overrides={{
              Cell: {
                style: ({ $theme }) => ({
                  paddingTop: $theme.sizing.scale400,
                  top: $theme.sizing.scale1600,
                  position: "sticky",
                  maxHeight: "90vh",
                  overflowX: "auto",
                }),
              },
            }}
          >
            <Navigation
              title={ctx.title}
              groups={ctx.groups}
              resources={ctx.resources}
              descriptionToc={ctx.descriptionToc}
            />
          </Cell>
          <Cell
            span={[4, 6, 8]}
            overrides={{
              Cell: {
                style: ({ $theme }) => ({
                  backgroundColor: $theme.colors.backgroundPrimary,
                  boxShadow: `${$theme.colors.backgroundTertiary} -2px 2px 0px 0px`,
                }),
              },
            }}
          >
            <Block paddingLeft="scale400" paddingRight="scale400">
              <NotFoundBoundary render={renderNotFound}>
                {children || null}
              </NotFoundBoundary>
            </Block>
            <Block
              paddingBottom="scale1000"
              paddingTop="scale1000"
              $style={{ textAlign: "center" }}
            >
              <Label3>
                {ctx.title} powered by{" "}
                <StyledLink
                  href="https://github.com/bukalapak/snowboard"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Snowboard
                </StyledLink>
              </Label3>
            </Block>
          </Cell>
        </Grid>
      </Block>
    </Block>
  );
}
