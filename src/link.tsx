import React, { FC } from "react";
import { GlassRX } from ".";
import { LinkProps } from "./@types/route";

export const Link: FC<LinkProps> = ({ to, noActive = true, children, ...rest }) => {
	const href = GlassRX.getRoutePath(to);

	const isModifiedEvent = (event: any) => {
		return !!(
			event.metaKey ||
			event.altKey ||
			event.ctrlKey ||
			event.shiftKey
		);
	};

	const onClick = (event: any) => {
		try {
			if (rest.onClick) rest.onClick(event);
		} catch (ex) {
			event.preventDefault();
			throw ex;
		}

		if (
			!event.defaultPrevented && // onClick prevented default
			event.button === 0 && // ignore everything but left clicks
			(!rest.target || rest.target === "_self") && // let browser handle "target=_blank" etc.
			!isModifiedEvent(event) // ignore clicks with modifier keys
		) {
			event.preventDefault();
			return GlassRX.push(to);
		}
	};

	let className: string = rest.className || "";

	if (!noActive) {
		const path = window.$route.pathname;

		if (path === href) {
			className += ` ${GlassRX.activeLink()}`;
		}
	}

	const props = {
		...rest,
		href,
		onClick,
		className,
	};

	return <a {...props}>{children}</a>;
};
