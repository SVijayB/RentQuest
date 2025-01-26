import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler


def topsis(data, weights, impacts):
    # Normalize the decision matrix
    scaler = MinMaxScaler()
    norm_data = scaler.fit_transform(data)

    # Multiply by weights
    weighted_data = norm_data * weights

    # Determine ideal best and worst
    ideal_best = np.max(weighted_data, axis=0) * impacts
    ideal_worst = np.min(weighted_data, axis=0) * impacts

    # Calculate distances to ideal best and worst
    distance_best = np.sqrt(((weighted_data - ideal_best) ** 2).sum(axis=1))
    distance_worst = np.sqrt(((weighted_data - ideal_worst) ** 2).sum(axis=1))

    # Calculate the relative closeness to the ideal solution
    scores = distance_worst / (distance_best + distance_worst)

    return scores


def rank_apartments(bedrooms, bathrooms, zipcode, max_price, weights, impacts):
    data = pd.read_csv("rental_clean - Copy.csv")
    filtered_data = data[
        (data["beds"] >= bedrooms)
        & (data["full_baths"] >= bathrooms)
        & (data["zip_code"] == zipcode)
        & (data["rent_price"] <= max_price)
    ]

    if filtered_data.empty:
        return pd.DataFrame()  # Return an empty DataFrame instead of a string

    criteria = [
        "rent_price",
        "sqft",
        "Crime_Score",
        "Parking Locations",
        "Neighbour_loc",
    ]

    # Prepare data for TOPSIS
    data_topsis = filtered_data[criteria].to_numpy()

    # Apply TOPSIS
    scores = topsis(data_topsis, weights, impacts)

    # Add scores to the filtered dataframe
    filtered_data["TOPSIS_Score"] = scores

    # Rank apartments
    filtered_data["Rank"] = filtered_data["TOPSIS_Score"].rank(
        ascending=False, method="min"
    )

    return filtered_data.sort_values("Rank")


# # Get user input
# bedrooms = int(input("Required number of bedrooms: "))
# bathrooms = int(input("Required number of bathrooms: "))
# zipcode = int(input("Desired zipcode: "))
# max_price = float(input("Maximum rent price: "))
# weights = np.array([0.3, 0.3, 0.1, 0.1, 0.2])
# impacts = np.array([-1, 1, -1, 1, 1])

# # After calling rank_apartments, check if the result is empty
# ranked_apartments = rank_apartments(
#     cleaned_data, bedrooms, bathrooms, zipcode, max_price
# )

# if ranked_apartments.empty:
#     print("No apartments match the criteria.")
# else:
#     print(
#         ranked_apartments[
#             [
#                 "full_street_line",
#                 "rent_price",
#                 "beds",
#                 "full_baths",
#                 "sqft",
#                 "TOPSIS_Score",
#                 "Rank",
#             ]
#         ].head(10)
#     )
