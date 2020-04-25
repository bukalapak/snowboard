import React from "react";
import { isFunction } from "lodash";
import { useLinkProps } from "react-navi";
import { StyledLink } from "baseui/link";

export default function({ href, onClick, children }) {
  const { onClick: onClickOriginal, ...rest } = useLinkProps({ href });

  const handleClick = event => {
    if (isFunction(onClick)) {
      onClick(event);
    }

    onClickOriginal(event);
  };

  return (
    <StyledLink {...rest} onClick={handleClick}>
      {children}
    </StyledLink>
  );
}
