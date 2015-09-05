(function(WS, $, Handlebars){
	
	WS.curation.videoOverview = {

		init: function(){
			this._initItemTemplate();
			this._populateOverview($('[video-overview]'));
		},

		_initItemTemplate: function(){
			var $videoItemTemplate = $('#js-video-item-template').html();
			this._itemParser = Handlebars.compile($videoItemTemplate);
		},

		_populateOverview: function($overviewEl){
			var self = this;

			var parseItems = function(items){
				items.forEach(function(itemDetails){
					var html = self._itemParser(itemDetails);
					$overviewEl.append(html);
				});
			};

			var res = [{
				title: 'ok',
				body: 'hi'
			},{
				title: 'ok2',
				body: 'hi2'
			}];
			parseItems(res);

			WS.curation.req.get('https://peakapi.whitespell.com/content')
			.done(function(res){
				console.log(res);
			});
		}

	};

}((window.WS = window.WS || {}), $, Handlebars));