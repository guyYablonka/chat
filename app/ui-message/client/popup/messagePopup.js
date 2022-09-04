// This is not supposed to be a complete list
// it is just to improve readability in this file

import _ from 'underscore';
import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template } from 'meteor/templating';

import './messagePopup.html';

const keys = {
	TAB: 9,
	ENTER: 13,
	ESC: 27,
	ARROW_LEFT: 37,
	ARROW_UP: 38,
	ARROW_RIGHT: 39,
	ARROW_DOWN: 40
};

function getCursorPosition(input) {
	if (input == null) {
		return;
	}
	if (input.selectionStart != null) {
		return input.selectionStart;
	}
	if (document.selection != null) {
		input.focus();
		const sel = document.selection.createRange();
		const selLen = document.selection.createRange().text.length;
		sel.moveStart('character', -input.value.length);
		return sel.text.length - selLen;
	}
}

function setCursorPosition(input, caretPos) {
	if (input == null) {
		return;
	}
	if (input.selectionStart != null) {
		input.focus();
		return input.setSelectionRange(caretPos, caretPos);
	}
	if (document.selection != null) {
		const range = input.createTextRange();
		range.move('character', caretPos);
		return range.select();
	}
}

function val(v, d) {
	if (v != null) {
		return v;
	}
	return d;
}

