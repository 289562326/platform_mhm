/**
 * jQuery Validation Plugin 1.8.1
 *
 * http://bassistance.de/jquery-plugins/jquery-plugin-validation/
 * http://docs.jquery.com/Plugins/Validation
 *
 * Copyright (c) 2006 - 2011 Jörn Zaefferer
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */

(function($) {

$.extend($.fn, {
	// http://docs.jquery.com/Plugins/Validation/validate
	validate: function( options ) {

		// if nothing is selected, return nothing; can't chain anyway
		if (!this.length) {
			options && options.debug && window.console && console.warn( "nothing selected, can't validate, returning nothing" );
			return;
		}

		// check if a validator for this form was already created
		var validator = $.data(this[0], 'validator');
		if ( validator ) {
			return validator;
		}

		validator = new $.validator( options, this[0] );
		$.data(this[0], 'validator', validator);

		if ( validator.settings.onsubmit ) {

			// allow suppresing validation by adding a cancel class to the submit button
			this.find("input, button").filter(".cancel").click(function() {
				validator.cancelSubmit = true;
			});

			// when a submitHandler is used, capture the submitting button
			if (validator.settings.submitHandler) {
				this.find("input, button").filter(":submit").click(function() {
					validator.submitButton = this;
				});
			}

			// validate the form on submit
			this.submit( function( event ) {
				if ( validator.settings.debug )
					// prevent form submit to be able to see console output
					event.preventDefault();

				function handle() {
					if ( validator.settings.submitHandler ) {
						if (validator.submitButton) {
							// insert a hidden input as a replacement for the missing submit button
							var hidden = $("<input type='hidden'/>").attr("name", validator.submitButton.name).val(validator.submitButton.value).appendTo(validator.currentForm);
						}
						validator.settings.submitHandler.call( validator, validator.currentForm );
						if (validator.submitButton) {
							// and clean up afterwards; thanks to no-block-scope, hidden can be referenced
							hidden.remove();
						}
						return false;
					}
					return true;
				}

				// prevent submit for invalid forms or custom submit handlers
				if ( validator.cancelSubmit ) {
					validator.cancelSubmit = false;
					return handle();
				}
				if ( validator.form() ) {
					if ( validator.pendingRequest ) {
						validator.formSubmitted = true;
						return false;
					}
					return handle();
				} else {
					validator.focusInvalid();
					return false;
				}
			});
		}

		return validator;
	},
	// http://docs.jquery.com/Plugins/Validation/valid
	valid: function() {
        if ( $(this[0]).is('form')) {
            return this.validate().form();
        } else {
            var valid = true;
            var validator = $(this[0].form).validate();
            this.each(function() {
				valid &= validator.element(this);
            });
            return valid;
        }
    },
	// attributes: space seperated list of attributes to retrieve and remove
	removeAttrs: function(attributes) {
		var result = {},
			$element = this;
		$.each(attributes.split(/\s/), function(index, value) {
			result[value] = $element.attr(value);
			$element.removeAttr(value);
		});
		return result;
	},
	// http://docs.jquery.com/Plugins/Validation/rules
	rules: function(command, argument) {
		var element = this[0];

		if (command) {
			var settings = $.data(element.form, 'validator').settings;
			var staticRules = settings.rules;
			var existingRules = $.validator.staticRules(element);
			switch(command) {
			case "add":
				$.extend(existingRules, $.validator.normalizeRule(argument));
				staticRules[element.name] = existingRules;
				if (argument.messages)
					settings.messages[element.name] = $.extend( settings.messages[element.name], argument.messages );
				break;
			case "remove":
				if (!argument) {
					delete staticRules[element.name];
					return existingRules;
				}
				var filtered = {};
				$.each(argument.split(/\s/), function(index, method) {
					filtered[method] = existingRules[method];
					delete existingRules[method];
				});
				return filtered;
			}
		}

		var data = $.validator.normalizeRules(
		$.extend(
			{},
			$.validator.metadataRules(element),
			$.validator.classRules(element),
			$.validator.attributeRules(element),
			$.validator.staticRules(element)
		), element);

		// make sure required is at front
		if (data.required) {
			var param = data.required;
			delete data.required;
			data = $.extend({required: param}, data);
		}

		return data;
	}
});

// Custom selectors
$.extend($.expr[":"], {
	// http://docs.jquery.com/Plugins/Validation/blank
	blank: function(a) {return !$.trim("" + a.value);},
	// http://docs.jquery.com/Plugins/Validation/filled
	filled: function(a) {return !!$.trim("" + a.value);},
	// http://docs.jquery.com/Plugins/Validation/unchecked
	unchecked: function(a) {return !a.checked;}
});

// constructor for validator
$.validator = function( options, form ) {
	this.settings = $.extend( true, {}, $.validator.defaults, options );
	this.currentForm = form;
	this.init();
};

$.validator.format = function(source, params) {
	if ( arguments.length == 1 )
		return function() {
			var args = $.makeArray(arguments);
			args.unshift(source);
			return $.validator.format.apply( this, args );
		};
	if ( arguments.length > 2 && params.constructor != Array  ) {
		params = $.makeArray(arguments).slice(1);
	}
	if ( params.constructor != Array ) {
		params = [ params ];
	}
	$.each(params, function(i, n) {
		source = source.replace(new RegExp("\\{" + i + "\\}", "g"), n);
	});
	return source;
};

$.extend($.validator, {

	defaults: {
		messages: {},
		groups: {},
		rules: {},
		errorClass: "error",
		validClass: "valid",
		errorElement: "label",
		focusInvalid: true,
		errorContainer: $( [] ),
		errorLabelContainer: $( [] ),
		onsubmit: true,
		ignore: [],
		ignoreTitle: false,
		onfocusin: function(element) {
			this.lastActive = element;

			// hide error label and remove error class on focus if enabled
			if ( this.settings.focusCleanup && !this.blockFocusCleanup ) {
				this.settings.unhighlight && this.settings.unhighlight.call( this, element, this.settings.errorClass, this.settings.validClass );
				this.addWrapper(this.errorsFor(element)).hide();
			}
		},
		onfocusout: function(element) {
			//if ( !this.checkable(element) && (element.name in this.submitted || !this.optional(element)) ) {
			if(1)
			{
				this.element(element);
			}
		},
		onkeyup: function(element) {
			if ( element.name in this.submitted || element == this.lastElement ) {
				this.element(element);
			}
		},
		onclick: function(element) {
			// click on selects, radiobuttons and checkboxes
			if ( element.name in this.submitted )
				this.element(element);
			// or option elements, check parent select in that case
			else if (element.parentNode.name in this.submitted)
				this.element(element.parentNode);
		},
		highlight: function(element, errorClass, validClass) {
			if (element.type === 'radio') {
				this.findByName(element.name).addClass(errorClass).removeClass(validClass);
			} else {
				$(element).addClass(errorClass).removeClass(validClass);
			}
		},
		unhighlight: function(element, errorClass, validClass) {
			if (element.type === 'radio') {
				this.findByName(element.name).removeClass(errorClass).addClass(validClass);
			} else {
				$(element).removeClass(errorClass).addClass(validClass);
			}
		}
	},

	// http://docs.jquery.com/Plugins/Validation/Validator/setDefaults
	setDefaults: function(settings) {
		$.extend( $.validator.defaults, settings );
	},

	messages: {
		required: $.validator.format("请输入{0}"),
		requiredSel: $.validator.format("请选择{0}"),
		remote: $.validator.format("{0}"),
		email: $.validator.format("请输入正确的{0}"),
		url: $.validator.format("请输入正确的{0}(支持协议：http | https | ftp)"),
		date: $.validator.format("请选择正确的{0},年份在1950到2050年之间"),
		dateLegalStart: $.validator.format("{0}不得晚于{1}"),
		dateLegalEnd: $.validator.format("{0}不得晚于{1}"),
		numberLegalStart: $.validator.format("{0}不得大于{1}"),
		numberLegalEnd: $.validator.format("{0}不得大于{1}"),
		dateISO: "请输入日期ISO,格式如yyyy-MM-dd",
		dateDE: "Bitte geben Sie ein gültiges Datum ein",
		number: $.validator.format("请输入正确的{0}"),
		numberDE: "Bitte geben Sie eine Nummer ein",
		digits: "请只输入数字",
		creditcard: "请输入正确的信用卡卡号.",
		equalTo: $.validator.format("请输入相同的{0}"),
		accept: "Please enter a value with a valid extension.",
		maxlength: $.validator.format("请输入不多于 {0} 个字符"),
		minlength: $.validator.format("请输入不少于 {0} 个字符"),
		rangelength: $.validator.format("Please enter a value between {0} and {1} characters long."),
		range: $.validator.format("Please enter a value between {0} and {1}."),
		max: $.validator.format("请输入不超过{0}的数字"),
		min: $.validator.format("请输入不小于{0}的数字"),
		ip: $.validator.format("请输入正确的{0}"),											//yangjie
		port: $.validator.format("请输入正确的{0}"),											//yangjie
		idcard: $.validator.format("请输入正确的{0}"),										//yangjie
		zipCode: $.validator.format("请输入正确的{0}"),										//yangjie
		userName: $.validator.format("{0}只能由字母、数字和下划线组成"),						//yangjie
		mobile: $.validator.format("请输入正确的{0}"),										//yangjie
		phone: $.validator.format("请输入正确的{0}"),											//yangjie
		fax: $.validator.format("请输入正确的{0}"),											//yangjie
		pic: $.validator.format("请选择正确的{0}格式文件"),									//yangjie
		doc: $.validator.format("请选择word格式文件"),									//yangjie
		xls: $.validator.format("请选择xls格式的Excel文件"),									//yangjie
		integer: $.validator.format("请为{0}输入正确的整数"),										//yangjie
		integerPlus: $.validator.format("请为{0}输入正确的正整数"),							//yangjie
		integerMinus: $.validator.format("请为{0}输入正确的负整数"),							//yangjie
		floatNumOne: $.validator.format("请输入正确的{0}，整数精度为10，小数精度为1"),
		floatNumTwo: $.validator.format("请输入正确的{0}，整数精度为8，小数精度为2"),			//yangjie
		floatNumFour: $.validator.format("请输入正确的{0}，整数精度为8，小数精度为4"),		//yangjie
		floatNumSix: $.validator.format("请输入正确的{0}，整数精度为8，小数精度为6"),			//yangjie
		floatNumEight: $.validator.format("请输入正确的{0}，整数精度为8，小数精度为8"),		//yangjie
		floatNumPlusTwo: $.validator.format("请输入正确的{0}，整数精度为8，小数精度为2"),		//yangjie
		floatNumPlusFour: $.validator.format("请输入正确的{0}，整数精度为8，小数精度为4"),	//yangjie
		floatNumPlusSix: $.validator.format("请输入正确的{0}，整数精度为8，小数精度为6"),		//yangjie
		floatNumMinus: $.validator.format("请输入正确的{0}，整数精度为8，小数精度为6"),		//yangjie
		longitude: $.validator.format("请输入正确的{0}，取值范围为-180到180，小数精度为8"),			//yangjie
		latitude: $.validator.format("请输入正确的{0}，取值范围为-90到90，小数精度为8")				//yangjie
	},


	autoCreateRanges: false,

	prototype: {

		init: function() {
			this.labelContainer = $(this.settings.errorLabelContainer);
			this.errorContext = this.labelContainer.length && this.labelContainer || $(this.currentForm);
			this.containers = $(this.settings.errorContainer).add( this.settings.errorLabelContainer );
			this.submitted = {};
			this.valueCache = {};
			this.pendingRequest = 0;
			this.pending = {};
			this.invalid = {};
			this.reset();

			var groups = (this.groups = {});
			$.each(this.settings.groups, function(key, value) {
				$.each(value.split(/\s/), function(index, name) {
					groups[name] = key;
				});
			});
			var rules = this.settings.rules;
			$.each(rules, function(key, value) {
				rules[key] = $.validator.normalizeRule(value);
			});

			function delegate(event) {
				var validator = $.data(this[0].form, "validator"),
					eventType = "on" + event.type.replace(/^validate/, "");
				validator.settings[eventType] && validator.settings[eventType].call(validator, this[0] );
			}
			$(this.currentForm)
				.validateDelegate(":text, :password, :file, select, textarea", "focusin focusout keyup", delegate)
				.validateDelegate(":radio, :checkbox, select, option", "click", delegate);

			if (this.settings.invalidHandler)
				$(this.currentForm).bind("invalid-form.validate", this.settings.invalidHandler);
		},

		// http://docs.jquery.com/Plugins/Validation/Validator/form
		form: function() {
			this.checkForm();
			$.extend(this.submitted, this.errorMap);
			this.invalid = $.extend({}, this.errorMap);
			if (!this.valid())
				$(this.currentForm).triggerHandler("invalid-form", [this]);
			this.showErrors();
			return this.valid();
		},

		checkForm: function() {
			this.prepareForm();
			for ( var i = 0, elements = (this.currentElements = this.elements()); elements[i]; i++ ) {
				this.check( elements[i] );
			}
			return this.valid();
		},

		// http://docs.jquery.com/Plugins/Validation/Validator/element
		element: function( element ) {
			element = this.clean( element );
			this.lastElement = element;
			this.prepareElement( element );
			this.currentElements = $(element);
			var result = this.check( element );
			if ( result ) {
				delete this.invalid[element.name];
			} else {
				this.invalid[element.name] = true;
			}
			if ( !this.numberOfInvalids() ) {
				// Hide error containers on last error
				this.toHide = this.toHide.add( this.containers );
			}
			this.showErrors();
			return result;
		},

		// http://docs.jquery.com/Plugins/Validation/Validator/showErrors
		showErrors: function(errors) {
			if(errors) {
				// add items to error list and map
				$.extend( this.errorMap, errors );
				this.errorList = [];
				for ( var name in errors ) {
					this.errorList.push({
						message: errors[name],
						element: this.findByName(name)[0]
					});
				}
				// remove items from success list
				this.successList = $.grep( this.successList, function(element) {
					return !(element.name in errors);
				});
			}
			this.settings.showErrors
				? this.settings.showErrors.call( this, this.errorMap, this.errorList )
				: this.defaultShowErrors();
		},

		// http://docs.jquery.com/Plugins/Validation/Validator/resetForm
		resetForm: function() {
			if ( $.fn.resetForm )
				$( this.currentForm ).resetForm();
			this.submitted = {};
			this.prepareForm();
			this.hideErrors();
			this.elements().removeClass( this.settings.errorClass );
		},

		numberOfInvalids: function() {
			return this.objectLength(this.invalid);
		},

		objectLength: function( obj ) {
			var count = 0;
			for ( var i in obj )
				count++;
			return count;
		},

		hideErrors: function() {
			this.addWrapper( this.toHide ).hide();
		},

		valid: function() {
			return this.size() == 0;
		},

		size: function() {
			return this.errorList.length;
		},

		focusInvalid: function() {
			if( this.settings.focusInvalid ) {
				try {
					$(this.findLastActive() || this.errorList.length && this.errorList[0].element || [])
					.filter(":visible")
					.focus()
					// manually trigger focusin event; without it, focusin handler isn't called, findLastActive won't have anything to find
					.trigger("focusin");
				} catch(e) {
					// ignore IE throwing errors when focusing hidden elements
				}
			}
		},

		findLastActive: function() {
			var lastActive = this.lastActive;
			return lastActive && $.grep(this.errorList, function(n) {
				return n.element.name == lastActive.name;
			}).length == 1 && lastActive;
		},

		elements: function() {
			var validator = this,
				rulesCache = {};

			// select all valid inputs inside the form (no submit or reset buttons)
			return $(this.currentForm)
			.find("input, select, textarea")
			.not(":submit, :reset, :image, [disabled]")
			.not( this.settings.ignore )
			.filter(function() {
				!this.name && validator.settings.debug && window.console && console.error( "%o has no name assigned", this);

				// select only the first element for each name, and only those with rules specified
				if ( this.name in rulesCache || !validator.objectLength($(this).rules()) )
					return false;

				rulesCache[this.name] = true;
				return true;
			});
		},

		clean: function( selector ) {
			return $( selector )[0];
		},

		errors: function() {
			return $( this.settings.errorElement + "." + this.settings.errorClass, this.errorContext );
		},

		reset: function() {
			this.successList = [];
			this.errorList = [];
			this.errorMap = {};
			this.toShow = $([]);
			this.toHide = $([]);
			this.currentElements = $([]);
		},

		prepareForm: function() {
			this.reset();
			this.toHide = this.errors().add( this.containers );
		},

		prepareElement: function( element ) {
			this.reset();
			this.toHide = this.errorsFor(element);
		},

		check: function( element ) {
			element = this.clean( element );

			// if radio/checkbox, validate first element in group instead
			if (this.checkable(element)) {
				element = this.findByName( element.name ).not(this.settings.ignore)[0];
			}

			var rules = $(element).rules();
			var dependencyMismatch = false;
			//yangjie
			var val = "信息";
			if($(element).attr("msg"))val = $(element).attr("msg");
			//yangjie

			for (var method in rules ) {
				var rule = { method: method, parameters: rules[method] };
				try {
					var result = $.validator.methods[method].call( this, element.value.replace(/\r/g, ""), element, rule.parameters );

					// if a method indicates that the field is optional and therefore valid,
					// don't mark it as valid when there are no other rules
					if ( result == "dependency-mismatch" ) {
						dependencyMismatch = true;
						continue;
					}
					dependencyMismatch = false;

					if ( result == "pending" ) {
						this.toHide = this.toHide.not( this.errorsFor(element) );
						return;
					}

					if( !result ) {
						//yangjie
						if(rule.parameters==true||rule.method=="equalTo")
						{
							rule = { method: method, parameters: val };
						}
						var valStart = "起始日期";
						var valEnd = "结束日期";
						var numberStart = "最小数字";
						var numberEnd = "最大数字";
						if(rule.method=="dateLegalEnd")
						{
							if($($(element).attr("dateLegalEnd")))
							{
								
								if($(element).attr("msg"))
								{
									valStart = $(element).attr("msg");
								}
								if($($(element).attr("dateLegalEnd")).attr("msg"))
								{
									valEnd = $($(element).attr("dateLegalEnd")).attr("msg");
								}
								rule = { method: method, parameters: [valStart,valEnd] };
							}	
						}
						if(rule.method=="dateLegalStart")
						{
							if($($(element).attr("dateLegalStart")))
							{
								if($($(element).attr("dateLegalStart")).attr("msg"))
								{
									valStart = $($(element).attr("dateLegalStart")).attr("msg");
								}
								if($(element).attr("msg"))
								{
									valEnd = $(element).attr("msg");
								}
								rule = { method: method, parameters: [valStart,valEnd] };
							}	
						}
						if(rule.method=="numberLegalEnd")
						{
							if($($(element).attr("numberLegalEnd")))
							{
								
								if($(element).attr("msg"))
								{
									numberStart = $(element).attr("msg");
								}
								if($($(element).attr("numberLegalEnd")).attr("msg"))
								{
									numberEnd = $($(element).attr("numberLegalEnd")).attr("msg");
								}
								rule = { method: method, parameters: [numberStart,numberEnd] };
							}	
						}
						if(rule.method=="numberLegalStart")
						{
							if($($(element).attr("numberLegalStart")))
							{
								if($($(element).attr("numberLegalStart")).attr("msg"))
								{
									numberStart = $($(element).attr("numberLegalStart")).attr("msg");
								}
								if($(element).attr("msg"))
								{
									numberEnd = $(element).attr("msg");
								}
								rule = { method: method, parameters: [numberStart,numberEnd] };
							}	
						}
						//yangjie

						this.formatAndAdd( element, rule );
						return false;
					}
				} catch(e) {
					this.settings.debug && window.console && console.log("exception occured when checking element " + element.id
						 + ", check the '" + rule.method + "' method", e);
					throw e;
				}
			}
			if (dependencyMismatch)
				return;
			if ( this.objectLength(rules) )
				this.successList.push(element);
			return true;
		},

		// return the custom message for the given element and validation method
		// specified in the element's "messages" metadata
		customMetaMessage: function(element, method) {
			if (!$.metadata)
				return;

			var meta = this.settings.meta
				? $(element).metadata()[this.settings.meta]
				: $(element).metadata();

			return meta && meta.messages && meta.messages[method];
		},

		// return the custom message for the given element name and validation method
		customMessage: function( name, method ) {
			var m = this.settings.messages[name];
			return m && (m.constructor == String
				? m
				: m[method]);
		},

		// return the first defined argument, allowing empty strings
		findDefined: function() {
			for(var i = 0; i < arguments.length; i++) {
				if (arguments[i] !== undefined)
					return arguments[i];
			}
			return undefined;
		},

		defaultMessage: function( element, method) {
			return this.findDefined(
				this.customMessage( element.name, method ),
				this.customMetaMessage( element, method ),
				// title is never undefined, so handle empty string as undefined
				!this.settings.ignoreTitle && element.title || undefined,
				$.validator.messages[method],
				"<strong>Warning: No message defined for " + element.name + "</strong>"
			);
		},

		formatAndAdd: function( element, rule ) {
			var message = this.defaultMessage( element, rule.method ),
				theregex = /\$?\{(\d+)\}/g;
			if ( typeof message == "function" ) {
				message = message.call(this, rule.parameters, element);
			} else if (theregex.test(message)) {
				message = jQuery.format(message.replace(theregex, '{$1}'), rule.parameters);
			}
			this.errorList.push({
				message: message,
				element: element
			});

			this.errorMap[element.name] = message;
			this.submitted[element.name] = message;
		},

		addWrapper: function(toToggle) {
			if ( this.settings.wrapper )
				toToggle = toToggle.add( toToggle.parent( this.settings.wrapper ) );
			return toToggle;
		},

		defaultShowErrors: function() {
			for ( var i = 0; this.errorList[i]; i++ ) {
				var error = this.errorList[i];
				this.settings.highlight && this.settings.highlight.call( this, error.element, this.settings.errorClass, this.settings.validClass );
				this.showLabel( error.element, error.message );
			}
			if( this.errorList.length ) {
				this.toShow = this.toShow.add( this.containers );
			}
			if (this.settings.success) {
				for ( var i = 0; this.successList[i]; i++ ) {
					this.showLabel( this.successList[i] );
				}
			}
			if (this.settings.unhighlight) {
				for ( var i = 0, elements = this.validElements(); elements[i]; i++ ) {
					this.settings.unhighlight.call( this, elements[i], this.settings.errorClass, this.settings.validClass );
				}
			}
			this.toHide = this.toHide.not( this.toShow );
			this.hideErrors();
			this.addWrapper( this.toShow ).show();
		},

		validElements: function() {
			return this.currentElements.not(this.invalidElements());
		},

		invalidElements: function() {
			return $(this.errorList).map(function() {
				return this.element;
			});
		},

		showLabel: function(element, message) {
			var label = this.errorsFor( element );
			if ( label.length ) {
				// refresh error/success class
				label.removeClass().addClass( this.settings.errorClass );

				// check if we have a generated label, replace the message then
				label.attr("generated") && label.html(message);
			} else {
				// create label
				label = $("<" + this.settings.errorElement + "/>")
					.attr({"for":  this.idOrName(element), generated: true})
					.addClass(this.settings.errorClass)
					.html(message || "");
				if ( this.settings.wrapper ) {
					// make sure the element is visible, even in IE
					// actually showing the wrapped element is handled elsewhere
					label = label.hide().show().wrap("<" + this.settings.wrapper + "/>").parent();
				}
				if ( !this.labelContainer.append(label).length )
					this.settings.errorPlacement
						? this.settings.errorPlacement(label, $(element) )
						: label.insertAfter(element);
			}
			if ( !message && this.settings.success ) {
				label.text("");
				typeof this.settings.success == "string"
					? label.addClass( this.settings.success )
					: this.settings.success( label );
			}
			this.toShow = this.toShow.add(label);
		},

		errorsFor: function(element) {
			var name = this.idOrName(element);
    		return this.errors().filter(function() {
				return $(this).attr('for') == name;
			});
		},

		idOrName: function(element) {
			return this.groups[element.name] || (this.checkable(element) ? element.name : element.id || element.name);
		},

		checkable: function( element ) {
			return /radio|checkbox/i.test(element.type);
		},

		findByName: function( name ) {
			// select by name and filter by form for performance over form.find("[name=...]")
			var form = this.currentForm;
			return $(document.getElementsByName(name)).map(function(index, element) {
				return element.form == form && element.name == name && element  || null;
			});
		},

		getLength: function(value, element) {
			switch( element.nodeName.toLowerCase() ) {
			case 'select':
				return $("option:selected", element).length;
			case 'input':
				if( this.checkable( element) )
					return this.findByName(element.name).filter(':checked').length;
			}
			return value.length;
		},

		depend: function(param, element) {
			return this.dependTypes[typeof param]
				? this.dependTypes[typeof param](param, element)
				: true;
		},

		dependTypes: {
			"boolean": function(param, element) {
				return param;
			},
			"string": function(param, element) {
				return !!$(param, element.form).length;
			},
			"function": function(param, element) {
				return param(element);
			}
		},

		optional: function(element) {
			return !$.validator.methods.required.call(this, $.trim(element.value), element) && "dependency-mismatch";
		},

		startRequest: function(element) {
			if (!this.pending[element.name]) {
				this.pendingRequest++;
				this.pending[element.name] = true;
			}
		},

		stopRequest: function(element, valid) {
			this.pendingRequest--;
			// sometimes synchronization fails, make sure pendingRequest is never < 0
			if (this.pendingRequest < 0)
				this.pendingRequest = 0;
			delete this.pending[element.name];
			if ( valid && this.pendingRequest == 0 && this.formSubmitted && this.form() ) {
				$(this.currentForm).submit();
				this.formSubmitted = false;
			} else if (!valid && this.pendingRequest == 0 && this.formSubmitted) {
				$(this.currentForm).triggerHandler("invalid-form", [this]);
				this.formSubmitted = false;
			}
		},

		previousValue: function(element) {
			return $.data(element, "previousValue") || $.data(element, "previousValue", {
				old: null,
				valid: true,
				message: this.defaultMessage( element, "remote" )
			});
		}

	},

	classRuleSettings: {
		required: {required: true},
		requiredSel: {requiredSel: true},
		email: {email: true},
		url: {url: true},
		date: {date: true},
		dateLegalEnd:{dateLegalEnd: true},
		numberLegaelStart:{numberLegaelStart:true},
		dateISO: {dateISO: true},
		dateDE: {dateDE: true},
		number: {number: true},
		numberDE: {numberDE: true},
		digits: {digits: true},
		creditcard: {creditcard: true},
		ip:{ip:true},								//yangjie
		port:{port:true},							//yangjie
		idcard:{idcard:true},						//yangjie
		zipCode:{zipCode:true},						//yangjie
		userName:{userName:true},					//yangjie
		mobile:{mobile:true},						//yangjie
		phone:{phone:true},							//yangjie
		fax:{fax:true},								//yangjie
		pic:{pic:true},								//yangjie
		doc:{doc:true},								//yangjie
		xls:{xls:true},								//yangjie
		integer:{integer:true},						//yangjie
		integerPlus:{integerPlus:true},				//yangjie
		integerMinus:{integerMinus:true},			//yangjie
		floatNumOne:{floatNumOne:true},				//yangjie
		floatNumTwo:{floatNumTwo:true},				//yangjie
		floatNumFour:{floatNumFour:true},			//yangjie
		floatNumSix:{floatNumSix:true},				//yangjie
		floatNumEight:{floatNumEight:true},			//yangjie
		floatNumPlusTwo:{floatNumPlusTwo:true},		//yangjie
		floatNumPlusFour:{floatNumPlusFour:true},	//yangjie
		floatNumPlusSix:{floatNumPlusSix:true},		//yangjie
		floatNumMinus:{floatNumMinus:true},			//yangjie
		longitude:{longitude:true},					//yangjie
		latitude:{latitude:true}					//yangjie
	},

	addClassRules: function(className, rules) {
		className.constructor == String ?
			this.classRuleSettings[className] = rules :
			$.extend(this.classRuleSettings, className);
	},

	classRules: function(element) {
		var rules = {};
		var classes = $(element).attr('class');
		classes && $.each(classes.split(' '), function() {
			if (this in $.validator.classRuleSettings) {
				$.extend(rules, $.validator.classRuleSettings[this]);
			}
		});
		return rules;
	},

	attributeRules: function(element) {
		var rules = {};
		var $element = $(element);

		for (var method in $.validator.methods) {
			var value = $element.attr(method);
			if (value) {
				rules[method] = value;
			}
		}

		// maxlength may be returned as -1, 2147483647 (IE) and 524288 (safari) for text inputs
		if (rules.maxlength && /-1|2147483647|524288/.test(rules.maxlength)) {
			delete rules.maxlength;
		}

		return rules;
	},

	metadataRules: function(element) {
		if (!$.metadata) return {};

		var meta = $.data(element.form, 'validator').settings.meta;
		return meta ?
			$(element).metadata()[meta] :
			$(element).metadata();
	},

	staticRules: function(element) {
		var rules = {};
		var validator = $.data(element.form, 'validator');
		if (validator.settings.rules) {
			rules = $.validator.normalizeRule(validator.settings.rules[element.name]) || {};
		}
		return rules;
	},

	normalizeRules: function(rules, element) {
		// handle dependency check
		$.each(rules, function(prop, val) {
			// ignore rule when param is explicitly false, eg. required:false
			if (val === false) {
				delete rules[prop];
				return;
			}
			if (val.param || val.depends) {
				var keepRule = true;
				switch (typeof val.depends) {
					case "string":
						keepRule = !!$(val.depends, element.form).length;
						break;
					case "function":
						keepRule = val.depends.call(element, element);
						break;
				}
				if (keepRule) {
					rules[prop] = val.param !== undefined ? val.param : true;
				} else {
					delete rules[prop];
				}
			}
		});

		// evaluate parameters
		$.each(rules, function(rule, parameter) {
			rules[rule] = $.isFunction(parameter) ? parameter(element) : parameter;
		});

		// clean number parameters
		$.each(['minlength', 'maxlength', 'min', 'max'], function() {
			if (rules[this]) {
				rules[this] = Number(rules[this]);
			}
		});
		$.each(['rangelength', 'range'], function() {
			if (rules[this]) {
				rules[this] = [Number(rules[this][0]), Number(rules[this][1])];
			}
		});

		if ($.validator.autoCreateRanges) {
			// auto-create ranges
			if (rules.min && rules.max) {
				rules.range = [rules.min, rules.max];
				delete rules.min;
				delete rules.max;
			}
			if (rules.minlength && rules.maxlength) {
				rules.rangelength = [rules.minlength, rules.maxlength];
				delete rules.minlength;
				delete rules.maxlength;
			}
		}

		// To support custom messages in metadata ignore rule methods titled "messages"
		if (rules.messages) {
			delete rules.messages;
		}

		return rules;
	},

	// Converts a simple string to a {string: true} rule, e.g., "required" to {required:true}
	normalizeRule: function(data) {
		if( typeof data == "string" ) {
			var transformed = {};
			$.each(data.split(/\s/), function() {
				transformed[this] = true;
			});
			data = transformed;
		}
		return data;
	},

	// http://docs.jquery.com/Plugins/Validation/Validator/addMethod
	addMethod: function(name, method, message) {
		$.validator.methods[name] = method;
		$.validator.messages[name] = message != undefined ? message : $.validator.messages[name];
		if (method.length < 3) {
			$.validator.addClassRules(name, $.validator.normalizeRule(name));
		}
	},

	methods: {

		// http://docs.jquery.com/Plugins/Validation/Methods/required
		required: function(value, element, param) {
			// check if dependency is met
			if ( !this.depend(param, element) )
				return "dependency-mismatch";
			switch( element.nodeName.toLowerCase() ) {
			case 'select':
				// could be an array for select-multiple or a string, both are fine this way
				var val = $(element).val();
				return val && val.length > 0;
			case 'input':
				if ( this.checkable(element) )
					return this.getLength(value, element) > 0;
			default:
				return $.trim(value).length > 0;
			}
		},
		requiredSel: function(value, element, param) {
			// check if dependency is met
			if ( !this.depend(param, element) )
				return "dependency-mismatch";
			switch( element.nodeName.toLowerCase() ) {
			case 'select':
				var options = $("option:selected", element);
				return options.length > 0 && ( element.type == "select-multiple" || ($.browser.msie && !(options[0].attributes['value'].specified) ? options[0].text : options[0].value).length > 0);
			case 'input':
				if ( this.checkable(element) )
					return this.getLength(value, element) > 0;
			default:
				return $.trim(value).length > 0;
			}
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/remote
		remote: function(value, element, param) {
			if ( this.optional(element) )
				return "dependency-mismatch";

			var previous = this.previousValue(element);
			if (!this.settings.messages[element.name] )
				this.settings.messages[element.name] = {};
			previous.originalMessage = this.settings.messages[element.name].remote;
			this.settings.messages[element.name].remote = previous.message;

			param = typeof param == "string" && {url:param} || param;

			if ( this.pending[element.name] ) {
				return "pending";
			}
			if ( previous.old === value ) {
				return previous.valid;
			}

			previous.old = value;
			var validator = this;
			this.startRequest(element);
			var data = {};
			data[element.name] = value;
			$.ajax($.extend(true, {
				url: param,
				mode: "abort",
				port: "validate" + element.name,
				dataType: "json",
				data: data,
				success: function(response) {
					validator.settings.messages[element.name].remote = previous.originalMessage;
					var valid = response === true;
					if ( valid ) {
						var submitted = validator.formSubmitted;
						validator.prepareElement(element);
						validator.formSubmitted = submitted;
						validator.successList.push(element);
						validator.showErrors();
					} else {
						var errors = {};
						var message = response || validator.defaultMessage( element, "remote" );
						errors[element.name] = previous.message = $.isFunction(message) ? message(value) : message;
						validator.showErrors(errors);
					}
					previous.valid = valid;
					validator.stopRequest(element, valid);
				}
			}, param));
			return "pending";
		},
		// http://docs.jquery.com/Plugins/Validation/Methods/minlength
		minlength: function(value, element, param) {
			return this.optional(element) || this.getLength($.trim(value), element) >= param;
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/maxlength
		maxlength: function(value, element, param) {
			return this.optional(element) || this.getLength($.trim(value), element) <= param;
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/rangelength
		rangelength: function(value, element, param) {
			var length = this.getLength($.trim(value), element);
			return this.optional(element) || ( length >= param[0] && length <= param[1] );
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/min
		min: function( value, element, param ) {
			return this.optional(element) || value >= param;
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/max
		max: function( value, element, param ) {
			return this.optional(element) || value <= param;
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/range
		range: function( value, element, param ) {
			return this.optional(element) || ( value >= param[0] && value <= param[1] );
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/email
		email: function(value, element) {
			// contributed by Scott Gonzalez: http://projects.scottsplayground.com/email_address_validation/
			return this.optional(element) || /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i.test(value);
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/url
		url: function(value, element) {
			// contributed by Scott Gonzalez: http://projects.scottsplayground.com/iri/
			return this.optional(element) || /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value);
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/date
		date: function(value, element) {
			var result = false;
			if(value.length>4)
			{
				value = value.substring(0,4);
				if(parseInt(value)<=2050&&parseInt(value)>=1950)
				{
					result = true;
				}
			}
			return this.optional(element) || result;
		//	return this.optional(element) || !/Invalid|NaN/.test(new Date(value));
		//	var date = /[1-2][0-9]{3}-[0][1-9]||[1][0-2]-[1-2][0-9]||[3][0-1]||[0][1-9]/;
		//	return this.optional(element) || (date.test(value));			//yangjie
		},

		dateLegalStart: function(value, element, param) {
			var dateStart = $(param).val();
			var dateEnd = value;
			return $.validator.methods["dateLegal"].call(this,dateStart,dateEnd);
		},

		dateLegalEnd: function(value, element, param) {
			var dateStart = value;
			var dateEnd = $(param).val();
			return $.validator.methods["dateLegal"].call(this,dateStart,dateEnd);
		},
		numberLegalStart: function(value, element, param) {
			var numberStart = $(param).val();
			var numberEnd = value;
			return $.validator.methods["numberLegal"].call(this,numberStart,numberEnd);
		},

		numberLegalEnd: function(value, element, param) {
			var numberStart = value;
			var numberEnd = $(param).val();
			return $.validator.methods["numberLegal"].call(this,numberStart,numberEnd);
		},

		dateLegal: function(dateStart, dateEnd) {
			var result = false;
			if(dateStart==""||dateEnd=="")
			{
				return true;
			}
			
			//时间类型的比较，简单
			if (dateStart.length<=5 && dateEnd.length<=5 && dateStart.indexOf(":")!=-1 && dateEnd.indexOf(":")!=-1)
			{
				var spl = ":";
				var dateStartArray = dateStart.split(spl);
				var dateEndArray = dateEnd.split(spl);
				
				var hourStart = dateStartArray[0];
				
				if(hourStart.substring(0,1)=='0')
				{
					hourStart = hourStart.substring(1,2);
				}
				
				var hourEnd = dateEndArray [0];
				if(hourEnd.substring(0,1)=='0')
				{
					hourEnd = hourEnd.substring(1,2);
				}
				
				var minuteStart = dateStartArray[1];
				if(minuteStart.substring(0,1)=='0')
				{
					minuteStart = minuteStart.substring(1,2);
				}
				
				var minuteEnd = dateEndArray [1];
				if(minuteEnd.substring(0,1)=='0')
				{
					minuteEnd = minuteEnd.substring(1,2);
				}
			
				
				if(parseInt(hourStart)<parseInt(hourEnd))
				{
					return true;
				}
				else
				{
					if (parseInt(hourStart)==parseInt(hourEnd))
					{
						if(parseInt(minuteStart )<=parseInt(minuteEnd ))
						{
							return true;
						}
						else
						{
							return false;
						}
		
					}
					else
					{
						return false;
					}
		
				}
			}

			var spl = "/";
			var splitTemp = dateStart.substring(4,5);
			var splitArray = ["-","/"];
			for(var i=0; i<splitArray.length; i++)
			{
				if(splitTemp == splitArray[i])
				{
					spl = splitArray[i];
					break;
				}
			}
			var dateStartArray = dateStart.split(spl);
			var dateEndArray = dateEnd.split(spl);
			if(parseInt(dateStartArray[0])<parseInt(dateEndArray[0]))
			{
				result = true;
			}
			else if(parseInt(dateStartArray[0])==parseInt(dateEndArray[0]))
			{
				if(dateStartArray[1].length>1)
				{
					if(dateStartArray[1].substring(0,1)=='0')
					{
						dateStartArray[1] = dateStartArray[1].substring(1,2);
					}
				}
				if(dateEndArray[1].length>1)
				{
					if(dateEndArray[1].substring(0,1)=='0')
					{
						dateEndArray[1] = dateEndArray[1].substring(1,2);
					}
				}

				if(parseInt(dateStartArray[1])<parseInt(dateEndArray[1]))
				{
					result = true;
				}
				else if(parseInt(dateStartArray[1])==parseInt(dateEndArray[1]))
				{
					if(dateStartArray[2].length>1)
					{
						if(dateStartArray[2].substring(0,1)=='0')
						{
							dateStartArray[2] = dateStartArray[2].substring(1,2);
						}
					}
					if(dateEndArray[2].length>1)
					{
						if(dateEndArray[2].substring(0,1)=='0')
						{
							dateEndArray[2] = dateEndArray[2].substring(1,2);
						}
					}
					if(parseInt(dateStartArray[2])<=parseInt(dateEndArray[2]))
					{
						result = true;
					}
				}
			}
			return result;
		},
		numberLegal: function(numberStart, numberEnd) {
			var result = false;
			if(numberStart==""||numberEnd=="")
			{
				return true;
			}
			
			//数字类型比较
			if (numberStart <= numberEnd)
			{
				return true;
			}
			else
			{
				return false;
			}
		},
		
		// http://docs.jquery.com/Plugins/Validation/Methods/dateISO
		dateISO: function(value, element) {
			return this.optional(element) || /^\d{4}[\/-]\d{1,2}[\/-]\d{1,2}$/.test(value);
		},
	
		// http://docs.jquery.com/Plugins/Validation/Methods/dateDE
		dateDE: function(value, element) {
			return this.optional(element) || /^\d\d?\.\d\d?\.\d\d\d?\d?$/.test(value);
		},
	
		// http://docs.jquery.com/Plugins/Validation/Methods/number
		number: function(value, element) {
			//var number = /^[0-9]{1,8}$/;
			//return this.optional(element) || number.test(value);
			return this.optional(element) || (/^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(value));
		},
	
		// http://docs.jquery.com/Plugins/Validation/Methods/numberDE
		numberDE: function(value, element) {
			return this.optional(element) || /^-?(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d+)?$/.test(value);
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/dateISO
		dateISO: function(value, element) {
			return this.optional(element) || /^\d{4}[\/-]\d{1,2}[\/-]\d{1,2}$/.test(value);
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/number
		number: function(value, element) {
			return this.optional(element) || /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(value);
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/digits
		digits: function(value, element) {
			return this.optional(element) || /^\d+$/.test(value);
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/creditcard
		// based on http://en.wikipedia.org/wiki/Luhn
		creditcard: function(value, element) {
			if ( this.optional(element) )
				return "dependency-mismatch";
			// accept only digits and dashes
			if (/[^0-9-]+/.test(value))
				return false;
			var nCheck = 0,
				nDigit = 0,
				bEven = false;

			value = value.replace(/\D/g, "");

			for (var n = value.length - 1; n >= 0; n--) {
				var cDigit = value.charAt(n);
				var nDigit = parseInt(cDigit, 10);
				if (bEven) {
					if ((nDigit *= 2) > 9)
						nDigit -= 9;
				}
				nCheck += nDigit;
				bEven = !bEven;
			}

			return (nCheck % 10) == 0;
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/accept
		accept: function(value, element, param) {
			param = typeof param == "string" ? param.replace(/,/g, '|') : "png|jpe?g|gif";
			return this.optional(element) || value.match(new RegExp(".(" + param + ")$", "i"));
		},

		// http://docs.jquery.com/Plugins/Validation/Methods/equalTo
		equalTo: function(value, element, param) {
			return value == $(param).val();
		},

//yangjie
		ip: function(value, element) {    
			var ip = /^[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}$/; 
			return this.optional(element) || (ip.test(value));    
		},

		port: function(value, element) {    
			var integer = /^((((\+)?|-)[1-9][0-9]{0,7})|0)$/; 
			return this.optional(element) || (integer.test(value)&&value>=0&&value<=65535);    
		},

		idcard: function(sId, element) {
			var aCity={11:"北京",12:"天津",13:"河北",14:"山西",15:"内蒙古",21:"辽宁",22:"吉林",23:"黑龙江",31:"上海",32:"江苏",33:"浙江",34:"安徽",35:"福建",36:"江西",37:"山东",41:"河南",42:"湖北",43:"湖南",44:"广东",45:"广西",46:"海南",50:"重庆",51:"四川",52:"贵州",53:"云南",54:"西藏",61:"陕西",62:"甘肃",63:"青海",64:"宁夏",65:"新疆",71:"台湾",81:"香港",82:"澳门",91:"国外"}; 
			var iSum=0 ;
			var info="" ;
			if(sId=="") return true;
			if(!/^\d{17}(\d|x)$/i.test(sId)) return false; 
			sId=sId.replace(/x$/i,"a"); 
			if(aCity[parseInt(sId.substr(0,2))]==null) return false; 
			sBirthday=sId.substr(6,4)+"-"+Number(sId.substr(10,2))+"-"+Number(sId.substr(12,2)); 
			var d=new Date(sBirthday.replace(/-/g,"/")) ;
			if(sBirthday!=(d.getFullYear()+"-"+ (d.getMonth()+1) + "-" + d.getDate()))return false; 
			for(var i = 17;i>=0;i --) iSum += (Math.pow(2,i) % 11) * parseInt(sId.charAt(17 - i),11) ;
			if(iSum%11!=1) return false; 
			return true;
		},

		zipCode: function(value, element) {    
			var tel = /^[0-9]{6}$/; 
			return this.optional(element) || (tel.test(value));    
		},

		userName: function(value, element) {   
			var pattern = /^([\uFE30-\uFFA0]|[_\a-zA-Z0-9]|[\s])*$/gi;
			return this.optional(element) || pattern.test(value);
		},

		mobile: function(value, element) {    
			var length = value.length;
			//return this.optional(element) || length <= 32
			return this.optional(element) || (length == 11 && /^(((13[0-9]{1})|(15[0-9]{1}))+\d{8})$/.test(value));
		},

		phone: function(value, element) {    
			var tel = /^(\d{3,4}-?)?(\d{3,4}-?)?(\d{7,9})(-?\d{1,4})?$/g; 
			var length = value.length;
			//return this.optional(element) || length <= 32
			return this.optional(element) || (tel.test(value));    
		},

		fax: function(value, element) {    
			//var fax = /^(\d{3,4}-?)?\d{7,9}$/g;    
			//return this.optional(element) || (fax.test(value)); 
			var length = value.length;
			return this.optional(element) || length <= 32
		},

		pic: function(value, element) {    
			var pic = /.(gif|jpg|png)$/i;    
			return this.optional(element) || (pic.test(value));    
		},

		doc: function(value, element) {    
			var doc = /.(doc|docx)$/i;    
			return this.optional(element) || (doc.test(value));    
		},
		
		xls: function(value, element) {    
			var xls = /.(xls)$/i;    
			return this.optional(element) || (xls.test(value));    
		},

		integer: function(value, element) {    
			var integer = /^((((\+)?|-)[1-9][0-9]{0,7})|0)$/; 
			return this.optional(element) || (integer.test(value));    
		},

		integerPlus: function(value, element) {    
			var integerPlus = /^(((\+)?[1-9][0-9]{0,7})|0)$/; 
			return this.optional(element) || (integerPlus.test(value));    
		},

		integerMinus: function(value, element) {    
			var integerMinus = /^-[1-9][0-9]{0,7}$/; 
			return this.optional(element) || (integerMinus.test(value));    
		},
		
		floatNumOne: function(value, element) {    
			var floatNumOne = /^((((\+)?|-)[1-9][0-9]{0,9})|0)(\.[0-9]{1,1})?$/; 
			return this.optional(element) || (floatNumOne.test(value));    
		},
		
		floatNumTwo: function(value, element) {    
			var floatNumTwo = /^((((\+)?|-)[1-9][0-9]{0,7})|0)(\.[0-9]{1,2})?$/; 
			return this.optional(element) || (floatNumTwo.test(value));    
		},

		floatNumFour: function(value, element) {    
			var floatNumFour = /^((((\+)?|-)[1-9][0-9]{0,7})|0)(\.[0-9]{1,4})?$/; 
			return this.optional(element) || (floatNumFour.test(value));    
		},

		floatNumSix: function(value, element) {    
			var floatNumSix = /^((((\+)?|-)[1-9][0-9]{0,7})|0)(\.[0-9]{1,6})?$/; 
			return this.optional(element) || (floatNumSix.test(value));    
		},

		floatNumEight: function(value, element) {    
			var floatNumEight = /^((((\+)?|-)[1-9][0-9]{0,7})|0)(\.[0-9]{1,8})?$/; 
			return this.optional(element) || (floatNumEight.test(value));    
		},

		floatNumPlusTwo: function(value, element) {    
			var floatNumPlusTwo = /^(((\+)?[1-9][0-9]{0,7})|0)(\.[0-9]{1,2})?$/; 
			return this.optional(element) || (floatNumPlusTwo.test(value));    
		},

		floatNumPlusFour: function(value, element) {    
			var floatNumPlusFour = /^(((\+)?[1-9][0-9]{0,7})|0)(\.[0-9]{1,4})?$/; 
			return this.optional(element) || (floatNumPlusFour.test(value));    
		},

		floatNumPlusSix: function(value, element) {    
			var floatNumPlusSix = /^(((\+)?[1-9][0-9]{0,7})|0)(\.[0-9]{1,6})?$/; 
			return this.optional(element) || (floatNumPlusSix.test(value));    
		},

		floatNumMinus: function(value, element) {    
			var floatNumMinus = /^-[1-9][0-9]{0,7}(\.[0-9]{1,6})?$/; 
			return this.optional(element) || (floatNumMinus.test(value));    
		},

		longitude: function(value, element) {    
			var longitude = /^((((\+)?|-)[1-9][0-9]{0,2})|0)(\.[0-9]{1,8})?$/; 
			return this.optional(element) || ((longitude.test(value))&&parseFloat(value)<=parseFloat(180)&&parseFloat(value)>=parseFloat(-180));    
		},

		latitude: function(value, element) {    
			var latitude = /^((((\+)|-)?[1-9][0-9]{0,2})|0)(\.[0-9]{1,8})?$/; 
			return this.optional(element) || ((latitude.test(value))&&parseFloat(value)<=parseFloat(90)&&parseFloat(value)>=parseFloat(-90));    
		}
//yangjie		
	}
	
});


// deprecated, use $.validator.format instead
$.format = $.validator.format;

})(jQuery);

// ajax mode: abort
// usage: $.ajax({ mode: "abort"[, port: "uniqueport"]});
// if mode:"abort" is used, the previous request on that port (port can be undefined) is aborted via XMLHttpRequest.abort()
;(function($) {
	var pendingRequests = {};
	// Use a prefilter if available (1.5+)
	if ( $.ajaxPrefilter ) {
		$.ajaxPrefilter(function(settings, _, xhr) {
			var port = settings.port;
			if (settings.mode == "abort") {
				if ( pendingRequests[port] ) {
					pendingRequests[port].abort();
				}
				pendingRequests[port] = xhr;
			}
		});
	} else {
		// Proxy ajax
		var ajax = $.ajax;
		$.ajax = function(settings) {
			var mode = ( "mode" in settings ? settings : $.ajaxSettings ).mode,
				port = ( "port" in settings ? settings : $.ajaxSettings ).port;
			if (mode == "abort") {
				if ( pendingRequests[port] ) {
					pendingRequests[port].abort();
				}
				return (pendingRequests[port] = ajax.apply(this, arguments));
			}
			return ajax.apply(this, arguments);
		};
	}
})(jQuery);

// provides cross-browser focusin and focusout events
// IE has native support, in other browsers, use event caputuring (neither bubbles)

// provides delegate(type: String, delegate: Selector, handler: Callback) plugin for easier event delegation
// handler is only called when $(event.target).is(delegate), in the scope of the jquery-object for event.target
;(function($) {
	// only implement if not provided by jQuery core (since 1.4)
	// TODO verify if jQuery 1.4's implementation is compatible with older jQuery special-event APIs
	if (!jQuery.event.special.focusin && !jQuery.event.special.focusout && document.addEventListener) {
		$.each({
			focus: 'focusin',
			blur: 'focusout'
		}, function( original, fix ){
			$.event.special[fix] = {
				setup:function() {
					this.addEventListener( original, handler, true );
				},
				teardown:function() {
					this.removeEventListener( original, handler, true );
				},
				handler: function(e) {
					arguments[0] = $.event.fix(e);
					arguments[0].type = fix;
					return $.event.handle.apply(this, arguments);
				}
			};
			function handler(e) {
				e = $.event.fix(e);
				e.type = fix;
				//return $.event.handle.call(this, e); //todo IE11这里报错
				return $.event.handle && $.event.handle.call(this, e);
			}
		});
	};
	$.extend($.fn, {
		validateDelegate: function(delegate, type, handler) {
			return this.bind(type, function(event) {
				var target = $(event.target);
				if (target.is(delegate)) {
					return handler.apply(target, arguments);
				}
			});
		},
		triggerEvent: function(type, target) {
			return this.triggerHandler(type, [$.event.fix({ type: type, target: target })]);
		}
	})
})(jQuery);
