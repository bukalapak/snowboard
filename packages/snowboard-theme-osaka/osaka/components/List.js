import React from "react";
import { ListItem, ListItemLabel } from "baseui/list";
import { useStyletron } from "baseui";
import Link from "../components/Link";
import { toHref } from "../lib/helper";
import { Tag, VARIANT } from "baseui/tag";

export const TransitionList = ({ resource }) => {
  const [css] = useStyletron();

  return (
    <ul
      className={css({
        paddingLeft: 0,
        paddingRight: 0,
      })}
    >
      {resource.transitions.map((transition) => (
        <ListItem
          sublist
          key={transition.permalink}
          endEnhancer={() => (
            <Tag closeable={false} variant={VARIANT.solid}>
              {transition.method}
            </Tag>
          )}
        >
          <ListItemLabel>
            <Link href={toHref(transition.permalink)}>{transition.title}</Link>
          </ListItemLabel>
        </ListItem>
      ))}
    </ul>
  );
};
