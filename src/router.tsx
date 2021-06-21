import React from "react";
import { createBrowserHistory, createHashHistory, History } from "history";
import { Redirect, Route, Router as Base, Switch } from "react-router-dom";
import { GlassRouter } from ".";
import { MiddlwareContext } from "./@types/route";
import { RouteParams, RouterOptions, RouterProps, To } from "./@types/router";

/**
 * Glass Router
 * ----
 * An extensive and powerful router for react.
 */
export default class Router {
	protected _defaultOptions: RouterOptions = {
		routes: [],
		mode: "history",
		base: "/",
		forceRefresh: false,
		getUserConfirmation: window.confirm,
		hashType: "slash",
		keyLength: 6,
		linkActiveClass: "router-link-active",
		linkExactActiveClass: "router-link-exact-active",
		middleware: false,
		scrollBehavior: () => {},
	};

	protected _options: RouterOptions = this._defaultOptions;

	protected _history: History = createBrowserHistory();

	protected beforeHooks: Array<Function> = [];

	public constructor(options: Partial<RouterOptions> = {}) {
		this.options(options);
	}

	public options(options: Partial<RouterOptions>) {
		this._options = {
			...this._defaultOptions,
			...options,
		};
	}

	// ---------- glass router internals ----------- //

	protected findNamedPath(path: string, params?: RouteParams): string {
		let route = this._options.routes.find((route) => {
			return route.name === path;
		})?.path;

		if (route === undefined) {
			throw new Error(`Route ${path} does not exist`);
		}

		if (params !== undefined) {
			let routePath: string = `${route}`;

			for (let key in params) {
				routePath += `/${params[key]}`;
			}

			route = routePath;
		}

		return route;
	}

	public getRoutePath(route: To | string): string {
		if (typeof route === "string") return route;

		const { path, name, params } = route;

		if (!path && !name) {
			throw new Error(`Route ${path || name} does not exist`);
		}

		if (name && params) return this.findNamedPath(name, params);
		if (name) return this.findNamedPath(name);

		return path || "";
	}

	protected sortState(to: To | string, state: any = null) {
		if (state === null && typeof to === "object") {
			state = to.state;
		}

		return state;
	}

	/**
	 * Navigate to a specific path
	 */
	public push(to: To | string, state: any = null) {
		const path = this.getRoutePath(to);

		if (this._options.mode === "hash") {
			return this._history.push(path);
		}

		state = this.sortState(to, state);

		return this._history.push(path, state);
	}

	/**
	 * Replaces the current entry on the history stack
	 */
	public replace(options: any, state: any = null) {
		const path = this.getRoutePath(options);

		if (this._options.mode === "hash") {
			return this._history.replace(path);
		}

		state = this.sortState(options, state);

		return this._history.replace(path, state);
	}

	/**
	 * Moves the pointer in the history stack by n entries
	 */
	public go(n: number) {
		return this._history.go(n);
	}

	/**
	 * Go back
	 */
	public back() {
		return this._history.go(-1);
	}

	/**
	 * Go forward
	 */
	public forward() {
		return this._history.go(1);
	}

	/**
	 * Go back
	 */
	public disable(prompt: any) {
		return this._history.block(prompt);
	}

	public history() {
		return this._history;
	}

	activeLink() {
		return this._options.linkActiveClass;
	}

