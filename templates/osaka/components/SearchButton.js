import React, { useState, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import { Button, SIZE, KIND } from "baseui/button";
import { Drawer } from "baseui/drawer";
import { Card, StyledBody, StyledAction } from "baseui/card";
import Search from "baseui/icon/search";
import { Input } from "baseui/input";
import { useStyletron } from "baseui";
import { ListItem, ListItemLabel } from "baseui/list";
import { toGroupHref, toResourceHref, toTransitionHref } from "../lib/util";
import { useDebouncedCallback } from "use-debounce";
import Link from "../components/Link";
import { Tag, VARIANT } from "baseui/tag";

function Before() {
  const [css, theme] = useStyletron();
  return (
    <div
      className={css({
        display: "flex",
        alignItems: "center",
        paddingLeft: theme.sizing.scale500
      })}
    >
      <Search size="18px" />
    </div>
  );
}

function escape(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

function filter(query, groups) {
  if (query === "") {
    return [];
  }

  const items = [];
  const regex = new RegExp(query, "gi");

  groups.forEach(group => {
    if (group.title.match(regex)) {
      items.push({
        title: group.title,
        kind: "group",
        href: toGroupHref(group.permalink)
      });
    }

    group.resources.forEach(resource => {
      if (resource.title.match(regex)) {
        items.push({
          title: resource.title,
          kind: "resource",
          href: toResourceHref(resource.permalink)
        });
      }

      resource.transitions.forEach(transition => {
        if (
          transition.title.match(regex) ||
          transition.method.match(regex) ||
          transition.path.match(regex)
        ) {
          items.push({
            title: transition.title,
            method: transition.method,
            href: toTransitionHref(transition.permalink),
            kind: "transition"
          });
        }
      });
    });
  });

  return items;
}

export default function({ groups }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState([]);
  const [css] = useStyletron();

  const [queryDebounce] = useDebouncedCallback(value => {
    setItems(filter(value, groups));
  }, 250);

  useEffect(() => {
    queryDebounce(escape(query));
  }, [query]);

  return (
    <>
      <Button
        size={SIZE.compact}
        kind={KIND.secondary}
        onClick={() => {
          setIsOpen(true);
        }}
      >
        <FiSearch size={16} />
      </Button>
      <Drawer isOpen={isOpen} autoFocus onClose={() => setIsOpen(false)}>
        <Card
          overrides={{
            Root: {
              style: ({ $theme }) => {
                return { borderWidth: "0" };
              }
            }
          }}
        >
          <StyledBody>
            <Input
              overrides={{ Before }}
              value={query}
              placeholder="Filter by method, path, and title..."
              clearable
              onChange={e => {
                setQuery(e.target.value);
              }}
            />
            <ul
              className={css({
                paddingLeft: 0,
                paddingRight: 0
              })}
            >
              {items.map((item, index) => (
                <ListItem
                  key={index}
                  endEnhancer={() => (
                    <Tag
                      closeable={false}
                      variant={
                        item.kind === "transition"
                          ? VARIANT.solid
                          : VARIANT.outlined
                      }
                      kind="neutral"
                    >
                      {item.kind === "transition" ? item.method : item.kind}
                    </Tag>
                  )}
                >
                  <ListItemLabel>
                    <Link
                      href={item.href}
                      onClick={event => {
                        setIsOpen(false);
                      }}
                    >
                      {item.title}
                    </Link>
                  </ListItemLabel>
                </ListItem>
              ))}
            </ul>
          </StyledBody>
        </Card>
      </Drawer>
    </>
  );
}
