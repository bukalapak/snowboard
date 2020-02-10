import React, { useState, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import { Button, SIZE, KIND } from "baseui/button";
import { Drawer } from "baseui/drawer";
import { Card, StyledBody } from "baseui/card";
import Search from "baseui/icon/search";
import { Input } from "baseui/input";
import { useStyletron } from "baseui";
import { ListItem, ListItemLabel } from "baseui/list";
import { useDebouncedCallback } from "use-debounce";
import Link from "../components/Link";
import { Tag, VARIANT } from "baseui/tag";
import { filter } from "../lib/helper";

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

export default function({ groups }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState([]);
  const [css] = useStyletron();

  const [queryDebounce] = useDebouncedCallback(value => {
    setItems(filter(value, groups));
  }, 250);

  useEffect(() => {
    queryDebounce(query);
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
                return {
                  borderTopWidth: 0,
                  borderBottomWidth: 0,
                  borderRightWidth: 0,
                  borderLeftWidth: 0
                };
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
