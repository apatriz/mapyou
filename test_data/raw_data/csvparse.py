import os
import csvkit
import json
import chardet

csvfile_location = "C:/Users/patrizio/Documents/GitHub/mapyou/test_data/raw_data"
json_out_location = "C:/Users/patrizio/Documents/GitHub/mapyou/test_data/raw_data"
json_out = os.path.join(json_out_location)

for file in os.listdir(csvfile_location):
	if not file.endswith('.csv'):
		continue
	csvRows = []
	name = os.path.splitext(os.path.basename(file))[0]
	json_out = os.path.join(json_out_location,'{0}.json'.format(name))
	
	with open(file) as csv_file:
		csv_reader = csvkit.py2.CSVKitDictReader(csv_file)
		for row in csv_reader:
			csvRows.append(row)
		
	
	with open(json_out,'wb') as json_file:
		json.dump(csvRows,json_file)
	

	