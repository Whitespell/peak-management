(function(WS, $, Handlebars){
	
	WS.curation.videoOverview = {

		init: function(){
			this._$overviewEl = $('[data-video-overview]');
			this._$navEl = $('[data-video-overview-nav]');
			this._currOffset = 0;
			this._videos = {};

			this._categoryId = this._checkCategory();

			this._bindEvents();
			this._initItemTemplate();
			this._getNextVideos();
			this._initNav();
		},

		_checkCategory: function(){
			var categoryName = WS.curation.utils.getParameterByName('categoryName') || 'All',
				categoryId = WS.curation.utils.getParameterByName('categoryId');

			$('[data-video-overview-category-name]').text(categoryName);

			return categoryId;
		},

		_initNav: function(){
			var $el = this._$navEl;

			WS.curation.req.get('https://peakapi.whitespell.com/categories')
			.done(function(categories){
				categories.forEach(function(details){
					$el.append('<li><a href="?categoryName='+details.categoryName+
						'&categoryId='+details.categoryId+'">'+
						details.categoryName+'</a></li>');
				});
			});
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

			this._itemActionReqInProgress = true;
			$resMsgEl.text('Processing...');

			var videoDetails = this._videos[itemId];

			if(action === 'approve'){
				videoDetails.curationAccepted = 1;
			} else if(action === 'decline'){
				videoDetails.curationAccepted = -1;
			} else {
				return;
			}

			WS.curation.req.post('https://peakapi.whitespell.com/contentcurated', videoDetails)
			.done(function(res){
				$item.remove();
			})
			.fail(function(res){
				res = res.responseJSON;
				$resMsgEl.html('<b>An error occured.</b><br>'+res.httpStatusCode+', '+res.errorMessage);
			})
			.always(function(){
				self._itemActionReqInProgress = false;
			});
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
					self._$overviewEl.append(html);
				});
			};

			var reqOptions = {
				notCurated: 1,
				limit: limit
			};

			if(offset > 0){
				reqOptions.offset = offset;
			}

			if(this._categoryId){
				reqOptions.categoryId = this._categoryId;
			}

			WS.curation.req.get('https://peakapi.whitespell.com/content', reqOptions)
			.done(function(res){
				parseItems(res);

				res.forEach(function(details){
					self._videos[details.contentId] = details;
				});

				dfd.resolve(res);
			})
			.fail(dfd.reject);

			return dfd;
		}

	};

}((window.WS = window.WS || {}), $, Handlebars));