Template.messagePopup.onCreated(function () {
	const template = this;
	template.textFilter = new ReactiveVar('');
	template.textFilterDelay = val(template.data.textFilterDelay, 0);
	template.open = val(template.data.open, new ReactiveVar(false));
	template.hasData = new ReactiveVar(false);
	template.value = new ReactiveVar();
	template.trigger = val(template.data.trigger, '');
	template.triggerAnywhere = val(template.data.triggerAnywhere, true);
	template.closeOnEsc = val(template.data.closeOnEsc, true);
	template.blurOnSelectItem = val(template.data.blurOnSelectItem, false);
	template.prefix = val(template.data.prefix, template.trigger);
	template.suffix = val(template.data.suffix, '');
	if (template.triggerAnywhere === true) {
		template.matchSelectorRegex = val(
			template.data.matchSelectorRegex,
			new RegExp(`(?:^| |\n)${template.trigger}.*$`)
		);
	} else {
		template.matchSelectorRegex = val(
			template.data.matchSelectorRegex,
			new RegExp(`(?:^)${template.trigger}[^\\s]*$`)
		);
	}
	template.selectorRegex = val(
		template.data.selectorRegex,
		new RegExp(`${template.trigger}.*$`)
	);
	template.replaceRegex = val(
		template.data.replaceRegex,
		new RegExp(`${template.trigger}[^\\s]*$`)
	);
	template.getValue = val(template.data.getValue, function (_id) {
		return _id;
	});
	template.up = () => {
		const current = template.find('.popup-item.selected');
		const previous =
			$(current).prev('.popup-item')[0] ||
			template.find('.popup-item:last-child');
		if (previous != null) {
			current.className = current.className
				.replace(/\sselected/, '')
				.replace('sidebar-item__popup-active', '');
			previous.className += ' selected sidebar-item__popup-active';
			previous.scrollIntoView(false);
			return template.value.set(previous.getAttribute('data-id'));
		}
	};
	template.down = () => {
		const current = template.find('.popup-item.selected');
		const next =
			$(current).next('.popup-item')[0] || template.find('.popup-item');
		if (next && next.classList.contains('popup-item')) {
			current.className = current.className
				.replace(/\sselected/, '')
				.replace('sidebar-item__popup-active', '');
			next.className += ' selected sidebar-item__popup-active';
			next.scrollIntoView(false);
			return template.value.set(next.getAttribute('data-id'));
		}
	};
	template.verifySelection = () => {
		if (!template.open.curValue) {
			return;
		}
		const current = template.find('.popup-item.selected');
		if (current == null) {
			const first = template.find('.popup-item');
			if (first != null) {
				first.className += ' selected sidebar-item__popup-active';
				return template.value.set(first.getAttribute('data-id'));
			}
			return template.value.set(null);
		}
	};
	template.onInputKeydown = event => {
		if (
			template.open.curValue !== true ||
			template.hasData.curValue !== true
		) {
			return;
		}
		if (event.which === keys.ENTER || event.which === keys.TAB) {
			if (template.blurOnSelectItem === true) {
				template.input.blur();
			} else {
				template.open.set(false);
			}
			template.enterValue();
			if (template.data.cleanOnEnter) {
				template.input.value = '';
			}
			event.preventDefault();
			event.stopPropagation();
			return;
		}
		if (event.which === keys.ARROW_UP) {
			template.up();
			event.preventDefault();
			event.stopPropagation();
			return;
		}
		if (event.which === keys.ARROW_DOWN) {
			template.down();
			event.preventDefault();
			event.stopPropagation();
		}
	};

	template.setTextFilter = _.debounce(function (value) {
		return template.textFilter.set(value);
	}, template.textFilterDelay);

	template.onInputKeyup = event => {
		const value = template.input.value;
		if (
			(template.closeOnEsc === true &&
				template.open.curValue === true &&
				event.which === keys.ESC) ||
			value === ''
		) {
			template.open.set(false);
			event.preventDefault();
			event.stopPropagation();
			return;
		}

		const cursor = getCursorPosition(template.input);
		const lastIndexOfTrigger = value.lastIndexOf(template.trigger);
		const focusedValue = value.substr(lastIndexOfTrigger, cursor);

		template.openPopup(cursor, value, focusedValue, lastIndexOfTrigger);

		if (template.changeFilterCheck(focusedValue, event)) {
			if (focusedValue === template.trigger) {
				template.textFilter.set(focusedValue);
			} else {
				template.setTextFilter(focusedValue);
			}
		}
		if (template.open.curValue !== true) {
			return;
		}
		if (event.which !== keys.ARROW_UP && event.which !== keys.ARROW_DOWN) {
			return Meteor.defer(function () {
				template.verifySelection();
			});
		}
	};
	template.onFocus = event => {
		template.clickingItem = false;
		if (template.open.curValue === true) {
			return;
		}

		const cursor = getCursorPosition(template.input);
		const value = template.input.value;
		const lastIndexOfTrigger = value.lastIndexOf(template.trigger);
		const focusedValue = value.substr(lastIndexOfTrigger, cursor);

		template.openPopup(cursor, value, focusedValue, lastIndexOfTrigger);

		if (template.changeFilterCheck(focusedValue, event)) {
			template.textFilter.set(focusedValue);
			return Meteor.defer(function () {
				return template.verifySelection();
			});
		}
		return template.open.set(false);
	};

	template.onBlur = () => {
		if (template.open.curValue === false) {
			return;
		}
		if (template.clickingItem === true) {
			return;
		}
		return template.open.set(false);
	};

	template.enterValue = function () {
		if (template.value.curValue == null) {
			return;
		}
		const { value } = template.input;
		const caret = getCursorPosition(template.input);
		let firstPartValue = value.substr(0, caret) ?? '';
		const lastPartValue = value.substr(caret);
		const getValue = this.getValue(
			template.value.curValue,
			template.data.collection,
			template.records.get(),
			firstPartValue
		);
		if (!getValue) {
			return;
		}

		const lastTriggerBeforeCursorIndex = firstPartValue.lastIndexOf(
			template.trigger
		);
		const textToRemain = firstPartValue.substr(
			0,
			lastTriggerBeforeCursorIndex
		);
		const textToReplace = firstPartValue.substr(
			lastTriggerBeforeCursorIndex,
			caret
		);

		firstPartValue =
			textToRemain +
			textToReplace.replace(
				template.selectorRegex,
				template.prefix + getValue + template.suffix
			);
		template.input.value = firstPartValue + lastPartValue;

		return setCursorPosition(template.input, firstPartValue.length);
	};

	template.changeFilterCheck = (focusedValue, event) =>
		template.matchSelectorRegex.test(focusedValue) &&
		event.which !== keys.ENTER &&
		event.which !== keys.TAB;

	template.openPopup = (cursor, value, focusedValue, lastIndexOfTrigger) => {
		const prevIndex = cursor - 1;
		const beforeTriggerIndex = prevIndex - 1;
		const whiteSpaceRegex = new RegExp(`\\s`);

		if (
			prevIndex === lastIndexOfTrigger &&
			(beforeTriggerIndex < 0 ||
				whiteSpaceRegex.test(value[beforeTriggerIndex])) &&
			template.open.curValue !== true &&
			template.matchSelectorRegex.test(focusedValue)
		) {
			template.open.set(true);
		}
	};

	template.records = new ReactiveVar([]);

	template.autorun(function () {
		const filter = template.textFilter.get();
		if (filter != null) {
			const filterCallback = result => {
				template.hasData.set(result && result.length > 0);
				template.records.set(result);
				return Meteor.defer(function () {
					return template.verifySelection();
				});
			};
			const result = template.data.getFilter(
				template.data.collection,
				filter,
				filterCallback
			);
			if (result != null) {
				return filterCallback(result);
			}
		}
	});
});

