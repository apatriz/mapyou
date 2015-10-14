function initialize(){
	var mapCanvas = document.getElementById('map');
	var mapOptions = {
		center: new google.maps.LatLng(39.50,-98.35),
		zoom: 4,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	}
	var map = new google.maps.Map(mapCanvas,mapOptions); 
	// Company data is hard coded into the script as JSON created from .xlsx.
	var markersGroup1 = [];
	var markersGroup2 = [];
	var markersGroup3 = [];
	var markersGroup4 = [];
	var dataGroups = [qbpSalesDealer,velocityProspects,velocitySalesDealer,velocitySalesRetail];
	// Loop through JSON to initialize markers and attach infowindows displaying the attributes of each company
	for(var i=0;i < dataGroups.length;i++){
		var group = dataGroups[i];
		for(var c=0;c < group.length;c++){
			var company = group[c];
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
			if(!latitude || !longitude){
				continue;
			}
			var latlong = {lat:latitude,lng:longitude}
			markerContent += '</div>';
			var markerInfoWindow = new google.maps.InfoWindow({
					content: markerContent
				});
			if(i==0){
				var groupType = "QBP Sales Dealer"
				var pinColor = "FE7569"
			}
			else if(i==1){
				var groupType = "Velocity Prospects Vetted"
				var pinColor = "008E00"
			}
			else if(i==2){
				var groupType = "Velocity Sales Dealer"
				var pinColor = "EBF731"
			}
			else{
				var groupType = "Velocity Sales Retail Direct"
				var pinColor = "3831F7"
			}
			var pinImage = {url:"http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + pinColor,
				size: new google.maps.Size(21,34),
				origin: new google.maps.Point(0,0),
				anchor: new google.maps.Point(10,34)
			};	
			var marker = new google.maps.Marker({
			position:latlong,
			map:map,
			icon:pinImage,
			group:groupType,
			infowindow: markerInfoWindow
			});
			google.maps.event.addListener(marker,'click',function(){
				this.infowindow.open(map,this);
			});
			if(i == 0){
				markersGroup1.push(marker);
			}
			else if(i == 1){
				markersGroup2.push(marker);
			}
			else if(i == 2){
				markersGroup3.push(marker);
			}
			else{
				markersGroup4.push(marker);
			}		
		}
	}
	// Create the legend content
	var legend = document.getElementById('legend');
	var markerGroups = [markersGroup1,markersGroup2,markersGroup3,markersGroup4];
	for(var g = 0;g < markerGroups.length;g++){
		var markerSample = markerGroups[g][0];
		var groupname = markerSample.group;
		var groupicon = markerSample.icon.url;
		console.log(groupicon);
		var div = document.createElement('div');
		div.setAttribute("id",groupname);
		div.innerHTML = '<img src="' + groupicon + '"> ' + groupname;
		legend.appendChild(div);		
	}
	// Load the legend
	map.controls[google.maps.ControlPosition.RIGHT_TOP].push(legend);
}
// Initialize the map
google.maps.event.addDomListener(window,'load',initialize);
