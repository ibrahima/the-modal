/**
 * The Modal jQuery plugin
 *
 * @author Alexander Makarov <sam@rmcreative.ru>
 * @link https://github.com/samdark/the-modal
 * @version 1.0
 */
;(function($, window, document, undefined) {
	"use strict";
	/*jshint smarttabs:true*/

	var pluginNamespace = 'the-modal',
		// global defaults
		defaults = {
			lockClass: 'themodal-lock',
			overlayClass: 'themodal-overlay',

			closeOnEsc: true,
			closeOnOverlayClick: true,

			onBeforeClose: null,
			onClose: null,
			onOpen: null,

			cloning: true
		};
	var oMargin = {};
	var ieBodyTopMargin = 0;

	function isIE() {
		return ((navigator.appName == 'Microsoft Internet Explorer') ||
			(navigator.userAgent.match(/MSIE\s+\d+\.\d+/)) ||
			(navigator.userAgent.match(/Trident\/\d+\.\d+/)));
	}

	function lockContainer(options) {
		var tags = $('html, body');
		tags.each(function () {
			var $this = $(this);
			oMargin[$this.prop('tagName')] = parseInt($this.css('margin-right'));
		});
		var body = $('body');
		var oWidth = body.outerWidth(true);
		body.addClass(options.lockClass);
		var sbWidth = body.outerWidth(true) - oWidth;
		if (isIE()) {
			ieBodyTopMargin = body.css('margin-top');
			body.css('margin-top', 0);
		}
		tags.each(function () {
			$(this).css('margin-right', oMargin[$(this).prop('tagName')] + sbWidth);
		});
	}

	function unlockContainer(options) {
		$('html, body').each(function () {
			var $this = $(this);
			$this.css('margin-right', oMargin[$this.prop('tagName')]).removeClass(options.lockClass);
		});
		if (isIE()) {
			$('body').css('margin-top', ieBodyTopMargin);
		}
	}

	function init(els, options) {
		var modalOptions = options;

		if(els.length) {
			els.each(function(){
				$(this).data(pluginNamespace+'.options', modalOptions);
			});
		}
		else {
			$.extend(defaults, modalOptions);
		}

		// on Ctrl+A click fire `onSelectAll` event
		$(window).bind('keydown',function(e){
			if (!(e.ctrlKey && e.keyCode == 65)) {
				return true;
			}

			var selectAllEvent = new $.Event('onSelectAll');
			selectAllEvent.parentEvent = e;
			$(window).trigger(selectAllEvent);
			return true;
		});

		return {
			open: function(options) {
				var el = els.get(0);
				var localOptions = $.extend({}, defaults, $(el).data(pluginNamespace+'.options'), options);

				// close modal if opened
				if($('.'+localOptions.overlayClass).length) {
					$.modal().close();
				}

				lockContainer(localOptions);

				var overlay = $('<div/>').addClass(localOptions.overlayClass).prependTo('body');
				overlay.data(pluginNamespace+'.options', options);

				if(el) {
					var clonedEl = null;
					if (!localOptions.cloning) {
						overlay.data(pluginNamespace+'.el', el);
						$(el).data(pluginNamespace+'.parent', $(el).parent());
						$(el).appendTo(overlay).show();
					} else {
						clonedEl = $(el).clone(true).appendTo(overlay).show();
					}
				}

				if(localOptions.closeOnEsc) {
					$(document).bind('keyup.'+pluginNamespace, function(e){
						if(e.keyCode === 27) {
							$.modal().close();
						}
					});
				}

				if(localOptions.closeOnOverlayClick) {
					overlay.children().on('click.' + pluginNamespace, function(e){
						e.stopPropagation();
					});
					$('.' + localOptions.overlayClass).on('click.' + pluginNamespace, function(e){
						$.modal().close();
					});
				}

				$(document).bind('touchmove.'+pluginNamespace,function(e){
					if(!$(e).parents('.' + localOptions.overlayClass)) {
						e.preventDefault();
					}
				});

				if(el) {
					$(window).bind('onSelectAll',function(e){
						e.parentEvent.preventDefault();

						window.testel = el;
						var range = null,
							selection = null,
							selectionElement = clonedEl.get(0);
						if (document.body.createTextRange) { //ms
							range = document.body.createTextRange();
							range.moveToElementText(selectionElement);
							range.select();
						} else if (window.getSelection) { //all others
							selection = window.getSelection();
							range = document.createRange();
							range.selectNodeContents(selectionElement);
							selection.removeAllRanges();
							selection.addRange(range);
						}
					});
				}

				if(localOptions.onOpen) {
					localOptions.onOpen(overlay, localOptions);
				}
			},
			close: function() {
				var el = els.get(0);

				var localOptions = $.extend({}, defaults, options);
				var overlay = $('.' + localOptions.overlayClass);
				$.extend(localOptions, overlay.data(pluginNamespace+'.options'));

				if ($.isFunction(localOptions.onBeforeClose)) {
					if (localOptions.onBeforeClose(overlay, localOptions) === false) {
						return;
					}
				}

				if (!localOptions.cloning) {
					if (!el) {
						el = overlay.data(pluginNamespace+'.el');
					}
					$(el).appendTo($(el).data(pluginNamespace+'.parent'));
				}

				overlay.remove();
				unlockContainer(localOptions);

				if(localOptions.closeOnEsc) {
					$(document).unbind('keyup.'+pluginNamespace);
				}

				$(window).unbind('onSelectAll');

				if(localOptions.onClose) {
					localOptions.onClose(overlay, localOptions);
				}
			}
		};
	}

	$.modal = function(options){
		return init($(), options);
	};

	$.fn.modal = function(options) {
		return init(this, options);
	};

})(jQuery, window, document);
