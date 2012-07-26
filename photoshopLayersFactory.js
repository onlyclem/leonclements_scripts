
	/***********************************************************************************
	
		This script is licensed under:
		The GNU General Public License (Version 3, 29 June 2007)
		Further information is available at: http://www.gnu.org/licenses/gpl.txt
		
		You may use this script but please use this comment in your local copy.
		
		Modifications must be documented in this section of your copy.
		
		Thank you!
		
		Leon Clements 2012
		www.leonclements.co.uk
		
	************************************************************************************/
	
	// parent class definition
	var PhotoshopLayersManager = function() {
		
		// placeholder function name - if this is not overridden an alert popup is shown to the user
		this.hide = function (elementId) {
			alert('Need to define hide() function');
		};
		
		// placeholder function name - if this is not overridden an alert popup is shown to the user
		this.show = function (elementId) {
			alert('Need to define show() function');
		};
		
		// decision logic for calling show/hide functions
		this.manageLayerDisplays = function(layersPanelSelection, layerWithNoEffects, layerWithAllEffects, eye, fxEye, event) {
			
			var isFxLayer = $(event.currentTarget).parents('li').hasClass('fx_layer_representation');
			var closedPostFix = '_closed';
			
			if (isFxLayer) {
				if (fxEye.get(0).src.indexOf(closedPostFix) >= 0) {
					// open the eye
					fxEye.attr('src', fxEye.attr('src').replace(closedPostFix, ''));
					
					if (layersPanelSelection.find('.eye').first().attr('src').indexOf(closedPostFix) < 0)
						this.show(layersPanelSelection.attr('id').replace('li_', ''));
				}
				else {
					// close the eye
					fxEye.attr('src', fxEye.attr('src').replace('.png', closedPostFix + '.png'));
					
					if (layersPanelSelection.find('.eye').first().attr('src').indexOf(closedPostFix) < 0) {
						if (layerWithNoEffects)
							this.show(layerWithNoEffects.attr('id'));
					}
					this.hide(layersPanelSelection.attr('id').replace('li_', ''));
				}
			}
			else {
				if (eye.get(0).src.indexOf(closedPostFix) >= 0) {
					// open the eye
					eye.attr('src', eye.attr('src').replace(closedPostFix, ''));
					
					if (fxEye.length > 0) {
						if (fxEye.first().attr('src').indexOf(closedPostFix) >= 0)
							this.show(layersPanelSelection.attr('id').replace('li_', '') + '_no_effects');
						else {
							this.show(layersPanelSelection.attr('id').replace('li_', ''));
							this.show(layersPanelSelection.attr('id').replace('li_', '') + '_no_effects');
						}
					}
					else this.show(layersPanelSelection.attr('id').replace('li_', ''));
				}
				else {
					// close the eye
					eye.attr('src', eye.attr('src').replace('.png', closedPostFix + '.png'));
					
					this.hide(layersPanelSelection.attr('id').replace('li_', ''));
					
					if (layerWithNoEffects)
						this.hide(layerWithNoEffects.attr('id'));
					if (fxEye.length > 0) {
						if (fxEye.first().attr('src').indexOf(closedPostFix) >= 0)
							this.hide(layerWithNoEffects.attr('id'));
					}
				}
			}
		};
		
	};
	
	// IE6-specific implementation
	var Ie6PhotoshopsLayersManager = function() {
		
		// vars defined for use in IE6-specific implementation only
		this.originalPngs = document.getElementById('red_button_layers_container').innerHTML;
		this.imgsHtml = $(this.originalPngs);
		this.displayedPngs = new Array();
		this.pngs = new Array();
		this.showHideActivated = false;
		
		// record the initial PNG HTML state
		for (layer in this.imgsHtml) {
			if (this.imgsHtml[layer].tagName) {
				if ((this.imgsHtml[layer].tagName).toUpperCase() == 'IMG')
					this.pngs.push(this.imgsHtml[layer]);
			}
		}
		
		/*
			IE6 hide function loops through currently displayed layers and removes the PNG layer with the passed 
			in elementId
		*/
		this.hide = function (elementId) {
		
			if (elementId) {
				var currentlyDisplayedPngs = new Array();
				
				if (this.displayedPngs.length > 0 || this.showHideActivated)
					currentlyDisplayedPngs = this.displayedPngs;
				else currentlyDisplayedPngs = this.pngs;
				
				// flag to used to determine whether or not to use the initial load state
				this.showHideActivated = true;
					
				this.displayedPngs = new Array();
				
				for (png in currentlyDisplayedPngs) {
					if (currentlyDisplayedPngs[png].id) {
						if (currentlyDisplayedPngs[png].id != elementId)
							this.displayedPngs.push(currentlyDisplayedPngs[png]);
					}
				}
				
				// convert the  PNG array into HTML string for insertion into the DOM as a single entity
				var displayedPngsHtml = '';
				for (png in this.displayedPngs) {
					displayedPngsHtml += this.displayedPngs[png].outerHTML + '\n';
				}
				
				// update the DOM
				document.getElementById('red_button_layers_container').innerHTML = displayedPngsHtml;
			}
			else alert('[HIDE] elementId: ' + elementId + '!');
		};
		
		/*
			IE6 show function reproduces initial load-state but omits the PNG Layer with the passed-in 
			elementId, or already displayed PNG layers
		*/
		this.show = function (elementId) {
		
			if (elementId) {
				var pngsToDisplay = new Array();
				
				if (this.displayedPngs.length == 0 && !this.showHideActivated)
					this.displayedPngs = this.pngs;
				
				// flag to used to determine whether or not to use the initial load state
				this.showHideActivated = true;
			
				for (png in this.pngs) {
					if (this.pngs[png].id) {
						if (this.pngs[png].id == elementId)
							pngsToDisplay.push(this.pngs[png]);
						else if (this.arrayContains(this.pngs[png].id, this.displayedPngs))
							pngsToDisplay.push(this.pngs[png]);
					}
				}
				
				// convert the  PNG array into HTML string for insertion into the DOM as a single entity
				var displayedPngsHtml = '';
				for (png in pngsToDisplay) {
					displayedPngsHtml += pngsToDisplay[png].outerHTML + '\n';
				}
				
				// update the DOM
				document.getElementById('red_button_layers_container').innerHTML = displayedPngsHtml;
				
				// store the new state
				this.displayedPngs = pngsToDisplay;
			}
			else alert('[SHOW] elementId: ' + elementId + '!');
		};
		
		// helper function used to determine whether the element exists within the elemnt array by comparing IDs
		this.arrayContains = function(element, elementArray) {
			var elementFound = false;
			var compareLog = '';
			
			for (currentElement in elementArray) {
				compareLog += 'Comparing: ' + element + ' and ' + elementArray[currentElement].id;
			
				if (element == elementArray[currentElement].id) {
					compareLog += ': false\n';
					elementFound = true;
				}
				else compareLog += ': false\n';
			
				compareLog += '\nElement found: ' + elementFound + '\n';
			}
			
			return elementFound;
		};
		
	};
	
	// Standards-compliant browser implementation
	var StandardsPhotoshopsLayersManager = function() {
		
		// simple jQuery call to modify css display property via css class 'hidden'
		this.hide = function (elementId) {
			$('#' + elementId).addClass('hidden');
		};
		
		// simple jQuery call to modify css display property via css class 'hidden'
		this.show = function (elementId) {
			$('#' + elementId).removeClass('hidden');
		};
		
	};
	
	// factory function to return the appropriate browser implementation
	function CreatePhotoshopsLayersManager(isIE6) {
		try {
			if (isIE6 === undefined)
				isIE6 = false;
		}
		catch(r) {
			isIE6 = false;
		}
	
		var manager = new PhotoshopLayersManager();

		if (isIE6) {
			Ie6PhotoshopsLayersManager.prototype = new PhotoshopLayersManager;
			manager = new Ie6PhotoshopsLayersManager();
			try {
				DD_belatedPNG.fix('.png');
			}
			catch(r) {
				alert(r);
			}
		}
		else {
			StandardsPhotoshopsLayersManager.prototype = new PhotoshopLayersManager;
			manager = new StandardsPhotoshopsLayersManager();
		}
		
		return manager;
	}
	
	/*
		This section provides the control functionality via the photoshop layers panel. It listens
		for mouse-clicks on the 'eye' and fx_layers show/hide control images
	*/
	$(document).ready(function() {
		
		// create the appropriate layers manager
		manager = CreatePhotoshopsLayersManager(isIE6);
		
		// show or hide the clicked layer's effects 'layers'
		$('.show_hide_fx').click(function(e) {
			var fx_list = $(this).parent().find('ul.fx');
			var fx_arrow = $(this).parent().find('div.show_hide_fx img');
			
			fx_list.toggleClass('hidden');
			
			if (fx_list.hasClass('hidden'))
				fx_arrow.attr('src', 'images/png/chevron_down.png').attr('alt', '&#9660');
			else fx_arrow.attr('src', 'images/png/chevron_up.png').attr('alt', '&#9650');
			
			e.stopPropagation();
		});
		
		// show or hide the clicked layer
		$('.eye_container').click(function(e) {
			var liAncestor = $(this).parents('.layer_representation');
			var fxLi = $(this).parent().find('.fx_header');
			var layerWithNoEffects = null;
			if (fxLi.length > 0)
				layerWithNoEffects = $('#' + (fxLi.attr('id').replace('li_', '')));
			var layerWithAllEffects = $('#' + (liAncestor.attr('id').replace('li_', '')));
			var eye = $(this).find('.eye').first();
			var fxEye = fxLi.find('.eye');
			
			manager.manageLayerDisplays(liAncestor, layerWithNoEffects, layerWithAllEffects, eye, fxEye, e);
			
			e.stopPropagation();
		});
		
		// show or hide the clicked layer's effects
		$('.fx_eye_container').click(function(e) {
			var liAncestor = $(this).parents('.layer_representation');
			var fxLiAncestor = $(this).parents('.fx_layer_representation');
			var layerWithNoEffects = $('#' + (fxLiAncestor.attr('id').replace('li_', '')));
			var eye = liAncestor.find('.eye').first();
			var fxEye = $(this).find('.eye');
			var layerWithAllEffects = $('#' + (liAncestor.attr('id').replace('li_', '')));
			
			manager.manageLayerDisplays(liAncestor, layerWithNoEffects, layerWithAllEffects, eye, fxEye, e);
			
			e.stopPropagation();
		});
		
	});
	