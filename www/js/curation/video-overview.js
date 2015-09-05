(function(WS, $, Handlebars){
	
	WS.curation.videoOverview = {

		init: function(){
			this._$el = $('[video-overview]');
			this._currOffset = 0;

			this._bindEvents();

			this._initItemTemplate();
			this._getNextVideos();
		},

		_bindEvents: function(){
			var self = this,
				$window = $(window),
				$document = $(document);

			//inf scroll
			$window.scroll(function(){
				if($window.scrollTop() + $window.height() > $document.height() - 100) {
					if(!self._reqInProgress){
						self._getNextVideos();
					}
				}
			});
		},

		_initItemTemplate: function(){
			var $videoItemTemplate = $('#js-video-item-template').html();
			this._itemParser = Handlebars.compile($videoItemTemplate);
		},

		_getNextVideos: function(){
			var self = this;
			
			this._reqInProgress = true;

			this._populateOverview(20, this._currOffset)
			.done(function(){
				self._currOffset += 20;
			})
			.always(function(){
				self._reqInProgress = false;
			});
		},

		_populateOverview: function(limit, offset){
			var self = this,
				dfd = jQuery.Deferred();

			var parseItems = function(items){
				items.forEach(function(itemDetails){
					var html = self._itemParser(itemDetails);
					self._$el.append(html);
				});
			};

			var reqOptions = {
				limit: limit
			};

			if(offset > 0){
				reqOptions.offset = offset;
			}

			WS.curation.req.get('https://peakapi.whitespell.com/content', reqOptions)
			.done(function(res){
				parseItems(res);
				dfd.resolve(res);
			})
			.fail(dfd.reject);

			return dfd;
		}

	};

}((window.WS = window.WS || {}), $, Handlebars));