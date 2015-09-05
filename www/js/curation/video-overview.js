(function(WS, $, Handlebars){
	
	WS.curation.videoOverview = {

		init: function(){
			this._$el = $('[data-video-overview]');
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
					if(!self._infScrollReqInProgress){
						self._getNextVideos();
					}
				}
			});

			$('body').click(this._handleBodyClick.bind(this));
		},

		_handleBodyClick: function(e){
			var $target = $(e.target);
			if($target.data('video-overview-item-action')) this._handleItemAction($target);
		},

		_handleItemAction: function($el){
			var self = this,
				action = $el.data('video-overview-item-action'),
				$item = $el.closest('[data-video-overview-item]'),
				itemId = $item.data('video-overview-item'),
				$resMsgEl = $item.find('.js-video-overview-item-res-msg');

			if(this._itemActionReqInProgress === true){
				$resMsgEl.text('There is already a request in progress.');
				return;
			}

			//TODO:
			//something with a request and content status change based
			//on the itemId and the action (approve or decline)
			console.log(action, itemId);

			this._itemActionReqInProgress = true;

			//fake request
			setTimeout(function(){
				var resSuccessFull = true;

				if(resSuccessFull){
					//on success
					//remove item from DOM as we are done with it
					$item.remove();
				} else {
					//on error
					$resMsgEl.text('An error occured.');
				}

				//always
				self._itemActionReqInProgress = false;
			}, 1000);
		},

		_initItemTemplate: function(){
			var $videoItemTemplate = $('#js-video-item-template').html();
			this._itemParser = Handlebars.compile($videoItemTemplate);
		},

		_getNextVideos: function(){
			var self = this;
			
			this._infScrollReqInProgress = true;

			this._populateOverview(20, this._currOffset)
			.done(function(){
				self._currOffset += 20;
			})
			.always(function(){
				self._infScrollReqInProgress = false;
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