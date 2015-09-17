(function(WS, $, Handlebars){
	
	WS.curation.videoOverview = {

		init: function(){
			this._$overviewEl = $('[data-video-overview]');
			this._$navEl = $('[data-video-overview-nav]');
			this._currOffset = 0;
			this._videos = {};

			this._categoryId = this._checkCategory();

			this._bindEvents();

			this._initBundlesModal();
			this._initItemTemplate();

			this._getNextVideos();
			this._initNav();
		},

		_checkCategory: function(){
			var categoryName = WS.curation.utils.getParameterByName('categoryName') || 'fitness',
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
				$resMsgEl = $item.find('.js-video-overview-item-res-msg'),
				videoDetails = this._videos[itemId],
				userId = WS.curation.auth.getUser().userId;

			var doReq = function(callback){
				self._itemActionReqInProgress = true;
				$resMsgEl.text('Processing...');

				WS.curation.req.post('https://peakapi.whitespell.com/users/'+userId+'/content', videoDetails)
				.done(function(res){
					console.log('ADDED VIDEO', res);
					$item.remove();
					callback(res.contentId);
				})
				.fail(function(res){
					res = res.responseJSON;
					$resMsgEl.html('<b>An error occured.</b><br>'+(res ? res.httpStatusCode+', '+res.errorMessage : ''));
				})
				.always(function(){
					self._itemActionReqInProgress = false;
				});
			};

			if(this._itemActionReqInProgress === true){
				$resMsgEl.text('There is already a request in progress.');
				return;
			}

			if(action === 'approve'){

				videoDetails.accepted = 1;
				doReq(function(contentId){
					self._openBundlesModal(contentId);
				});
			
			} else if(action === 'decline'){
			
				videoDetails.accepted = -1;
				doReq();
			
			} else {
				return;
			}
		},

		_initBundlesModal: function(){
			this._bundlesModal = {
				$el: $('#bundlesModal'),
				$modalBody: $('#bundlesModal').find('.modal-body'),
				$dropdown: $('#bundles-dropdown')
			};
		},

		_openBundlesModal: function(itemId){
			var self = this,
				dfd = jQuery.Deferred(),
				selectedBundleId;

			//show modal
			this._bundlesModal.$el.modal('show');

			//get bundles
			this._addBundlesDropdown();

			this._bundlesModal.$dropdown.on('change', function(){
				selectedBundleId = $(this).val();
			});

			//catch save
			this._bundlesModal.$el.find('[data-item-approve-save]').on('click', function(){
				//add to bundle
				WS.curation.req.post('https://peakapi.whitespell.com/content/'+selectedBundleId+'/add_child', {
					childId: itemId
				});

				dfd.resolve(selectedBundleId);
				self._bundlesModal.$el.modal('hide');
			});

			this._bundlesModal.$el.find('[data-item-approve-cancel]').on('click', function(){
				dfd.reject();
				self._bundlesModal.$el.modal('hide');
			});

			return dfd;
		},

		_addBundlesDropdown: function(){
			var self = this,
				userId = WS.curation.auth.getUser().userId,
				$dropdown = this._bundlesModal.$dropdown;

			//empty options
			$dropdown.html('');
			$dropdown.append('<option selected>None</option>');

			WS.curation.req.get('https://peakapi.whitespell.com/content/?contentType=6&userId='+userId)
			.done(function(bundleOptions){
				//loop options
				console.log('GOT BUNDLES', bundleOptions);
				self._addBundleOptionsToEl(bundleOptions, $dropdown);
			});
		},

		_addBundleOptionsToEl: function(bundleOptions, $el, parentBundleTitle){
			var self = this;
			parentBundleTitle = parentBundleTitle ? parentBundleTitle+': ' : '';

			bundleOptions.forEach(function(bundle){
				//append option to dropdown
				if(bundle.children.length > 0){
					self._addBundleOptionsToEl(bundle.children, $el, bundle.contentTitle);
				}

				$el.append('<option value="'+bundle.contentId+'">'+parentBundleTitle+bundle.contentTitle+'</option>');
			});
		},

		_initItemTemplate: function(){
			var $template = $('#js-video-item-template').html();
			this._itemParser = Handlebars.compile($template);
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

			WS.curation.req.get('https://peakapi.whitespell.com/contentcurated', reqOptions)
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