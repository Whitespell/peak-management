(function(WS, $){
	
	WS.curation.simpleForm = {

		init: function(){
			var $forms = $('[data-simple-form]');
			if(!$forms[0]) return;

			$forms.each(function(idx, el){
				new helper( $(el) );
			});
		}

	};

	var helper = function($form){
		this._$form = $form;
		this._$resBox = this._$form.find('[data-response-box]');

		this._initSelects();
		this._bindEvents();
	};

	helper.prototype = {

		_initSelects: function(){
			var $selects = this._$form.find('[data-populate-endpoint]'),
				self = this;

			$selects.each(function(idx, el){
				var $el = $(el),
					endpoint = $el.data('populate-endpoint'),
					template = $el.data('option-template');

				WS.curation.req.get('https://peakapi.whitespell.com'+endpoint)
				.then(function(res){
					res.forEach(function(details){
						var str = self._parseTemplateStr(template, details);
						$el.append(str);
					});
				});
			});
		},

		_bindEvents: function(){
			var self = this;

			this._$form.on('submit', function(e){
				e.preventDefault();
				if(self._validateForm()){
					var data = self._extractData();
					self._reqAddContent(data);
				}
			});
		},

		_parseTemplateStr: function(str, vars){
			for(var key in vars){
				str = str.replace('{{'+key+'}}', vars[key]);
			}
			return str;
		},

		_extractData: function(){
			var data = {};
			this._$form.find('input, select').each(function(idx, el){
				var $el = $(el),
					key = $el.data('key');
				if(key){
					data[key] = $el.val();
				}
			});
			return data;
		},

		_reqAddContent: function(options){
			var self = this,
				endpoint = this._$form.data('endpoint'),
				vars = {
					userId: WS.curation.auth.getUser().userId
				};

			endpoint = this._parseTemplateStr(endpoint, vars);
			
			console.log('REQ_ADD_CONTENT', options);
			self._changeResBoxText( 'Processing...\nPayload:\n '+JSON.stringify(options, null, 4) );

			WS.curation.req.post('https://peakapi.whitespell.com'+endpoint, options)
			.always(function(res){
				console.log('RES_ADD_CONTENT', res);
				self._changeResBoxText( 'Res:\n'+JSON.stringify(res, null, 4) );
			});
		},

		_changeResBoxText: function(text){
			this._$resBox.text(text);
		},

		_validateForm: function(){
			var formValid = true;
			this._$form.find('input').each(function(idx, el){
				var $el = $(el);
				if( $el.val() === '' ){
					$el.closest('.form-group').addClass('has-error');
					formValid = false;
				}
			});
			return formValid;
		}

	};

}((window.WS = window.WS || {}), $));