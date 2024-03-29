import { RouteProperties } from "./route";

export interface RouteParams {
	[key: string]: string | number;
};

export interface BaseRouteOptions {
	path: string;
	name?: string;
	meta?: any;
	props?: object;
	location?: any;
	component?: any;
	render?: (props: any) => React.ReactNode;
	children?:
		| ((props: any) => React.ReactNode)
		| React.ReactNode;
	exact?: boolean;
	sensitive?: boolean;
	strict?: boolean;
	onEnter?: (params?: any) => void;
	onLeave?: (params?: any) => void;
};

export interface RouterProps {
	basename?: string;
	hashType?: "slash" | "noslash" | "hashbang" | undefined;
	getUserConfirmation?: (message?: string | undefined) => boolean;
	forceRefresh?: boolean;
	keyLength?: number | undefined;
	history?: any;
};

export interface To {
	path?: string;
	name?: string;
	params?: RouteParams;
	state?: RouteParams;
};

export interface Route extends BaseRouteOptions {
	redirect?: string;
};

export interface RouterOptions {
	routes: Route[];
	mode: "history" | "hash";
	base: string;
	forceRefresh: false;
	getUserConfirmation: Window["confirm"];
	hashType: "slash" | "noslash" | "hashbang";
	keyLength: number | undefined;
	linkActiveClass: string;
	linkExactActiveClass: string;
	scrollBehavior: (savedPosition: { x: number; y: number }) => void;
	plugins: Plugin[];
};

export type Plugin = any;
export type Hook =
  | "onInit"
  | "onReady"
  | "onError"
  | "onHook"
  | "afterHook"
  | "onMiddleware"
  | "afterMiddleware"
  | "onEnter"
  | "onLeave";

declare global {
	export interface Window {
		$route: RouteProperties;
	}
}
