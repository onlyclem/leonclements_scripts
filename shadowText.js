
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

	var shadow = {
		
		// private properties
		content : '',
		id : '',
		depth : 2,
		leftIndent : 2,
		opacity : 25,
		colour : 'black',
		shadowIdPostFix : '_shadow',
		tags : {'h1':'h1', 'h2':'h2', 'h3':'h3', 'h4':'h4', 'h5':'h5', 'p':'p', 'span':'span'},
		shadowClass : 'shadowClass',
		savedShadows : new Array(),
		//inlineStyles : {'letter-spacing', 'word-spacing', 'text-decoration', 'text-align', 'text-indent', 'line-height'},
		
		createShadow : function(element, depth, leftIndent) {
			var newText = document.createTextNode(element.innerHTML);
			var shadowText = document.createElement(element.tagName);
			shadowText.appendChild(newText);
			if (depth) {
				if (depth != '')
					shadowText.style.top = element.offsetTop + depth + 'px';
			}
			else shadowText.style.top = element.offsetTop + this.depth + 'px';
			if (leftIndent) {
				if (leftIndent != '')
					shadowText.style.left = element.offsetLeft + leftIndent + 'px';
			}
			else shadowText.style.left = element.offsetLeft + this.leftIndent + 'px';
			shadowText.style.position = 'absolute';
			return this.clearMarginPadding(shadowText);
		},
		
		setId : function(element, idName) {
			element.setAttribute('id', idName + this.shadowIdPostFix);
		},
		
		setOpacity : function(element, opacity) {
			if (opacity) {
				if (opacity != '' && parseFloat(opacity)) {
					element.style.opacity = (opacity / 100);
					element.style.MozOpacity = (opacity / 100);
					element.style.KhtmlOpacity = (opacity / 100);
					element.style.filter = "alpha(opacity = " + opacity + ")";
				}
			}
			else {
				element.style.opacity = (this.opacity / 100);
				element.style.MozOpacity = (this.opacity / 100);
				element.style.KhtmlOpacity = (this.opacity / 100);
				element.style.filter = "alpha(opacity = " + this.opacity + ")";
			}
		},
	
		setFontStyle : function(element, newElement, colour) {
			var size, align;
			if (element.currentStyle) // Internet Explorer
			{
				size = element.currentStyle['fontSize'];
				align = element.currentStyle['textAlign'];
			}
			else if (window.getComputedStyle) // Normal browsers
			{
				size = document.defaultView.getComputedStyle(element,null).getPropertyValue('font-size');
				align = document.defaultView.getComputedStyle(element,null).getPropertyValue('text-align');
			}
			if (size)
				newElement.style.fontSize = size;
			if (align)
				newElement.style.textAlign = align;
			if (colour) {
				if (colour != '')
					newElement.style.color = colour;
			}
			else newElement.style.color = this.colour;
		},
		
		setZIndex : function(element, newElement) {
			if (element.currentStyle) // Internet Explorer
				var z = element.currentStyle['zIndex'];
			else if (window.getComputedStyle) // Normal browsers
				var z = document.defaultView.getComputedStyle(element,null).getPropertyValue('z-index');
			if (z == 'auto' || z <= '0')
				element.style.zIndex = 1;
			newElement.style.zIndex = element.style.zIndex - 1;
		},
		
		putShadow : function(id, maintainWidth, depth, leftIndent, colour, opacity) {
			var element = document.getElementById(id);
			if (!element) {
				alert('Unable to resolve element from ID \'' + id + '\'');
				return;
			}
			var tagName = (element.tagName).toLowerCase();
			if (!this.tags[tagName]) {
				alert('Selected node type \'' + tagName + '\' not supported for shadowing');
				return;
			}
			if (document.getElementById(id + this.shadowIdPostFix)) {
				/*alert('Shadow element for id:' + id + ' already exists');*/
				return;
			}
			
			if (element.style.position.length == 0)
				element.style.position = 'relative';
			
			var shadowText = this.createShadow(element, depth, leftIndent);
			
			if (maintainWidth === true)
				shadowText.style.width = element.offsetWidth + 'px';
			
			this.setId(shadowText, id);
			this.setOpacity(shadowText, opacity);
			this.setFontStyle(element, shadowText, colour);
			this.setZIndex(element, shadowText);
			this.insertAfter(element.parentNode, shadowText, element);
			
			this.saveShadow(id + this.shadowIdPostFix, depth, leftIndent, colour, opacity, maintainWidth);
		},
		
		removeShadow : function(id) {
			var element = document.getElementById(id);
			if (element)
				element.parentNode.removeChild(element);
		},
		
		getExistingShadowTexts : function(shadowTexts) {
			var regX = new RegExp(this.shadowIdPostFix,'g');
			var elements = document.getElementsByTagName('*'), i = 0, j = 0, element;
			while (element = elements[i++]) {
				if (element.id.match(regX)) {
					shadowTexts[j] = element.id;
					j++;
				}
			}
		},
		
		redrawShadows : function() {
			var shadowTextId = '';
			for (save in this.savedShadows) {
				shadowTextId = this.savedShadows[save].id;
				this.removeShadow(shadowTextId);
				this.putShadow(
					shadowTextId.substring(0, this.savedShadows[save].id.length - this.shadowIdPostFix.length),
					this.savedShadows[save].maintainWidth,
					this.savedShadows[save].depth,
					this.savedShadows[save].leftIndent,
					this.savedShadows[save].colour,
					this.savedShadows[save].opacity
				);
			}
		},
		
		getTextsForShadowing : function() {
			var shadowElements = new Array(), tagArray = new Array(), elements = new Array();
			for (var i = 0; i < this.tags.length; i++) {
				tagArray = document.getElementsByTagName(this.tags[i]);
				for (var j = 0; j < tagArray.length; j++) {
					elements.push(tagArray[j]);
				}
			}
			var pattern = new RegExp('(^|\\\\s)' + this.shadowClass + '(\\\\s|$)');
			for (var k = 0; k < elements.length; k++) {
				if (pattern.test(elements[k].className)) {
					shadowElements.push(elements[k]);
				}
			}
			return shadowElements;
		},
		
		saveShadow : function(id, depth, leftIndent, colour, opacity, maintainWidth) {
			if (!this.savedShadows[id]) {
				this.savedShadows[id] = {
					'id' : id,
					'maintainWidth' : maintainWidth,
					'depth' : depth,
					'leftIndent' : leftIndent,
					'colour' : colour,
					'opacity' : opacity
				};
			}
		},
		
		insertAfter : function(parent, node, referenceNode) {
			parent.insertBefore(node, referenceNode.nextSibling);
		},
		
		clearMarginPadding : function(element) {
			element.style.margin = 0;
			element.style.padding = 0;
			element.style.border = 0;
			return element;
		}
	};
	
	window.onload = function() {
		shadow.redrawShadows();
	};
	
	window.onresize = function() {
		shadow.redrawShadows();
	};