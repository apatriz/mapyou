var map;
// Data is created from parsing CSV to object arrays.

var dataGroups = [{"name":"Current Customers: Sales > 2000","data":Current_Customers_Greater_Than_2000_In_Sales,"pinColor":"008E00"},
{"name":"Potential Competitors","data":Potential_Competitors,"pinColor":"FE7569"},
{"name":"Prospects","data":Prospect_List,"pinColor":"EBF731"}];
var markerGroups = {};
var markerInfoWindow = new InfoBubble({
		disableAutoPan:true,
		borderWidth: 1,
		borderColor:'#003300',
		borderWidth: 2,
		borderRadius: 10,
		shadowStyle: 1,
		closeSrc: 'images/close.gif',
		padding:10,
	});
	
function initializeMap(){
	var mapCanvas = document.getElementById('map');
	var mapOptions = {
		center: new google.maps.LatLng(39.50,-98.35),
		zoom: 4,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	}
	map = new google.maps.Map(mapCanvas,mapOptions);
	// Set map resize event trigger on window resize
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
						var latitude = Number(fieldValue);
					}
					else if(fieldName.toLowerCase() === "longitude"){
						var longitude = Number(fieldValue);
					}
					markerContent += '<p><strong>' + fieldName + '</strong>: '+ fieldValue + '</p>';	
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
			groupName:markerGroupName
			});
			marker.setVisible(false);
			//use closure to capture marker and markerContent variable at each iteration and pass them to click event function
			(function(marker,data){
				google.maps.event.addListener(marker,'click',function(){
				markerInfoWindow.setContent(data);
				markerInfoWindow.open(map,marker);
				map.panTo(marker.getPosition());
				map.panBy(0,-200);//Pans map to better center view on both marker and infowindow when clicked	
			});		
			})(marker,markerContent);
			// add event listener for mouse over marker, to display preview of marker title in previewInfo div
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
	var legend = document.createElement('table');
	legend.id = "legend";	
	for(g in markerGroups){
		var markerSample = markerGroups[g][0];
		var groupicon = markerSample.icon.url;
		var tableRow = document.createElement('tr');
		var checkboxCell = document.createElement('td')
		var entryCell = document.createElement('td')
		var inputdiv = document.createElement('input');	
		entryCell.setAttribute("class","legendEntry");
		entryCell.innerHTML = '<img class="legendIcon" src="' + groupicon + '"> ' + g;
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
		checkboxCell.appendChild(inputdiv)
		tableRow.appendChild(entryCell)
		tableRow.appendChild(checkboxCell)
		legend.appendChild(tableRow)
	}
	// Set the position of the legend inside the map 
	map.controls[google.maps.ControlPosition.RIGHT_TOP].push(legend);
}
		
// Initialize the map
google.maps.event.addDomListener(window,'load',initializeMap);