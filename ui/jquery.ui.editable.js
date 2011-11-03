/*
 * jQuery UI Editable @VERSION
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Editable (to be created)
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 *	jquery.ui.button.js
 */
(function( $, undefined ) {

var editableClass = "ui-editable ui-widget",
	formClass = "ui-editable-form",
	buttonClass = "ui-editable-button",
	cancelClass = "ui-editable-cancel",
	inputClass = "ui-editable-input",
	placeholderClass = "ui-editable-placeholder",
	saveClass = "ui-editable-save",
	hoverableClass = "ui-widget-content ui-state-default ui-corner-all",

	cancelIconClass = "ui-icon-closethick",
	saveIconClass = "ui-icon-disk",

	activeStateClass = "ui-state-active",
	highlightStateClass = "ui-state-highlight"

$.widget( "ui.editable", {
	version: "@VERSION",
	widgetEventPrefix: "edit",

	options: {
		event: "click",
		editor: "text",
		buttons: {
			save: {
				label: 'Save',
				icons: {
					primary: saveIconClass
				},
				text: false
			},
			cancel: {
				label: 'Cancel',
				icons: {
					primary: cancelIconClass
				},
				text: false
			},
		},
		placeholder: "Click to edit"
	},

	start: function() {
		if ( !this._editing ) {
			this._edit();
		}
	},

	submit: function() {
		$( "form", this.element ).submit();
	},

	cancel: function() {
		this._cancel();
	},

	_create: function() {
		var custom_events = {};
		if ( !this.value( $.trim( this.element.text() ) ) ) {
			// Show placeholder if empty
			this._show();
		}
		this._getEditorOptions();
		// First bind custom_events, then this._events. Changing that order may cause problems (_start must precede _events[click] when this.options.event is click).
		custom_events[this.options.event] = "_start";
		this._bind( custom_events );
		this._bind( this._events );
		this.element.addClass( editableClass );
	},

	_getEditorOptions: function() {
		if ( typeof this.options.editor === "string" ) {
			this._editor = this.options.editor;
			this._editorOptions = {};
		}
		else if ( typeof this.options.editor === "object" ) {
			for(var i in this.options.editor) {
				this._editor = i;
				this._editorOptions = this.options.editor[i];
			}
		}
	},

	_events: {
		click: function( event ) {
			var $this = $( event.target );
		
			if ( !this._editing ) {}
			else if ( $this.hasClass( saveClass ) || $this.parent().hasClass( saveClass ) ) {
				this.submit();
				return false;
			}
			else if ( $this.hasClass( cancelClass ) || $this.parent().hasClass( cancelClass ) ) {
				this._cancel( event );
				return false;
			}
		},
		mouseenter: function( event ) {
			if ( !this._editing ) {
				this.element.addClass( highlightStateClass );
			}
		},
		mouseleave: function( event ) {
			this.element.removeClass( highlightStateClass );
		},
		keydown: function( event ) {
			var keyCode = $.ui.keyCode;
			switch ( event.keyCode ) {
				case keyCode.ENTER:
					this.submit();
					return false;
				case keyCode.ESCAPE:
					this._cancel();
					return false;
			}
		}
	},
	
	_start: function( event ) {
		if ( !this._editing ) {
			this.element.removeClass( highlightStateClass );
			this._edit();
		}
	},

	_show: function() {
		this._editing = undefined;
		this.element.html( this.value() || this._placeholder() );
	},

	_edit: function() {
		this._editing = true;
		this.element.html( this._form() );
		this._adjustInputWidth();
		this._formEvents();
	},

	_placeholder: function() {
		return $( "<span></span>" )
			.addClass( placeholderClass )
			.html( this.options.placeholder );
	},

	_form: function() {
		var editor = $.ui.editable.editors[ this._editor ],
			form = $( "<form></form>" )
				.addClass( formClass ),
			saveButton, cancelButton;
		this.frame = form;
		this._hoverable( this.frame.addClass( hoverableClass ) );
		if( this.options.buttons && this.options.buttons.cancel ) {
			cancelButton = this._cancelButton().appendTo( form );
		}
		if( this.options.buttons && this.options.buttons.save ) {
			saveButton = this._saveButton().appendTo( form );
		}
		if( saveButton && cancelButton ) {
			saveButton.removeClass( "ui-corner-right" );
		}
		$( "<div></div>" )
			.append( editor.element( this ) )
			.appendTo( form );
		return form;
	},

	_adjustInputWidth: function() {
		// Hack to make text input to behave just like a block level element.
		// Ideally, css would handle this all.
		// Can't use table-cell styles for IE6/7 compatibility.
		var buttonsWidth = 0;
		$( ".ui-button", this.frame ).each(function() {
			buttonsWidth += $( this ).outerWidth();
		});
		$( "> div", this.frame ).css( "margin-right", buttonsWidth );
	},

	_saveButton: function() {
		// Using A links, so it doesn't count on form tab order.
		return $( "<a></a>" )
			.button( this.options.buttons.save )
			.removeClass( "ui-corner-all" )
			.addClass( "ui-corner-right" )
			.addClass( saveClass );
	},

	_cancelButton: function() {
		return $( "<a></a>" )
			.button( this.options.buttons.cancel )
			.removeClass( "ui-corner-all" )
			.addClass( "ui-corner-right" )
			.addClass( cancelClass );
	},

	_formEvents: function() {
		var self = this,
			editor = $.ui.editable.editors[ this._editor ];
		$( "form", this.element )
			.submit( function( event ) {
				self._save.call( self, event, editor.value( self, this ) );
				return false;
			});
		editor.bind( this );
	},

	_save: function( event, newValue ) {
		var hash = {
			value: newValue
		};

		if ( this._trigger( "submit", event, hash ) === false ) {
			return;
		}
		if ( this.value() !== newValue ) {
			if ( this._trigger( "change", event, hash ) === false ) {
				return;
			}
			this.value( newValue );
		}
		this._show();
	},

	_cancel: function( event ) {
		this._show();
		this._trigger( "cancel", event );
	},

	value: function( newValue ) {
		if ( arguments.length ) {
			this._value = newValue;
		}
		return this._value;
	}
});

$.ui.editable.editors = {
	text: {
		element:function( editable ) {
			return $( "<input/>" )
				.attr( "type", "text" )
				.val( editable.value() )
				.addClass( inputClass );
		},
		bind: function( editable ) {
			var self = editable;
			$( "input", editable.element )
				.focus( function() {
					self.frame.addClass( activeStateClass );
				})
				.blur( function() {
					self.frame.removeClass( activeStateClass );
				})
				.focus();
		},
		value: function( editable, form ) {
			return $( "input", form ).val();
		}
	},
	textarea: $.noop,
	select: $.noop,
	spinner: $.noop 
};

})( jQuery );
