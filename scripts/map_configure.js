var map;
// Data is created from parsing CSV to object arrays.
var dataGroups = [{"name":"Current Customers: Sales > 2000","data":Current_Customers_Greater_Than_2000_In_Sales,"pinColor":"d9f2e6"},
{"name":"Potential Competitors","data":Potential_Competitors,"pinColor":"ccd9ff"},
{"name":"Prospects","data":Prospect_List,"pinColor":"ffcccc"}];
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
	}
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
// Loop through JSON data arrays to initialize markers and attach infowindows displaying the attributes of each company
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
			var pinImage = {url:"http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + pinColor,
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
			//use closure to capture marker and markerContent variable at each iteration and pass them to click event function
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
			// create list item for company name in nav list, bind click event
			/* var navItem = document.createElement('li'); */
			/* navItem.innerHTML = marker.name; */
			
			// bind click event to navItem ()
/* 			(function(marker){
				navItem.onclick = function(){
					google.maps.event.trigger(marker,'click')
				};
			})(marker);	 */
			/* navList.push(navItem); */
			var navItem = '<li id="' + marker.name + '">' + marker.name + '</li>';
			if(navList.indexOf(navItem) === -1){
				navList.push(navItem);
			};	
		}
		markerGroups[markerGroupName]= markerGroup;
/* 		navList.sort(function(a,b){
			var compA = $(a).text().toUpperCase();
			var compB = $(b).text().toUpperCase();
			return (compA < compB) ? -1 : (compA > compB) ? 1 : 0;
		}); */
		navList.sort();
		navBar[markerGroupName] = navList;
	}
}



function createLegend(){
	// Create the legend content
	var legend = document.getElementById("legend");
	var markerList = document.getElementById('navlist');	
	var navTitle = document.getElementById("navtitle");
/* 	var legend = document.createElement('table');
	legend.id = "legend"; */	
	for(g in markerGroups){	

/* 		var markerList = document.createElement("ul");
/* 		markerList.style.display = "none";
		markerList.id = g + '_list';
		markerList.innerHTML = "<p>" + g + "</p>";
		for(var i=0;i < markerGroups[g].length; i++){
			var name = markerGroups[g][i].name;
			markerList.innerHTML += "<li>" + name + "</li>"
		}
		markernav.appendChild(markerList); */ 
		var markerSample = markerGroups[g][0];
		var groupicon = markerSample.icon.url;
/* 		var tableRow = document.createElement('tr'); */
/* 		var checkboxCell = document.createElement('td');
		var entryCell = document.createElement('td'); */
		var entryCell = document.createElement('label');
		var inputdiv = document.createElement('input');	
		$(entryCell).attr({"class":"legendEntry","for":g,});
		entryCell.innerHTML = '<img class="legendIcon" src="' + groupicon + '"> ' + '<span>' + g + '</span>';
		inputdiv.id = g;
		inputdiv.type ="checkbox";
		//set onclick event for checkbox that toggles display of each marker group
			
		inputdiv.onclick = function(){
		/* 	createNav(this.id); */
	/* 		var groupId = this.id; */
			var groupArray = markerGroups[this.id];
			for(var i=0;i < groupArray.length;i++){
				var marker = groupArray[i];
				if(!marker.getVisible()){
					marker.setVisible(true);
					this.style.background = marker.color;
				/* 	$("#markernav").css("display","block"); */
				}else{
					marker.setVisible(false);
					this.style.background = "#fff";
					/* $("#markernav").css("display","none") */					
				}	
			}
		};
/* 		checkboxCell.appendChild(inputdiv)
		tableRow.appendChild(entryCell)
		tableRow.appendChild(checkboxCell) */
/* 		legend.appendChild(tableRow) */
		entryCell.appendChild(inputdiv);
		legend.appendChild(entryCell);
	}
	// set clear button
	var clearAll = document.getElementById('clearall');
	clearAll.onclick = function(){
		for(g in markerGroups){
			for(var i=0;i < markerGroups[g].length;i++){
				var marker = markerGroups[g][i];
				marker.setVisible(false);
				markerInfoWindow.close();
			}
		}	
	};
	//bind click event to legend entries to load navlist 
	$('#legend').on("click","input",function(){
		var markerGroup = $(this).attr("id");
		var itemlist = navBar[markerGroup].join('');
		$('#navtitle').text(markerGroup);
		$('#navlist').html(itemlist);
		$("#markernav").fadeToggle("slow");
		$("#clearbutton").fadeToggle("slow");
	});
	//bind click event to nav list item 
	$('#navlist').on("click","li",function(){
		var markerGroup = $('#navtitle').text();
		var markerName = $(this).attr("id");
		for(i=0;i < markerGroups[markerGroup].length;i++){
			var marker = markerGroups[markerGroup][i];
			if(marker.name === markerName){
				google.maps.event.trigger(marker,'click');
				marker.setVisible(true);
			}
		};	
	});

	// Set the position of the legend inside the map 
/* 	map.controls[google.maps.ControlPosition.RIGHT_TOP].push(legend); */
}
		
// Initialize the map
google.maps.event.addDomListener(window,'load',initializeMap);