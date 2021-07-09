import { History } from "history";
import { match } from "react-router-dom";
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

export interface RouteProperties {
	history: History<unknown>;
    pathname: string;
    search: string;
    state: unknown;
    hash: string;
    key?: string | undefined;
	match?: match<any>;
};
