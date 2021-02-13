import React, { FC } from "react";
import GlassRouter, { To } from "./index";

interface LinkProps
  extends React.DetailedHTMLProps<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    HTMLAnchorElement
  > {
  to: To | string;
}
export const Link: FC<LinkProps> = props => {
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