Template.messagePopup.onRendered(function () {
	if (this.data.getInput != null) {
		this.input =
			typeof this.data.getInput === 'function' && this.data.getInput();
	} else if (this.data.input) {
		this.input = this.parentTemplate().find(this.data.input);
	}
	if (this.input == null) {
		console.error('Input not found for popup');
	}
	const self = this;
	self.autorun(() => {
		const open = self.open.get();
		if ($('.reply-preview').length) {
			if (open === true) {
				$('.reply-preview').addClass('reply-preview-with-popup');
				setTimeout(() => {
					$('#popup').addClass('popup-with-reply-preview');
				}, 50);
			}
		}
		if (open === false) {
			$('.reply-preview').removeClass('reply-preview-with-popup');
			$('#popup').removeClass('popup-with-reply-preview');
		}
	});
	$(this.input).on('keyup', this.onInputKeyup.bind(this));
	$(this.input).on('keydown', this.onInputKeydown.bind(this));
	$(this.input).on('mousedown', this.onFocus.bind(this));
	$(this.input).on('blur', this.onBlur.bind(this));
});

Template.messagePopup.onDestroyed(function () {
	$(this.input).off('keyup', this.onInputKeyup);
	$(this.input).off('keydown', this.onInputKeydown);
	$(this.input).off('mousedown', this.onFocus);
	$(this.input).off('blur', this.onBlur);
});

Template.messagePopup.events({
	'mouseenter .popup-item'(e) {
		if (e.currentTarget.className.indexOf('selected') > -1) {
			return;
		}
		const template = Template.instance();
		const current = template.find('.popup-item.selected');
		if (current != null) {
			current.className = current.className
				.replace(/\sselected/, '')
				.replace('sidebar-item__popup-active', '');
		}
		e.currentTarget.className += ' selected sidebar-item__popup-active';
		return template.value.set(this._id);
	},
	'mousedown .popup-item, touchstart .popup-item'() {
		const template = Template.instance();
		template.clickingItem = true;
	},
	'mouseup .popup-item, touchend .popup-item'(e) {
		e.stopPropagation();
		const template = Template.instance();
		const wasMenuIconClicked = e.target.classList.contains(
			'sidebar-item__menu-icon'
		);
		template.clickingItem = false;
		if (!wasMenuIconClicked) {
			template.value.set(this._id);
			template.enterValue();
			template.open.set(false);
		}
	}
});

Template.messagePopup.helpers({
	isOpen() {
		return (
			Template.instance().open.get() &&
			(Template.instance().hasData.get() ||
				Template.instance().data.emptyTemplate != null ||
				!Template.instance().parentTemplate(1).subscriptionsReady())
		);
	},
	data() {
		const template = Template.instance();
		return Object.assign(template.records.get(), { toolbar: true });
	},
	toolbarData() {
		return { ...Template.currentData(), toolbar: true };
	},
	sidebarHeaderHeight() {
		return `${document.querySelector('.sidebar__header').offsetHeight}px`;
	},
	sidebarWidth() {
		return `${document.querySelector('.sidebar').offsetWidth}px`;
	}
});
