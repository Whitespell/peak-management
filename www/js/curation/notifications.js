(function(WS, $){
	
	WS.curation.notifications = {

		init: function(){
			this.$_notificationEl = $('#js-main-notification');
			this.$_notificationTextEl = this.$_notificationEl.find('.js-main-notification__content');
		},

		show: function(msg){
			this.$_notificationEl.removeClass('hidden');
			this.$_notificationTextEl.text(msg);
		},

		hide: function(msg){
			this.$_notificationEl.addClass('hidden');
		}

	};

}((window.WS = window.WS || {}), $));