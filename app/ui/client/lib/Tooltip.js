import { Tracker } from 'meteor/tracker';

import { createEphemeralPortal } from '../../../../client/reactAdapters';

const Dep = new Tracker.Dependency();

let state;
let dom;
let unregister;

const createAnchor = () => {
	const div = document.createElement('div');
	div.id = 'react-tooltip';
	document.body.appendChild(div);
	return div;
};

const props = () => {
	Dep.depend();
	return state;
};

export const closeTooltip = () => {
	if (!dom) {
		return;
	}
	unregister = unregister && unregister();
};

export const openToolTip = async (title, anchor) => {
	dom = dom || createAnchor();
	state = {
		title,
		anchor
	};
	Dep.changed();
	unregister =
		unregister ||
		(await createEphemeralPortal(
			() => import('./TooltipComponent'),
			props,
			dom
		));
};

window.matchMedia('(hover: none)').matches ||
	document.body.addEventListener(
		'mouseover',
		(() => {
			let timeout;
			return e => {
				timeout = timeout && clearTimeout(timeout);
				timeout = setTimeout(() => {
					const element =
						e.target.title || e.dataset?.title
							? e.target
							: e.target.closest('[title], [data-title]');
					if (element) {
						element.dataset.title =
							element.title || element.dataset.title;
						element.removeAttribute('title');
						openToolTip(element.dataset.title, element);
					}
				}, 300);
				closeTooltip();
			};
		})()
	);
