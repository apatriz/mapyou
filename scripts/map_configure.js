var map;
// Marker data is created from local "JSON" files. These are just javascript object arrays created from raw csv/xlsx files, and not true JSON
var dataGroups = [{"name":"Potential Customers","data":velocityProspects,"pinColor":"008E00"},
{"name":"Velocity QBP Sales","data":qbpSalesDealer,"pinColor":"FE7569"},
{"name":"Velocity Dealer Sales","data":velocitySalesDealer,"pinColor":"EBF731"},
{"name":"Velocity Retail Direct Sales","data":velocitySalesRetail,"pinColor":"3831F7"}];
var markerGroups = {};
var markerInfoWindow = new google.maps.InfoWindow({
		disableAutoPan:true
	});
function moveMap(){
	map.panBy(0,-200);
}	
function initializeMap(){
	var mapCanvas = document.getElementById('map');
	var mapOptions = {
		center: new google.maps.LatLng(39.50,-98.35),
		zoom: 4,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	}
	map = new google.maps.Map(mapCanvas,mapOptions);
	$(window).resize(function(){
		google.maps.event.trigger(map,'resize')
	});
	createMarkers();
	createLegend();
}

function createMarkers(){
// Loop through JSON data arrays to initialize markers and attach infowindows displaying the attributes of each company
	for(var i=0;i < dataGroups.length;i++){
		var data = dataGroups[i]["data"];
 		var markerGroupName = dataGroups[i]["name"];
		var markerGroup = [];	
		for(var c=0;c < data.length;c++){
			var company = data[c];
			var markerContent = '<div class="content">';
			for(var f in company){
				if(company.hasOwnProperty(f)){
					var fieldName = f;
					var fieldValue = company[f];
					if(fieldName.toLowerCase() === "latitude"){
						var latitude = fieldValue;
					}
					else if(fieldName.toLowerCase() === "longitude"){
						var longitude = fieldValue;
					}
					markerContent += '<p><b>' + fieldName + '</b>: '+ fieldValue + '</p>';	
				}
			}
			//if no latitude, longitude info found, continue through loop
			if(!latitude || !longitude){
				continue;
			}
			markerContent += '</div>';

			var pinColor = dataGroups[i]["pinColor"]
			var pinImage = {url:"http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + pinColor,
				size: new google.maps.Size(21,34),
				origin: new google.maps.Point(0,0),
				anchor: new google.maps.Point(10,34)
			};	
			var marker = new google.maps.Marker({
			title:company["Company"] || company["Customer"] || company["Name"],
			position:{lat:latitude,lng:longitude},
			map:map,
			icon:pinImage,
			groupName:markerGroupName,
			content:markerContent,
			});
			marker.setVisible(false);
			google.maps.event.addListener(marker,'click',function(){
				markerInfoWindow.setContent(this.content);
				markerInfoWindow.open(map,this);
				map.panTo(this.getPosition());
				moveMap();
			});
			google.maps.event.addListener(marker,'mouseover',function(){
				$("#previewInfo").html(this.title);
				$("#previewInfo").show();
			});	
			google.maps.event.addListener(marker,'mouseout',function(){
				$("#previewInfo").hide();
			});
			markerGroup.push(marker); 
		}
		markerGroups[markerGroupName]= markerGroup
	}	
}

function createLegend(){
	// Create the legend content
	var legend = document.getElementById('legend');
	for(g in markerGroups){
		var markerSample = markerGroups[g][0];
		var groupicon = markerSample.icon.url;
		var div = document.createElement('div');
		var inputdiv = document.createElement('input');
		div.setAttribute("class","legendEntry");
		div.innerHTML = '<img class="legendIcon" src="' + groupicon + '"> ' + g;	
		inputdiv.id = g;
		inputdiv.type ="checkbox";		
		//set onclick event for checkbox that toggles display of each marker group
		inputdiv.onclick = function(){
			var groupId = this.id;
			var groupArray = markerGroups[groupId];
			for(var i=0;i < groupArray.length;i++){
				var marker = groupArray[i];
				if(!marker.getVisible()){
					marker.setVisible(true);
				}else{
					marker.setVisible(false);
				}
			}
			for(i=0;i < dataGroups.length;i++){
				if(dataGroups[i]["name"] === groupId){	
					if(this.checked){
						this.style.background= "#" + dataGroups[i]["pinColor"];
					}else{
						this.style.background = "white";
					}
				}
			}	
		}; 
		div.appendChild(inputdiv);
		legend.appendChild(div);
	}
	// Set the position of the legend inside the map 
	map.controls[google.maps.ControlPosition.RIGHT_TOP].push(legend);
}
		
// Initialize the map
google.maps.event.addDomListener(window,'load',initializeMap);