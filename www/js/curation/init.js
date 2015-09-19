(function(WS, $){
	
	WS.curation.init = {

		init: function(){
			WS.curation.notifications.init();

			var category = WS.curation.utils.getParameterByName('categoryName'),
				username = category ? 'peak'+category : 'peakfitness';

			//init auth
			WS.curation.auth.authenticate(username, '123123123')
			.then(function(){
				//init modules
				WS.curation.videoOverview.init();
				WS.curation.addContent.init();
			},
			function(res){
				res = res.responseJSON;
				WS.curation.notifications.show('Error '+res.errorId+' '+res.errorMessage);
			});
		}

	};

	WS.curation.init.init();

}((window.WS = window.WS || {}), $));