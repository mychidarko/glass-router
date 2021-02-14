import React, { FC } from "react";
import GlassRouter from "./index";
import { ILinkProps } from "./interfaces/link";

export const Link: FC<ILinkProps> = props => {
  const path = GlassRouter.getRoutePath(props.to);

  const handleClick = (event: any) => {
    event.preventDefault();
    return GlassRouter.push(path);
  };

  return (
    <a onClick={handleClick} {...props}>
      {props.children}
    </a>
  );
};
