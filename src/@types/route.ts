import { BaseRouteOptions, To } from "./router";

export interface LinkProps
	extends React.DetailedHTMLProps<
		React.AnchorHTMLAttributes<HTMLAnchorElement>,
		HTMLAnchorElement
	> {
	to: To | string;
	noActive?: boolean;
};

export interface MiddlwareContext {
	to: BaseRouteOptions;
	from: BaseRouteOptions;
	next: Function;
};
