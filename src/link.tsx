import React, { FC } from "react";
import GlassRouter from "./index";
import { ILinkProps } from "./interfaces/link";

export const Link: FC<ILinkProps> = ({
  to,
  children,
  ...rest
}) => {
  const path = GlassRouter.getRoutePath(to);
  const history = GlassRouter.history();

  const href = location ? history.createHref(location) : "";

  const props = {
    ...rest,
    href
  };

  const isModifiedEvent = (event: any) => {
    return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
  }

  const handleClick = (event: any) => {
    try {
      if (props.onClick) props.onClick(event);
    } catch (ex) {
      event.preventDefault();
      throw ex;
    }

    if (
      !event.defaultPrevented && // onClick prevented default
      event.button === 0 && // ignore everything but left clicks
      (!props.target || props.target === "_self") && // let browser handle "target=_blank" etc.
      !isModifiedEvent(event) // ignore clicks with modifier keys
    ) {
      event.preventDefault();
      return GlassRouter.push(path);
    }
  };

  return (
    <a onClick={handleClick} {...props}>
      {children}
    </a>
  );
};
