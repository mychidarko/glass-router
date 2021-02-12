import React from "react";
import GlassRouter from "./index";

export const RouterLink = (props: any) => {
	const path = GlassRouter.getRoutePath(props.to);

	const handleClick = (event: any) => {
		event.preventDefault();
		return GlassRouter.push(path);
	}

	return (
		<a href={path} onClick={handleClick} {...props}>
			{props.children}
		</a>
	);
};
