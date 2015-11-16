"""
Iterates through each csv file in a location and outputs data to data.js as JSON-formatted list attached to a variable. Note: this is
not true JSON.

"""
import os
import csvkit
import json
import chardet
from collections import OrderedDict

csvfile_location = "C:/Users/patrizio/Documents/GitHub/mapyou/test_data/raw_data"
data_out = "C:/Users/patrizio/Documents/GitHub/mapyou/test_data/data.js"


for file in os.listdir(csvfile_location):
	if not file.endswith('.csv'):
		continue
	csv_rows = []
	obj_list = []
	name = os.path.splitext(os.path.basename(file))[0]
	# json_out = os.path.join(json_out_location,'{0}.js'.format(name))
	
	with open(file,'rb') as csv_file:
		raw_data = csv_file.read()
		detected = chardet.detect(raw_data)
		codec = detected['encoding']
		confidence = detected['confidence']
	with open(file,'rb') as csv_file:
		csv_reader = csvkit.py2.CSVKitReader(csv_file,encoding = codec)
		for row in csv_reader:
			csv_rows.append(row)
	headers = [header for header in csv_rows[0]]
	for row in csv_rows:
		if row == csv_rows[0]:
			continue
		obj = OrderedDict()
		for i in range(len(headers)):
			obj[headers[i]] = row[i]
		obj_list.append(obj) 
	
	with open(data_out,'ab') as js_file:
		js_file.write('var {0} = '.format(name))
		json.dump(obj_list,js_file)
		js_file.write('\n\n')
		
	

	