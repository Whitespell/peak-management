(function(WS, $){
	
	WS.curation.auth = {

		init: function(){
			return this._authenticate();
		},

		getUser: function(){
			return this._userObj;
		},

		_setUser: function(userObj){
			this._userObj = userObj;
		},

		_authenticate: function(){
			var self = this,
				dfd = jQuery.Deferred();

			WS.curation.req.post('https://peakapi.whitespell.com/authentication',
				'{"userName":"YOUR_USERNAME","password":"YOUR_PASSWORD","device":"DEVICE_INFO", "mac_address":"MAC_ADDRESS","geolocation":"LOCATION_INFO"}')
			.done(function(res){
				self._setUser(res);
				dfd.resolve(res);
			})
			.fail(dfd.reject);

			return dfd;
		}

	};

}((window.WS = window.WS || {}), $));