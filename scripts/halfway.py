from geopy.geocoders import Nominatim


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


def calculate_midpoint(lat1, lon1, lat2, lon2):
    midpoint_lat = (lat1 + lat2) / 2
    midpoint_lon = (lon1 + lon2) / 2
    return midpoint_lat, midpoint_lon


def get_postal_code(latitude, longitude):
    geolocator = Nominatim(user_agent="triangle_centroid_locator")
    location = geolocator.reverse((latitude, longitude))
    if location and "address" in location.raw:
        return location.raw["address"].get("postcode", "Postal code not found")
    return "Postal code not found"


def triangulate_and_find_postal_code(address1, address2, address3=None):
    geolocator = Nominatim(user_agent="triangle_centroid_locator")

    loc1 = geolocator.geocode(address1)
    loc2 = geolocator.geocode(address2)

    if not loc1 or not loc2:
        raise ValueError("One or more addresses could not be geocoded.")
    lat1, lon1 = loc1.latitude, loc1.longitude
    lat2, lon2 = loc2.latitude, loc2.longitude

    if address3:
        loc3 = geolocator.geocode(address3)
        if not loc3:
            raise ValueError("The third address could not be geocoded.")
        lat3, lon3 = loc3.latitude, loc3.longitude
        result_lat, result_lon = calculate_centroid(lat1, lon1, lat2, lon2, lat3, lon3)

    else:
        result_lat, result_lon = calculate_midpoint(lat1, lon1, lat2, lon2)

    postal_code = get_postal_code(result_lat, result_lon)

    return {
        "coordinates": (result_lat, result_lon),
        "postal_code": postal_code,
    }


if __name__ == "__main__":
    address_1 = "440 Terry Ave N, Seattle, WA 98109"  # Amazon
    address_2 = "4225 9th Ave NE, Seattle, WA 98105"  # My Address
    address_3 = "400 Broad St, Seattle, WA 98109"  # Space Needle

    result_three_points = triangulate_and_find_postal_code(
        address_1, address_2, address_3
    )
    print("Using Three Points:")
    print(f"Coordinates: {result_three_points['coordinates']}")
    print(f"Postal Code: {result_three_points['postal_code']}")

    result_two_points = triangulate_and_find_postal_code(address_1, address_2)
    print("\nUsing Two Points:")
    print(f"Coordinates: {result_two_points['coordinates']}")
    print(f"Postal Code: {result_two_points['postal_code']}")
