#!/usr/bin/env python
# coding=UTF-8

import json
import requests
import pymysql

"""
Start connection stuff
"""

conn = pymysql.connect(host='34.217.60.78',
								user='root',
								password='parkd', #REINSERT PASSWORD WHEN TRYING TO RUN
								db='parkd_sqlalchemy',
								charset='utf8mb4',
								cursorclass=pymysql.cursors.DictCursor)

"""
End connection
"""

cities = ["Austin", "Portland", "Seattle"]

def main():
	parsed = getData(cities[0])

	addresses = getAddresses(parsed)
	park_names = getParkNames(parsed)
	place_ids = getPlace_ids(parsed)
	ratings = getRatings(parsed)
	longitudes = getLongitudes(parsed)
	latitudes = getLatitudes(parsed)

	cur = conn.cursor()
	truck_adds = getTruckAddresses(cur)
	park_adds = getParkAddresses(cur)

	#print("The first latitude is: " + str(latitudes[0]))
	#reviews = getReviews(parsed)


def getParkData(city):
	url = 'https://maps.googleapis.com/maps/api/place/textsearch/json?query=parks+in+' \
		+ city + '&key=AIzaSyBN-d-Ni7gSnrWbreihvdzXW24rRwAg650'

	response = requests.get(url)
	data = response.text
	parsed = json.loads(data)
	return parsed

def getTruckData(city):
	url = 'https://maps.googleapis.com/maps/api/place/textsearch/json?query=Food+trucks+in+' \
		+ city + '&key=AIzaSyBN-d-Ni7gSnrWbreihvdzXW24rRwAg650'

	response = requests.get(url)
	data = response.text
	parsed = json.loads(data)
	return parsed

def getAddresses(parsed):
	addresses = []
	for i in parsed["results"]:
		addresses.append(i["formatted_address"])
	return addresses

def getParkNames(parsed):
	names = []
	for i in parsed["results"]:
		names.append(i["name"])
	return names

def getPlace_ids(parsed):
	place_ids = []
	for i in parsed["results"]:
		place_ids.append(i["place_id"])
	return place_ids

def getRatings(parsed):
	ratings = []
	for i in parsed["results"]:
		if("rating" in i):
			ratings.append(i["rating"])
		else:
			ratings.append("-1");
	return ratings
		

def getLongitudes(parsed):
	longitudes = []
	for i in parsed["results"]:
		longitudes.append(i["geometry"]["location"]["lat"])
	return longitudes

def getLatitudes(parsed):
	latitudes = []
	for i in parsed["results"]:
		latitudes.append(i["geometry"]["location"]["lng"])
	return latitudes

def getParkAddresses(cur):
	park_addresses = []
	for i in range(0, 60): 
		sql = "SELECT address FROM park WHERE id ='%d'"
		cur.execute(sql % i)
		for row in cur:
			park_addresses.append(row['address'].replace("&", "")) #park address
	return park_addresses

def getTruckAddresses(cur):
	truck_addresses = []
	for j in range(0, 60):
		sql = "SELECT address FROM truck WHERE id ='%d'"
		cur.execute(sql % j)
	for row in cur:
		truck_addresses.append(row['address'].replace("&", "")) #truck address
	return truck_addresses

def getClosestTruck(ParkID, truck_adds, park_address):
	closestID = 0
	url = 'https://maps.googleapis.com/maps/api/distancematrix/json?origins=' \
 		+ truck_adds[ParkID] + '&destinations=' + park_address + '&key=AIzaSyAqX77st4mh3Y3aSVSIReny2MVAQXTkjdc'

	response = requests.get(url)
	data = response.text
	parsed = json.loads(data)
	closest_distance = parsed["rows"][0]["elements"][0]["distance"]["value"]
	startingRange = (ParkID / 20) * 20
	for truck_id in range(startingRange, startingRange + 20):
		url = 'https://maps.googleapis.com/maps/api/distancematrix/json?origins=' \
 		+ park_address + '&destinations=' + truck_adds[truck_id] + '&key=AIzaSyAqX77st4mh3Y3aSVSIReny2MVAQXTkjdc'

		response = requests.get(url)
		data = response.text
		parsed = json.loads(data)
		current_distance = parsed["rows"][0]["elements"][0]["distance"]["value"]
		if(current_distance < closest_distance):
			closest_distance = current_distance
			closestID = truck_id
	#print("The closest truck is truckid: " + str(closestID))
	return closestID;

#def getReviews(parsed):

if __name__ == "__main__":
	main()
