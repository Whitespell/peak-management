(function(WS, $){
	
	WS.curation.init = {

		init: function(){
			//init auth
			WS.curation.auth.init()
			.then(function(){
				//init modules
				WS.curation.videoOverview.init();
				WS.curation.notifications.init();
			},
			function(){
				res = res.responseJSON;
				WS.curation.notifications.show('Error '+res.errorId+' '+res.errorMessage);
			});
		}

	};

	WS.curation.init.init();

}((window.WS = window.WS || {}), $));