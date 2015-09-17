(function(WS, $){

	WS.curation = WS.curation || {};
	
	WS.curation.req = {

		_base: function(options){
			var self = this;

			var defaults = {
				contentType: 'application/json; charset=utf-8',
				dataType: 'json'
			};

			var userObj = WS.curation.auth.getUser();
			if(typeof userObj === 'object'){
				defaults.headers = {
					'X-Authentication': userObj.userId+','+userObj.key
				};
			}

			//merge options into defaults
			$.extend(defaults, options);

			console.log('REQ', defaults);

			return $.ajax(defaults);
		},

		post: function(url, data){
			return this._base({
				type: 'POST',
				url: url,
				data: typeof data === 'object' ? JSON.stringify(data) : data
			});
		},

		get: function(url, data){
			return this._base({
				type: 'GET',
				url: url,
				data: data
			});
		},

		delete: function(url, data){
			return this._base({
				type: 'DELETE',
				url: url,
				data: typeof data === 'object' ? JSON.stringify(data) : data
			});
		}

	};

}((window.WS = window.WS || {}), $));