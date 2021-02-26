import { To } from "./route";

export interface ILinkProps
  extends React.DetailedHTMLProps<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    HTMLAnchorElement
  > {
  to: To | string;
}
