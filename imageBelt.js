
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
	
	var imageBelt = {
		
		runOnPageLoad : true,
		// assume the beholder is 512px away at the centre of the front face of the front photo, looking directly at it.
		beholderDistance : 512,
		//images : 'images/lc.gif,images/arrow.gif,images/rvp.jpg,images/stripes.gif,images/monkey.jpg'.split(','),
		//images : 'images/nature/budding.jpg,images/nature/field_grass.jpg,images/nature/grass_dew.jpg,images/nature/leaves_and_sky.jpg,images/nature/sycamore.jpg,images/nature/tree_leaves.jpg'.split(','),
		images : 'images/free_nature/1.jpg,images/free_nature/2.jpg,images/free_nature/3.jpg,images/free_nature/4.jpg,images/free_nature/5.jpg'.split(','),
		//images : 'images/work/um.jpg,images/work/360sa.jpg,images/work/arena.jpg,images/work/zentive.jpg,images/work/360p.jpg'.split(','),
		//images : 'images/abstract/1.jpg,images/abstract/2.jpg,images/abstract/3.jpg,images/abstract/4.jpg,images/abstract/5.jpg,images/abstract/6.jpg,images/abstract/7.jpg,images/abstract/8.jpg,images/abstract/9.jpg,images/abstract/10.jpg'.split(','),
		sliceMap : new Array(),
		containerIds : new Array(),
		sliceIds : new Array(),
		numSlices : 32,
		slideSpeed : 1500,
		blankCanvasHtml : null,
		widthBuffer : 10,
		angle : 50,
		
		sliceCalculations : {
			heightOfFrontPhoto : 0,
			widthOfFrontPhoto : 0,
			actualWidthOfRearPhoto : 0,
			actualSlantedWidth : 0,
			depthOfRearPhoto : 0,
			angleFromStraightAheadToSlantedPhotoRightEdge : 0,
			halfWidthOfFrontPhotoPlusVisibleWidth : 0,
			visibleWidthOfSlantedPhoto : 0,
			visibleWidthOfSlantedPhotoAfterBrowserRounding : 0,
			angleFromStraightAheadToRearPhotoRightEdge : 0,
			totalVisibleWidth : 0,
			visibleWidthOfRearPhoto : 0,
			visibleWidthOfRearPhotoAfterBrowserRounding : 0,
			visibleHeightOfRearPhoto : 0,
			differenceBetweenFrontPhotoTopAndRearPhotoTop : 0,
			angleOfSlantedPhotoTopEdgeDescent : 0,
			divSliceWidth : 0,
			imaginedHeightOfNegativeFrontPhoto : 0,
			imaginedWidthOfNegativeFrontPhoto : 0
		},
		
		getImageNumber : function(imageUrl) {
			var imageNumber = 0;
			for (image in this.images) {
				if (this.images[image] == imageUrl)
					imageNumber = image;
			}
			return parseInt(imageNumber);
		},
		
		getNextImage : function(thisImage) {
			var nextImage = 0;
			if (thisImage < (this.images.length - 1))
				nextImage = thisImage + 1;
				
			return nextImage;
		},
		
		updateRow : function(id1, id2) {
			var photo1 = document.getElementById(id1);
			var photo2 = document.getElementById(id2);
			var parent = photo1.parentNode;
			parent.removeChild(photo1);
			this.insertAfter(parent, photo1, photo2);
			photo1.id = id2;
			photo2.id = id1;
			photo1.style.left = '0px';
			photo2.style.left = '0px';
		},
		
		degToRad : function(angle) {
			return ((angle*Math.PI) / 180);
		},

		radToDeg : function(angle) {
			return ((angle*180) / Math.PI);
		},
		
		insertAfter : function(parent, node, referenceNode) {
			parent.insertBefore(node, referenceNode.nextSibling);
		},
		
		createElement : function(type, parent, attributes) {
			var element = document.createElement(type);
			
			if (element) {
				parent.appendChild(element);
				
				for (attribute in attributes) {
					element.setAttribute(attribute, attributes[attribute]);
				}
				
				return element;
			}
		},
		
		createCanvasInnerContainers : function() {
			if (!document.getElementById('front_photo')) {
				var frontPhoto = this.createElement('div', document.getElementById('canvas'), {'id':'front_photo'});
				var frontPhotoInner = this.createElement('div', frontPhoto, {'id':'front_photo_inner'});
				var temp = this.createElement('img', frontPhotoInner, {'id':'front_photo_img', 'class':'front', 'className':'front', 'height':'372px', 'width':'512px'});
				temp.style.position = 'relative';
				temp = this.createElement('img', frontPhotoInner, {'id':'front_photo_next_img', 'class':'front', 'className':'front', 'height':'372px', 'width':'512px'});
				temp.style.position = 'relative';
			}
					
			if (!document.getElementById('slanted_photo'))
				this.createElement('div', this.createElement('div', document.getElementById('canvas'), {'id':'slanted_photo'}), {'id':'slanted_photo_inner'});
			else document.getElementById('slanted_photo_inner').innerHTML = '';
				
			if (!document.getElementById('back_photo')) {
				var backPhoto = this.createElement('div', document.getElementById('canvas'), {'id':'back_photo'});
				var backPhotoInner = this.createElement('div', backPhoto, {'id':'back_photo_inner'});
				temp = this.createElement('img', backPhotoInner, {'id':'back_photo_img', 'class':'back', 'className':'back'});
				temp.style.position = 'relative';
				temp = this.createElement('img', backPhotoInner, {'id':'back_photo_next_img', 'class':'back', 'className':'back'});
				temp.style.position = 'relative';
			}
		},
		
		populateSliceCalculations : function(heightOfFrontPhoto, widthOfFrontPhoto, xzAngle, numberOfSlices) {
			this.sliceCalculations.heightOfFrontPhoto = heightOfFrontPhoto;
			this.sliceCalculations.widthOfFrontPhoto = widthOfFrontPhoto;
			this.sliceCalculations.actualWidthOfRearPhoto = widthOfFrontPhoto;
			this.sliceCalculations.actualSlantedWidth = Math.cos(this.degToRad(xzAngle)) * widthOfFrontPhoto;
			this.sliceCalculations.depthOfRearPhoto = Math.sin(this.degToRad(xzAngle)) * widthOfFrontPhoto;
			this.sliceCalculations.angleFromStraightAheadToSlantedPhotoRightEdge = this.radToDeg(Math.atan(((widthOfFrontPhoto / 2) + this.sliceCalculations.actualSlantedWidth) / (this.beholderDistance + this.sliceCalculations.depthOfRearPhoto)));
			this.sliceCalculations.halfWidthOfFrontPhotoPlusVisibleWidth = Math.tan(this.degToRad(this.sliceCalculations.angleFromStraightAheadToSlantedPhotoRightEdge)) * this.beholderDistance;
			this.sliceCalculations.visibleWidthOfSlantedPhoto = parseFloat(this.sliceCalculations.halfWidthOfFrontPhotoPlusVisibleWidth - (widthOfFrontPhoto / 2));
			this.sliceCalculations.angleFromStraightAheadToRearPhotoRightEdge = this.radToDeg(Math.atan(((widthOfFrontPhoto / 2) + this.sliceCalculations.actualSlantedWidth + this.sliceCalculations.actualWidthOfRearPhoto) / (this.beholderDistance + this.sliceCalculations.depthOfRearPhoto)));
			this.sliceCalculations.totalVisibleWidth = Math.tan(this.degToRad(this.sliceCalculations.angleFromStraightAheadToRearPhotoRightEdge)) * this.beholderDistance;
			this.sliceCalculations.visibleWidthOfRearPhoto = this.sliceCalculations.totalVisibleWidth - ((widthOfFrontPhoto / 2) + this.sliceCalculations.visibleWidthOfSlantedPhoto);
			this.sliceCalculations.visibleHeightOfRearPhoto = (this.sliceCalculations.visibleWidthOfRearPhoto / widthOfFrontPhoto) * heightOfFrontPhoto;
			this.sliceCalculations.differenceBetweenFrontPhotoTopAndRearPhotoTop = (heightOfFrontPhoto - this.sliceCalculations.visibleHeightOfRearPhoto) / 2;
			this.sliceCalculations.angleOfSlantedPhotoTopEdgeDescent = this.radToDeg(Math.atan(this.sliceCalculations.differenceBetweenFrontPhotoTopAndRearPhotoTop / this.sliceCalculations.visibleWidthOfSlantedPhoto));
			this.sliceCalculations.divSliceWidth = this.sliceCalculations.visibleWidthOfSlantedPhoto / numberOfSlices;
			if (this.sliceCalculations.divSliceWidth < 1) {
				this.sliceCalculations.divSliceWidth = 1;
				this.sliceCalculations.visibleWidthOfSlantedPhoto = parseFloat(numberOfSlices);
			}
			this.sliceCalculations.imaginedHeightOfNegativeFrontPhoto = heightOfFrontPhoto + (2 * ((Math.tan(this.degToRad(this.sliceCalculations.angleOfSlantedPhotoTopEdgeDescent))) * this.sliceCalculations.visibleWidthOfSlantedPhoto));
			this.sliceCalculations.imaginedWidthOfNegativeFrontPhoto = (this.sliceCalculations.imaginedHeightOfNegativeFrontPhoto / heightOfFrontPhoto) * widthOfFrontPhoto;
		},
			
		setOpacity : function(element, opacity) {
			element.style.opacity = ( opacity / 100 );
			element.style.MozOpacity = ( opacity / 100 );
			element.style.KhtmlOpacity = ( opacity / 100 );
			element.style.filter = 'alpha(opacity=' + opacity + ')';
		},
		
		createFadeBoundary : function(parent, width, numberOfSlices, direction, colour) {
			if (parent) {
				var opacity = 0;
				if (direction > 0) {
					direction = 'left';
					opacity = 100;
				}
				else direction = 'right';
				
				if (parent) {
					for (var i = 0; i < numberOfSlices; ++i) {
						var fadeSlice = this.createElement('div', parent, {'id': 'fade_slice_' + i, 'class':'fade_in_slice', 'className':'fade_in_slice'});
						fadeSlice.style.width = (width / numberOfSlices) + 'px';
						if (fadeSlice.style.cssFloat)
							fadeSlice.style.cssFloat = direction;
						else if (fadeSlice.style.styleFloat)
							fadeSlice.style.styleFloat = direction;
						fadeSlice.style.backgroundColor = colour;
						
						if (i > 0) {
							if (direction == 'right')
								opacity = opacity + (100 / numberOfSlices);
							else {
								opacity = opacity - (100 / numberOfSlices);
							}
						}
						
						this.setOpacity(fadeSlice, opacity);
					}
				}
			}
		},
		
		insertSlice : function(sliceNumber, top, height, width, imageLeft, originalHeight, originalWidth, imageUrl, group, createInDOM) {
			if (createInDOM) {
				var container = this.createElement(
					'div',
					document.getElementById('group_' + group),
					{
						'id':group + '_' + sliceNumber,
						'class':'container', 'className':'container'
					}
				);
				container.style.top = Math.round(top) + 'px';
				container.style.height = Math.round(height) + 'px';
				container.style.width = Math.round(width) + 'px';
				this.containerIds.push(group + '_' + sliceNumber);
				var image = this.createElement(
					'img',
					container,
					{
						'id':'slice_' + group + '_' + sliceNumber,
						'src':imageUrl,
						'class':'stripes', 'className':'stripes',
						'height':Math.round(height),
						'width':Math.round(((height / originalHeight) * originalWidth))
					}
				);
				image.style.left = Math.round(imageLeft) + 'px';
				this.sliceIds.push('slice_' + group + '_' + sliceNumber);
			}
			
			this.sliceMap[group + '_' + sliceNumber] = {'top':top, 'height':height, 'width':width, 'imageLeft':imageLeft, 'originalWidth':originalWidth, 'originalHeight':originalHeight};
		},
		
		createSlices : function(numberOfSlices, divSliceWidth, divSliceTop, heightOfFrontPhoto, widthOfFrontPhoto, imageUrl, group, createInDOM, differenceBetweenFrontPhotoTopAndRearPhotoTop) {
			var divSliceLeft = 0, prevDivSliceHeight = 0, divSliceHeight = 0;
			for (var i = 0; i < numberOfSlices; i++) {
				divSliceHeight = heightOfFrontPhoto - (divSliceTop * 2);
				prevDivSliceHeight = divSliceHeight;
				divSliceTop = divSliceTop + (differenceBetweenFrontPhotoTopAndRearPhotoTop / numberOfSlices);
				var imageWidth = (divSliceHeight / heightOfFrontPhoto) * widthOfFrontPhoto;
				if (prevDivSliceHeight > 0)
					divSliceLeft = (i/numberOfSlices) * imageWidth;
				this.insertSlice(i, divSliceTop, divSliceHeight, divSliceWidth, divSliceLeft*-1, heightOfFrontPhoto, widthOfFrontPhoto, imageUrl, group, createInDOM);
			}
		},
		
		createGroupOne : function(numberOfSlices, divSliceWidth, divSliceTop, heightOfFrontPhoto, widthOfFrontPhoto, imageUrl) {
			document.getElementById('slanted_photo_inner').innerHTML = '<div id="group_' + 1 + '" class="group" className="group"></div>';
			this.createSlices(numberOfSlices, divSliceWidth, divSliceTop, heightOfFrontPhoto, widthOfFrontPhoto, imageUrl, 1, true, this.sliceCalculations.differenceBetweenFrontPhotoTopAndRearPhotoTop);
		},
		
		createGroupTwo : function(numberOfSlices, divSliceWidth, divSliceTop, heightOfFrontPhoto, widthOfFrontPhoto, imageUrl) {
			var groupTwo = document.createElement('div');
			this.insertAfter(document.getElementById('slanted_photo_inner'), groupTwo, document.getElementById('group_1'));
			var gtAttributes = {'id':'group_2', 'class':'group', 'className':'group'};
			for (attribute in gtAttributes)
				groupTwo.setAttribute(attribute, gtAttributes[attribute]);
			this.createSlices(numberOfSlices, divSliceWidth, divSliceTop, heightOfFrontPhoto, widthOfFrontPhoto, imageUrl, 2, true, this.sliceCalculations.differenceBetweenFrontPhotoTopAndRearPhotoTop);
		},
		
		createGroupZero : function(numberOfSlices, divSliceWidth, divSliceTop, heightOfFrontPhoto, widthOfFrontPhoto, imageUrl) {
			var groupZero = document.createElement('div');
			document.getElementById('slanted_photo_inner').insertBefore(groupZero, document.getElementById('group_1'));
			var gzAttributes = {'id':'group_0', 'class':'group', 'style':'top: 0px'};
			for (attribute in gzAttributes)
				groupZero.setAttribute(attribute, gzAttributes[attribute]);
			this.createSlices(numberOfSlices, divSliceWidth, divSliceTop, heightOfFrontPhoto, widthOfFrontPhoto, imageUrl, 0, false, this.sliceCalculations.differenceBetweenFrontPhotoTopAndRearPhotoTop);
		},
		
		sliceAndShrink : function(heightOfFrontPhoto, widthOfFrontPhoto, xzAngle, numberOfSlices, imageUrl) {
			this.populateSliceCalculations(heightOfFrontPhoto, widthOfFrontPhoto, xzAngle, numberOfSlices);
			this.createGroupOne(numberOfSlices, this.sliceCalculations.divSliceWidth, 0, heightOfFrontPhoto, widthOfFrontPhoto, imageUrl);
			this.createGroupTwo(numberOfSlices, this.sliceCalculations.divSliceWidth, this.sliceMap['1_' + (numberOfSlices - 1)].top, heightOfFrontPhoto, widthOfFrontPhoto, this.images[this.getNextImage(this.getImageNumber(imageUrl))]);
			this.createGroupZero(numberOfSlices, this.sliceCalculations.divSliceWidth, 0, this.sliceCalculations.imaginedHeightOfNegativeFrontPhoto, this.sliceCalculations.imaginedWidthOfNegativeFrontPhoto, this.images[this.getNextImage(this.getImageNumber(imageUrl))]);
		},
		
		setUpBackRow : function(top, height) {
			var frontPhoto = document.getElementById('front_photo');
			var rearPhotoContainer = document.getElementById('back_photo');
			rearPhotoContainer.style.height = top + height + 'px';
			this.sliceCalculations.visibleWidthOfRearPhotoAfterBrowserRounding = ((height / frontPhoto.offsetHeight) * frontPhoto.offsetWidth);
			rearPhotoContainer.style.width = this.sliceCalculations.visibleWidthOfRearPhotoAfterBrowserRounding + 'px';
			var rearPhoto = document.getElementById('back_photo_img');
			rearPhoto.style.top = top + 'px';
			rearPhoto.style.height = height + 'px';
			var rearPhotoNext = document.getElementById('back_photo_next_img');
			rearPhotoNext.style.top = top + 'px';
			rearPhotoNext.style.height = height + 'px';
		},
		
		setUp : function(firstImage) {
			this.createCanvasInnerContainers();
			var sliceMapLength = 0;
			var frontPhoto = null;
			var angle = this.angle;
			var imageTracker = firstImage;
			
			if (document.getElementById('front_photo'))
				frontPhoto = document.getElementById('front_photo');
			else alert('No element with id \'front_photo\' found');
			
			document.getElementById('front_photo_img').src = this.images[firstImage];
			imageTracker = this.getNextImage(firstImage);
			document.getElementById('front_photo_next_img').src = this.images[imageTracker];
			
			this.sliceAndShrink(
				frontPhoto.offsetHeight,
				frontPhoto.offsetWidth,
				angle,
				this.numSlices,
				this.images[imageTracker]
			);
			
			this.sliceCalculations.visibleWidthOfSlantedPhotoAfterBrowserRounding = document.getElementById('group_1').offsetWidth;
			document.getElementById('slanted_photo').style.width = this.sliceCalculations.visibleWidthOfSlantedPhotoAfterBrowserRounding + 'px';
			
			this.setUpBackRow(this.sliceMap['1_' + (this.numSlices - 1)].top, this.sliceMap['1_' + (this.numSlices - 1)].height);
			
			imageTracker = this.getNextImage(imageTracker);
			document.getElementById('back_photo_img').src = this.images[imageTracker];
			imageTracker = this.getNextImage(imageTracker);
			document.getElementById('back_photo_next_img').src = this.images[imageTracker];
		},

		update : function(front) {
			this.sliceMap = new Array();
			this.setUp(front);
			document.getElementById('slanted_photo').style.height = document.getElementById('front_photo').offsetHeight + 'px';
			var canvasWidth = (this.sliceCalculations.widthOfFrontPhoto + this.sliceCalculations.visibleWidthOfSlantedPhotoAfterBrowserRounding + this.sliceCalculations.visibleWidthOfRearPhotoAfterBrowserRounding) + 'px';
			/*alert(
				'this.sliceCalculations.widthOfFrontPhoto = ' + this.sliceCalculations.widthOfFrontPhoto + '\n' +
				'this.sliceCalculations.visibleWidthOfSlantedPhoto = ' + this.sliceCalculations.visibleWidthOfSlantedPhoto + '\n' +
				'this.sliceCalculations.visibleWidthOfRearPhoto = ' + this.sliceCalculations.visibleWidthOfRearPhoto + '\n' +
				'this.widthBuffer = ' + this.widthBuffer + '\n' +
				'canvasWidth set to: ' + canvasWidth
			);*/
			document.getElementById('canvas').style.width = canvasWidth;
		},
		
		cacheSlices : function() {
			jqContainerElements = new Array();
			for (var i = 0; i < this.containerIds.length; ++i) {
				jqContainerElements.push($('#' + this.containerIds[i]));
			}
		},
		
		slideBelt : function() {
			//console.profile('Measuring SLIDEBELT');
			
			var oldGroup2 = $('#group_2').clone();
			
			for (var i = 0; i < this.sliceIds.length; ++i) {
				var sliceMapRef = (parseInt(this.sliceIds[i].split('_')[1]) - 1) + '_' + this.sliceIds[i].split('_')[2];
				$('#' + this.sliceIds[i]).animate({
					height: Math.round(imageBelt.sliceMap[sliceMapRef].height)
				}, imageBelt.slideSpeed, 'linear');
			}
			
			for (var i = 0; i < this.containerIds.length; ++i) {
				var sliceMapRefHeight = (parseInt(this.containerIds[i].split('_')[0]) - 1) + '_' + this.containerIds[i].split('_')[1];
				var sliceMapRefTop = (parseInt(this.containerIds[i].split('_')[0]) - 1) + '_' + ((this.numSlices - 1) - parseInt(this.containerIds[i].split('_')[1]));
				$('#' + this.containerIds[i]).animate({
					height: Math.round(imageBelt.sliceMap[sliceMapRefHeight].height),
					top: 0 - Math.round(imageBelt.sliceMap[sliceMapRefTop].top)
				}, imageBelt.slideSpeed, 'linear');
			}
			
			$('img.front').each(function(){
				$(this).animate({
					left: ($(this).width()) * -1
				}, imageBelt.slideSpeed, 'linear');
			});
			
			$('img.back').each(function(){
				$(this).animate({
					left: ($(this).width()) * -1
				}, imageBelt.slideSpeed, 'linear');
			});
			
			$('#group_1').animate({
				left: (document.getElementById('slanted_photo').offsetWidth) * -1
			}, imageBelt.slideSpeed, 'linear');
			
			$('#group_2').animate({
				left: (document.getElementById('slanted_photo').offsetWidth) * -1,
				top: Math.round(imageBelt.sliceMap['2_0'].top)
			}, imageBelt.slideSpeed, 'linear', function() {
				imageBelt.rebuild(oldGroup2);
			});
			
			//console.profileEnd();
			
			return false;
		},
		
		reset : function() {
			var frontImageNum = this.getImageNumber($('#front_photo_img').attr('src'));
			this.sliceMap = new Array();
			this.containerIds = new Array();
			this.sliceIds = new Array();
			
			if (imageBelt.blankCanvasHtml)
				$('#canvas').html(imageBelt.blankCanvasHtml);
			
			this.update(frontImageNum);
		},
		
		rebuild : function(oldGroup2) {
			//console.profile('Measuring REBUILD');
			var next = this.getNextImage(this.getImageNumber($('#front_photo_next_img').attr('src')));
			this.updateRow('front_photo_img', 'front_photo_next_img');
			$('#front_photo_next_img').attr('src', imageBelt.images[next]);
			
			$('#group_1').remove();
			
			$('#group_2').removeAttr('style').attr('id', 'group_1');
			$('.container', '#group_1').each(function() {
				$(this).attr('id', '1_' + $(this).attr('id').split('_')[1]);
			});
			$('.container', '#group_1').each(function() {
				$(this).css('top', Math.round(imageBelt.sliceMap[this.id].top));
				$(this).css('height', Math.round(imageBelt.sliceMap[this.id].height));
			});
			$('.stripes', '#group_1').each(function() {
				$(this).attr('id', 'slice_1_' + $(this).attr('id').split('_')[2]);
			});
			
			oldGroup2.appendTo('#slanted_photo_inner');
			next = imageBelt.getNextImage(next);
			
			$('.stripes', '#group_2').each(function() {
				$(this).attr('src', imageBelt.images[next]);
			});
			
			next = imageBelt.getNextImage(next);
			imageBelt.updateRow('back_photo_img', 'back_photo_next_img');
			$('#back_photo_next_img').attr('src', imageBelt.images[next]);
			//console.profileEnd();
		},
		
		createImageGallery : function(containerId, photoHeight, photoWidth, xzAngle, numberOfSlices) {
			var slantedImages = new Array();
			
			imageBelt.populateSliceCalculations(photoHeight, photoWidth, xzAngle, numberOfSlices);
			
			for (var i = 0; i < this.images.length; ++i) {
				this.createGroupOne(72, this.sliceCalculations.divSliceWidth, 0, this.sliceCalculations.heightOfFrontPhoto, this.sliceCalculations.widthOfFrontPhoto, this.images[i]);
				slantedImages.push($('#group_1').clone());
			}
			for (slantedImage in slantedImages) {
				$('#' + containerId).append('<div class="slanted_image_container" style="left:' + (parseInt(slantedImage) * 180) + 'px">' + (slantedImages[slantedImage]).html() + '</div>');
			}
			
			$('#group_1').remove();
			$('#' + containerId).height(photoHeight);
		}
		
	};
	
	$(document).ready(function() {
		if ($('#canvas').length > 0 && imageBelt.runOnPageLoad) {
			imageBelt.reset();
			imageBelt.createFadeBoundary(document.getElementById('fade_in_left'), 100, 50, 1, '#FFFFFF');
			imageBelt.createFadeBoundary(document.getElementById('fade_in_right'), 100, 50, -1, '#FFFFFF');
			imageBelt.blankCanvasHtml = document.getElementById('canvas').innerHTML;
		}
	});