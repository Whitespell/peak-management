(function(WS, $){
	
	WS.curation.auth = {

		getUser: function(){
			return this._userObj;
		},

		_setUser: function(userObj){
			this._userObj = userObj;
		},

		authenticate: function(username){
			var self = this,
				dfd = jQuery.Deferred();

			WS.curation.req.post('https://peakapi.whitespell.com/authentication',
				'{"userName":"'+username+'","password":"123123123","device":"DEVICE_INFO", "mac_address":"MAC_ADDRESS","geolocation":"LOCATION_INFO"}')
			.done(function(res){
				self._setUser(res);
				dfd.resolve(res);
			})
			.fail(dfd.reject);

			return dfd;
		}

	};

}((window.WS = window.WS || {}), $));