	public render(): JSX.Element {
		const {
			mode,
			routes,
			base,
			forceRefresh,
			getUserConfirmation,
			keyLength,
			hashType,
		} = this._options;

		const routerProps: RouterProps = {
			basename: base,
			getUserConfirmation,
		};

		if (mode === "history") {
			routerProps.forceRefresh = forceRefresh;
			routerProps.keyLength = keyLength;

			this._history = createBrowserHistory(routerProps);
		} else {
			routerProps.hashType = hashType;

			this._history = createHashHistory(routerProps);
		}

		const children = routes.map(
			({ component, redirect, render, meta, ...rest }, index) => {
				const wrapper = { component, redirect };
				const $route = {
					...this._history.location,
					history: this._history,
				};

				if (window) {
					window.$route = $route;
				}

				if (redirect) {
					return (
						<Redirect
							exact={true}
							path={rest.path}
							to={redirect}
							key={`class-${index}`}
						/>
					);
				}

				if (render && !component) {
					return (
						<Route
							path={rest.path}
							exact={rest.exact}
							render={(props) => {
								this.runMiddleWare({ path: rest.path, meta });

								return render(props);
							}}
							key={`class-${index}`}
						/>
					);
				}

				return (
					<Route
						path={rest.path}
						key={`class-${index}`}
						exact={rest.exact}
						render={() => {
							this.runMiddleWare({ path: rest.path, meta });

							return (
								<wrapper.component $route={$route} {...rest} />
							);
						}}
					/>
				);
			}
		);

		return (
			<Base history={this._history} {...routerProps}>
				<Switch>{children}</Switch>
			</Base>
		);
	}

	// ---------- middleware handlers ----------- //

	public registerHook(list: Array<Function | Object>, fn: Function) {
		list.push(fn);

		return function () {
			const i = list.indexOf(fn);

			if (i > -1) {
				list.splice(i, 1);
			}
		};
	}

	public beforeEach(fn: (context: MiddlwareContext) => any) {
		return this.registerHook(this.beforeHooks, fn);
	}

	protected runMiddleWare(to: any, state: any = null) {
		if (this.getRoutePath(to) === "*") {
			return;
		}

		const from =
			this._options.mode === "history"
				? window.location.pathname
				: window.location.hash.substring(1);

		const next = (route: To | null = null) => {
			if (route === null) return;

			let trueRoute;

			if (typeof route === "string") {
				trueRoute = route;
			} else {
				trueRoute = this.getRoutePath(route);
			}

			if (trueRoute === from) {
				return;
			}

			if (this._options.mode === "hash") {
				return this._history.push(trueRoute);
			}

			return this._history.push(trueRoute, state);
		};

		const context = { to, from, next };

		if (this.beforeHooks.length > 0) {
			this.beforeHooks.forEach((m) => m(context));
		}

		if (
			this._options.middleware &&
			to.meta &&
			to.meta.middleware &&
			to.meta.middleware.length > 0
		) {
			to.meta.middleware.forEach((m: any) => m(context));
		}
	}

	protected loadMiddleWare(
		to: To | string,
		state: any = null,
		router: this | null = null
	) {
		if (!router) router = this;

		const before = router.beforeHooks;

		to = router.getRoutePath(to);

		let fromRoute = window.location.pathname;

		if (router._options.mode === "history") {
			fromRoute = window.location.pathname;
		} else {
			fromRoute = window.location.hash.substring(1);
		}

		var from = router._options.routes.find(function (route) {
			return route.path === fromRoute;
		});

		const toRoute = router._options.routes.find(function (route) {
			return route.path === to;
		});

		const next = (route: To | string | null = null) => {
			if (route === null) return;

			let trueRoute;

			if (typeof route === "string") {
				trueRoute = route;
			} else {
				trueRoute = GlassRouter.getRoutePath(route);
			}

			if (GlassRouter._options.mode === "hash") {
				return GlassRouter._history.push(trueRoute);
			}

			return GlassRouter._history.push(trueRoute, state);
		};

		return before.forEach((m) =>
			m({
				to: toRoute,
				from,
				next,
			})
		);
	}
}

/**
 * Get the glass router history
 * @returns GlassRouter history
 */
export const useHistory = () => {
	return GlassRouter.history();
};

/**
 * Return a navigator function
 * @returns Navigator
 */
export const useRoute = () => {
	return (route: To | string, state?: any) => {
		GlassRouter.push(route, state);
	};
};

