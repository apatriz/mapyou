var map;
// Marker data is created from local "JSON" files. These are just javascript object arrays created from raw csv/xlsx files, and not true JSON
var dataGroups = [{"name":"QBP Sales Dealer","data":qbpSalesDealer,"pinColor":"FE7569"},
{"name":"Velocity Prospects Vetted","data":velocityProspects,"pinColor":"008E00"},
{"name":"Velocity Sales Dealer","data":velocitySalesDealer,"pinColor":"EBF731"},
{"name":"Velocity Sales Retail Direct","data":velocitySalesRetail,"pinColor":"3831F7"}];
var markerGroups = {};


	
function initialize_map(){
	var mapCanvas = document.getElementById('map');
	var mapOptions = {
		center: new google.maps.LatLng(39.50,-98.35),
		zoom: 4,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	}
	map = new google.maps.Map(mapCanvas,mapOptions); 

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
					if(fieldName.toLowerCase() == "latitude"){
						var latitude = fieldValue;
					}
					else if(fieldName.toLowerCase() == "longitude"){
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
			var markerInfoWindow = new google.maps.InfoWindow({
					content: markerContent
				});
			var pinColor = dataGroups[i]["pinColor"]
			var pinImage = {url:"http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + pinColor,
				size: new google.maps.Size(21,34),
				origin: new google.maps.Point(0,0),
				anchor: new google.maps.Point(10,34)
			};	
			var marker = new google.maps.Marker({
			position:{lat:latitude,lng:longitude},
			map:map,
			icon:pinImage,
			groupName:markerGroupName,
			infowindow: markerInfoWindow
			});
			marker.setVisible(false);
			google.maps.event.addListener(marker,'click',function(){
				this.infowindow.open(map,this);
			});
			markerGroup.push(marker); 
		}
		markerGroups[markerGroupName]= markerGroup
	}
	// Create the legend content
	var legend = document.getElementById('legend');
	for(g in markerGroups){
		var markerSample = markerGroups[g][0];
		console.log(markerSample)
		var groupicon = markerSample.icon.url;
		var div = document.createElement('div');
		var inputdiv = document.createElement('input');
		div.innerHTML = '<img src="' + groupicon + '"> ' + g;
		inputdiv.setAttribute("id",g);
		inputdiv.setAttribute("type","checkbox");
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
		}; 
		div.appendChild(inputdiv);
		legend.appendChild(div);
	}
	// Load the legend
	map.controls[google.maps.ControlPosition.RIGHT_TOP].push(legend);
}

// Initialize the map
google.maps.event.addDomListener(window,'load',initialize_map);

