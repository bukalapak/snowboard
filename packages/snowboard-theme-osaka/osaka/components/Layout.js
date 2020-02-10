import React from "react";
import BusyIndicator from "react-busy-indicator";
import { useLoadingRoute } from "react-navi";
import { NotFoundBoundary } from "react-navi";
import { StyledLink } from "baseui/link";
import {
  HeaderNavigation,
  ALIGN,
  StyledNavigationList,
  StyledNavigationItem
} from "baseui/header-navigation";
import { Block } from "baseui/block";
import Navigation from "./Navigation";
import { H6, Label3, Display4 } from "baseui/typography";
import ThemeButton from "../components/ThemeButton";
import SearchButton from "../components/SearchButton";
import EnvButton from "../components/EnvButton";
import { Grid, Cell } from "baseui/layout-grid";

export default function({ ctx, children }) {
  const loadingRoute = useLoadingRoute();

  return (
    <Block backgroundColor="backgroundPrimary" color="contentPrimary">
      <BusyIndicator isBusy={!!loadingRoute} delayMs={200} />
      <HeaderNavigation>
        <StyledNavigationList $align={ALIGN.left}>
          <StyledNavigationItem>
            <H6 marginTop={0} marginBottom={0}>
              {ctx.title}
            </H6>
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
      <Block>
        <Grid>
          <Cell span={[0, 2, 4]}>
            <Navigation
              title={ctx.title}
              groups={ctx.groups}
              resources={ctx.resources}
              descriptionToc={ctx.descriptionToc}
            />
          </Cell>
          <Cell span={[4, 6, 8]}>
            <Block>
              <NotFoundBoundary render={renderNotFound}>
                {children || null}
              </NotFoundBoundary>
            </Block>
          </Cell>
        </Grid>
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
            rel="noopener"
          >
            Snowboard
          </StyledLink>
        </Label3>
      </Block>
    </Block>
  );
}

function renderNotFound() {
  return <Display4>404 - Not Found</Display4>;
}
