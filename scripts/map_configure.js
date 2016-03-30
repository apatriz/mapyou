var map;

// BEGIN USER INPUT
// Each object in the 'dataGroups' list has three properties ('name','data','pinColor') which should be modified before using the map.
// The number of objects can vary (i.e. you may delete or add objects as neccessary)
// See docs for details.
var dataGroups = [
	{
		"name":"Current Customers: Sales > 2000",
		"data":current_customers_greater_than_2000_in_sales,
		"pinColor":"d9f2e6"
	},
	{
		"name":"Potential Competitors",
		"data":potential_competitors,
		"pinColor":"ccd9ff"
	},
	{
		"name":"Prospects",
		"data":prospect_list,
		"pinColor":"ffcccc"
	}
];
// END USER INPUT

var markerGroups = {};
var navBar = {};
var markerInfoWindow = new InfoBubble({
		disableAutoPan:true,
		borderWidth: 2,
		borderColor:'#444242',
		borderRadius: 10,
		shadowStyle: 1,
		closeSrc: 'images/x.png',
		padding:10,
		backgroundClassName:'infobubble',
	});
	
function initializeMap(){
	var mapCanvas = document.getElementById('map');
	var mapOptions = {
		center: new google.maps.LatLng(39.50,-98.35),
		zoom: 4,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	map = new google.maps.Map(mapCanvas,mapOptions);
	// Set map resize event trigger on window resize
	$(window).resize(function(){
		google.maps.event.trigger(map,'resize')
	});
	createMarkers();
	createLegend();
	$(function(){
		$("#heading").hide().fadeIn(1200);
		$("#legend").hide().fadeIn(1200);
	});
}

function createMarkers(){
// Loop through JSON data arrays, create marker object for each company and store in markerGroups object. Get content for each marker to use in infowindow. Create click/mouseover events for marker objects.
	for(var i=0;i < dataGroups.length;i++){
		var data = dataGroups[i]["data"];
 		var markerGroupName = dataGroups[i]["name"];
		var markerGroup = [];
		var navList = [];
		for(var c=0;c < data.length;c++){
			var company = data[c];
			var markerContent = '<div class="content">';
			for(var f in company){
				if(company.hasOwnProperty(f)){
					var fieldName = f;
					var fieldValue = company[f];
					if(fieldName.toLowerCase() === "latitude"){
						var latitude = Number(fieldValue);
					}
					else if(fieldName.toLowerCase() === "longitude"){
						var longitude = Number(fieldValue);
					}
					else{
						markerContent += '<p><strong>' + fieldName + '</strong>: '+ fieldValue + '</p>';
					}		
				}
			}
			//if no latitude, longitude info found, continue through loop
			if(!latitude || !longitude){
				continue;
			}
			markerContent += '</div>';

			var pinColor = dataGroups[i]["pinColor"]
			var pinImage = {
				url:"http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + pinColor,
				size: new google.maps.Size(21,34),
				origin: new google.maps.Point(0,0),
				anchor: new google.maps.Point(10,34)
			};	
			var marker = new google.maps.Marker({
				name:company["Company"] || company["Customer"] || company["Name"],
				position:{lat:latitude,lng:longitude},
				map:map,
				icon:pinImage,
				groupName:markerGroupName,
				color:'#' + pinColor,
			});
			marker.setVisible(false);
			//use IIFE to capture marker and markerContent variables inside closure and pass them to click event function
			(function(marker,data){
				google.maps.event.addListener(marker,'click',function(){
				markerInfoWindow.setContent(data);
				markerInfoWindow.setBackgroundColor(marker.color);
				markerInfoWindow.open(map,marker);	
				map.panTo(marker.getPosition());
				map.panBy(0,-200);//Pans map to better center view on both marker and infowindow when clicked	
			});		
			})(marker,markerContent);
			// add event listener for mouse over marker, to display preview of marker title in previewInfo div
			google.maps.event.addListener(marker,'mouseover',function(){
				$("#previewInfo").html(this.name);
				$("#previewInfo").css("background-color",this.color);
				$("#previewInfo").stop(false,true).show(150);				
			});	
			google.maps.event.addListener(marker,'mouseout',function(){
				$("#previewInfo").stop(false,true).fadeOut();	
			});
			markerGroup.push(marker);
			var navItem = '<li id="' + marker.name + '">' + marker.name + '</li>';
			if(navList.indexOf(navItem) === -1){
				navList.push(navItem);
			};	
		}
		markerGroups[markerGroupName]= markerGroup;
		navList.sort();
		navBar[markerGroupName] = navList;
	}
}

// helper function to toggle marker visibility 
function toggleMarker(marker){
	if(!marker.getVisible()){
		marker.setVisible(true);
	}else{
		marker.setVisible(false);
	}
}

function createLegend(){
	// Create the legend content
	var legend = document.getElementById("legend");
	var markerList = document.getElementById('navlist');	
	for(g in markerGroups){	
		var markerSample = markerGroups[g][0];
		var groupicon = markerSample.icon.url;
		var entryCell = document.createElement('label');
		var inputdiv = document.createElement('input');	
		$(entryCell).attr({"class":"legendEntry","for":g,});
		entryCell.innerHTML = '<img class="legendIcon" src="' + groupicon + '"> ' + '<span>' + g + '</span>';
		inputdiv.id = g;
		inputdiv.type ="checkbox";
		//set onclick event for checkbox that toggles display of each marker group		
		inputdiv.onclick = function(){
			var groupArray = markerGroups[this.id];
			for(var i=0;i < groupArray.length;i++){
				var marker = groupArray[i];
				if(!marker.focus){
					toggleMarker(marker);
				}
					
			}
		};
		entryCell.appendChild(inputdiv);
		legend.appendChild(entryCell);
	}
	// set clear button
	var clearAll = document.getElementById('clearall');
	clearAll.onclick = function(){
		for(g in markerGroups){
			// have to get id this way because jquery won't accept special characters in selector 
			var legendInput = document.getElementById(g);
			for(var i=0;i < markerGroups[g].length;i++){
				var marker = markerGroups[g][i];
				marker.setVisible(false);
				marker.focus = false;
				markerInfoWindow.close();
			}
			$(legendInput).prop('checked', false);
		}
	};
	//bind click event to legend entries to load navlist 
	$('#legend').on("click","input",function(){
		var markerGroup = $(this).attr("id");
		var itemlist = navBar[markerGroup].join('');
		if($(this).is(":checked")){
			$("#navtitle").text(markerGroup);
			$("#navlist").html(itemlist);
			$("#markernav").hide().fadeIn("slow");
			$("#clearbutton").hide().fadeToggle("slow");
		}
		else{
			$("#markernav").fadeOut("slow");
		}	
	});
	//bind click event to nav list items 
	$('#navlist').on("click","li",function(){
		var markerGroup = $('#navtitle').text();
		var legendInput = document.getElementById(markerGroup);
		var markerName = $(this).attr("id");
		for(i=0;i < markerGroups[markerGroup].length;i++){
			var marker = markerGroups[markerGroup][i];
			if(marker.name === markerName){
				google.maps.event.trigger(marker,'click');
				marker.setVisible(true);
				marker.focus = true;			
			}
		};	
	});
}
		
// Initialize the map
google.maps.event.addDomListener(window,'load',initializeMap);