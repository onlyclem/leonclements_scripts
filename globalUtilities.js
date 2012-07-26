
	var globalUtilities = {
	
		toggleSubMenu : function(tabName) {
			var subMenu = $('#' + tabName + '_sub_tabs');
			if (subMenu.length > 0) {
				if (subMenu.css('display') == 'none') {
					subMenu.fadeIn('fast');
				}
				else {
					subMenu.fadeOut('fast');
				}
			}
		},
		
		recordRequest : function(link, name, page, referrer, type, browser, userAgent) {
			$.ajax({
				type : 'POST',
				url: 'record_request.php',
				dataType : 'json',
				data: {
					'link' : link,
					'name' : name,
					'page' : page,
					'referrer' : referrer,
					'type' : type,
					'browser' : browser,
					'userAgent' : userAgent
				},
				success : function(data){
					//...
				},
				error : function(XMLHttpRequest, textStatus, errorThrown) {
					if (XMLHttpRequest.status != 200)
						alert('Record request failed!');
				}
			});
		},
		
		populateDownloadRequestParameters : function() {
		
			var pageSplit = document.URL.split('/');
			var downloadForms = $('.download_form');
			
			for (var i = 0; i < downloadForms.length; ++i) {
				
				var fields = downloadForms[i].elements;
				var data = {
					'link' : document.URL,
					'page' : pageSplit[pageSplit.length - 1],
					'referrer' : document.referrer,
					'browser' : navigator.appCodeName + ' ' + navigator.appVersion,
					'userAgent' : navigator.userAgent
				}
				
				for (dataField in data) {
					if (fields[dataField])
						fields[dataField].value = data[dataField];
				}
			}
		}
	}
	
	$(document).ready(function() {
		
		// click event for additional toggle
		$('.parent').click(function(e) {
			globalUtilities.toggleSubMenu($(this).attr('id'));
			// now discard the click event to stop it from 'bubbling up' to apply to other elements
			e.stopPropagation();
		}),

		$('.tab').mouseenter(function() {
			clearTimeout($(this).data('timeoutId'));
			var subTabsId = this.id + '_sub_tabs';
			$('#' + subTabsId).fadeIn('fast');
			
			var subTabsArray = $('.sub_tabs');
			if (subTabsArray.length > 0) {
				for (var i = 0; i < subTabsArray.length; ++i) {
					if (subTabsArray[i].id != subTabsId) {
						subTabsArray[i].style.display = 'none';
					}
				}
			}
		}),
		
		$('.sub_tabs').mouseleave(function() {
			var subTabs = this;
			var timeoutId = setTimeout(function() {
				$('#' + subTabs.id).fadeOut('fast');
			}, 650);
			//set the timeoutId, allowing us to clear this trigger if the mouse comes back over
			$(this).data('timeoutId', timeoutId);
		});
		
		var pageSplit = document.URL.split('/');
		globalUtilities.recordRequest(document.URL, document.title, pageSplit[pageSplit.length - 1], document.referrer, 'page', navigator.appCodeName + ' ' + navigator.appVersion, navigator.userAgent);
		globalUtilities.populateDownloadRequestParameters();
		
	});