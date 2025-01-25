from geopy.geocoders import Nominatim
import math


def geocode_address(address):
    geolocator = Nominatim(user_agent="address_geocoder")
    location = geolocator.geocode(address)
    if location:
        return location.latitude, location.longitude
    else:
        raise ValueError(f"Could not geocode address: {address}")


def calculate_centroid(lat1, lon1, lat2, lon2, lat3, lon3):
    centroid_lat = (lat1 + lat2 + lat3) / 3
    centroid_lon = (lon1 + lon2 + lon3) / 3
    return centroid_lat, centroid_lon


# Function to reverse geocode and get postal code
def get_postal_code(latitude, longitude):
    geolocator = Nominatim(user_agent="triangle_centroid_locator")
    location = geolocator.reverse((latitude, longitude))
    if location and "address" in location.raw:
        return location.raw["address"].get("postcode", "Postal code not found")
    return "Postal code not found"


# Main function to triangulate based on three addresses
def triangulate_and_find_postal_code(address1, address2, address3):
    geolocator = Nominatim(user_agent="triangle_centroid_locator")

    # Geocode addresses to get latitude and longitude
    loc1 = geolocator.geocode(address1)
    loc2 = geolocator.geocode(address2)
    loc3 = geolocator.geocode(address3)

    if not loc1 or not loc2 or not loc3:
        raise ValueError("One or more addresses could not be geocoded.")

    # Extract latitudes and longitudes
    lat1, lon1 = loc1.latitude, loc1.longitude
    lat2, lon2 = loc2.latitude, loc2.longitude
    lat3, lon3 = loc3.latitude, loc3.longitude

    # Calculate centroid
    centroid_lat, centroid_lon = calculate_centroid(lat1, lon1, lat2, lon2, lat3, lon3)

    # Get postal code for centroid
    postal_code = get_postal_code(centroid_lat, centroid_lon)

    return {
        "centroid_coordinates": (centroid_lat, centroid_lon),
        "postal_code": postal_code,
    }


# Example usage
address_1 = "440 Terry Ave N, Seattle, WA 98109"  # Amazon
address_2 = "4225 9th Ave NE, Seattle, WA 98105"  # My Address
address_3 = "400 Broad St, Seattle, WA 98109"  # Space Needle

result = triangulate_and_find_postal_code(address_1, address_2, address_3)
print(f"Centroid Coordinates: {result['centroid_coordinates']}")
print(f"Postal Code: {result['postal_code']}")
