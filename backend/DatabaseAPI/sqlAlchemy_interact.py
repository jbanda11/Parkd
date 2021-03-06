#!/usr/bin/env python
# coding=UTF-8

import json
import requests
import pymysql

"""
Start connection stuff
"""

conn = pymysql.connect(host='parkd-mysql.cthwmo3nyii9.us-east-2.rds.amazonaws.com',
                             user='parkdteam',
                             password='foodtrucks',
                             db='parkd_sqlalchemy',
                             charset='utf8mb4',
                             cursorclass=pymysql.cursors.DictCursor)

"""
End connection
"""

cur = conn.cursor()

#cur.execute("SELECT * FROM Parks")

"""
Adding content
"""

city = 'Austin'	#Adjusts for every city

url = 'https://maps.googleapis.com/maps/api/place/textsearch/json?query=parks+in+' \
	+ city + '&key=AIzaSyAhABTKAw-LK6_Vh5Vhle7gwBebbpLCHew'

response = requests.get(url)

data = response.text

parsed = json.loads(data)
#print type(parsed)

#park_name = parsed["results"]
#print(park_name)

#print type(parsed["results"]) #HMMMM it's a list
addresses = []
park_names = []
place_ids = []
ratings = []
longitudes = []
latitudes = []
reviews = []
websites = []

for i in parsed["results"]:
	addresses.append(i["formatted_address"])
	park_names.append(i["name"])
	place_ids.append(i["place_id"])
	if("rating" in i):
		ratings.append(i["rating"])
	else:
		ratings.append("-1");
	longitudes.append(i["geometry"]["location"]["lat"])
	latitudes.append(i["geometry"]["location"]["lng"])
	websites.append(i["website"])

	#Extract PlaceID info
	"""

	url = 'https://maps.googleapis.com/maps/api/place/details/json?placeid=' \
 		+ i["place_id"] + '&key=AIzaSyAqX77st4mh3Y3aSVSIReny2MVAQXTkjdc'

 	response = requests.get(url)
	data = response.text
	parsed = json.loads(data)
	for k in range(0,3): 
		if("rating" in i): # Maybe put a while loop in here to gather the first 3 if they exist
			reviews.append(parsed["result"]["reviews"][k]["text"].replace("'", ""))
		else:
			reviews.append("-1")
			reviews.append("-1")
			reviews.append("-1")
			break;
"""

#print("Address: " + address)

for j in range(0,len(park_names)):
	park_names[j] = park_names[j].replace("'", "")
	print("index: " + str(j))
	print("name: " + park_names[j])
	print("address: " + addresses[j])
	print("ratings: " + str(ratings[j]))
	print("place_id: " + place_ids[j])
	print("long: " + str(longitudes[j]))
	print("lat: " + str(latitudes[j]))
	print("website: " + websites[j])

	#print("Reviews: " + reviews[3 * j])
	#print("Reviews: " + reviews[3 * j + 1])
	#print("Reviews: " + reviews[3 * j + 2])


	print(" ")
	print(" ")
	TruckID_ = j	#Have to change this every time
	Name_ = park_names[j]
	City_ = city
	Address_ = addresses[j]
	Rating_ = ratings[j]
	PhotoID_ = 0
	GooglePlacesID_ = place_ids[j]
	longitude_ = longitudes[j]
	latitude_ = latitudes[j]

	#review_ = reviews[j]
	#cur.execute("INSERT INTO park (ParkID, Name, City, Address, Rating, PhotoID, GooglePlacesID, longitude, latitude) VALUES ('%d', '%s', '%s', '%s', '%f', '0', '%s', %'s', '%s');" % (TruckID_, Name_, City_, Address_, Rating_, GooglePlacesID_, longitudes_, latitudes_))
	#cur.execute("UPDATE `parkd_sqlalchemy`.`park` SET `id`='%s' WHERE `id`='%d';" % (TruckID_, TruckID_))
	#cur.execute("UPDATE `parkd_sqlalchemy`.`park` SET `name`='%s' WHERE `id`='%d';" % (Name_, TruckID_))
	#cur.execute("UPDATE `parkd_sqlalchemy`.`park` SET `city`='%s' WHERE `id`='%d';" % (City_, TruckID_))
	#cur.execute("UPDATE `parkd_sqlalchemy`.`park` SET `address`='%s' WHERE `id`='%d';" % (Address_, TruckID_))
	#cur.execute("UPDATE `parkd_sqlalchemy`.`park` SET `rating`='%s' WHERE `id`='%d';" % (Rating_, TruckID_))
	#cur.execute("UPDATE `parkd_sqlalchemy`.`park` SET `PhotoID`='%s' WHERE `id`='%d';" % (0, TruckID_))
	#cur.execute("UPDATE `parkd_sqlalchemy`.`park` SET `google_id`='%s' WHERE `id`='%d';" % (GooglePlacesID_, TruckID_))

	#cur.execute("UPDATE `parkd_sqlalchemy`.`park` SET `longitude`='%s' WHERE `id`='%d';" % (longitude_, TruckID_))
	#cur.execute("UPDATE `parkd_sqlalchemy`.`park` SET `latitude`='%s' WHERE `id`='%d';" % (latitude_, TruckID_))
	#if(TruckID_ == 60):
	#	print("AJFLKSJDKLFJSLKDJ HELLOOOOO")
	
	#cur.execute("INSERT INTO `parkd_database`.`truck-reviews` (`TruckID`) VALUES ('%d');" % TruckID_)
	#cur.execute("UPDATE `parkd_database`.`truck-reviews` SET `TruckID`='%s' WHERE `TruckID`='%d';" % (TruckID_, TruckID_))
	#for reviewCount in range(0, 3):
	#	cur.execute("UPDATE `parkd_database`.`truck-reviews` SET `review%d` ='%s' WHERE `TruckID`='%d';" % (reviewCount, reviews[j * 3 + reviewCount], TruckID_))



#test
#cur.execute("INSERT INTO `parkd_database`.`truck` (`TruckID`, `Name`) VALUES ('40', 'helloo');")

"""

print(cur.description)

print()

for row in cur:
    print(row)
    print()
    print("**************")
    print()

"""
#conn.commit()
cur.close()
conn.close()
