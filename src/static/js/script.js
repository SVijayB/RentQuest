let map;
let markers = [];
let infoWindow;

// Initialize Google Maps
function initMap() {
    const center = { lat: 47.6062, lng: -122.3321 }; // Seattle, WA
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 12,
        center: center,
    });

    infoWindow = new google.maps.InfoWindow();

    // Initial properties
    const properties = [
        {
            lat: 47.6097,
            lng: -122.3331,
            title: "Luxury Condo",
            price: "$2,000",
            bedrooms: 2,
            bathrooms: 2,
        },
        {
            lat: 47.6132,
            lng: -122.3333,
            title: "Modern Apartment",
            price: "$2,500",
            bedrooms: 3,
            bathrooms: 2,
        },
        {
            lat: 47.6192,
            lng: -122.334,
            title: "Cozy Studio",
            price: "$1,500",
            bedrooms: 1,
            bathrooms: 1,
        },
    ];

    updateRentalListings(properties);
    updateMapPins(properties);
}

// Reusable function to validate locations
function validateLocations() {
    const houseAddress = document.getElementById("location-1").value.trim();
    const officeAddress = document.getElementById("location-2").value.trim();
    const friendsAddress = document.getElementById("location-3").value.trim();

    if (!houseAddress || !officeAddress || !friendsAddress) {
        alert("Please enter all three locations.");
        return null;
    }

    return {
        house: houseAddress,
        office: officeAddress,
        friend: friendsAddress,
    };
}

// Function to handle saving locations
function saveLocations() {
    const locations = validateLocations();
    if (locations) {
        document.getElementById("locations-button").textContent =
            "Locations Set";
        return locations;
    }
    return null;
}

// Reusable function to send data to the backend
function sendToBackend(endpoint, payload, successMessage, failureMessage) {
    fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                alert(successMessage);
                console.log(data); // Debugging
                if (data.rentals) {
                    updateRentalListings(data.rentals);
                    updateMapPins(data.rentals);
                }
            } else {
                alert(failureMessage);
            }
        })
        .catch((error) => {
            console.error("Error:", error);
            alert("An error occurred while processing the request.");
        });
}

// Reusable function to set up dropdown menus
function setupDropdown(buttonId, optionsId, selectedCallback) {
    const button = document.getElementById(buttonId);
    const options = document.getElementById(optionsId);

    button.addEventListener("click", () => {
        const isVisible = options.style.display === "block";
        options.style.display = isVisible ? "none" : "block";
    });

    options.addEventListener("click", (event) => {
        if (event.target.classList.contains("btn")) {
            const selectedValue = event.target.getAttribute("data-value");
            button.textContent = selectedValue;
            options.style.display = "none";
            selectedCallback(selectedValue);
        }
    });

    document.addEventListener("click", (event) => {
        if (!button.contains(event.target) && !options.contains(event.target)) {
            options.style.display = "none";
        }
    });
}

// Reusable function to set up sliders
function setupSliders(sliderConfigs) {
    sliderConfigs.forEach(({ id, displayId }) => {
        const slider = document.getElementById(id);
        const display = document.getElementById(displayId);

        slider.addEventListener("input", () => {
            display.textContent = slider.value;
        });
    });
}

// Retrieve slider weight values dynamically
function getWeightValues(sliderConfigs) {
    const weights = {};
    sliderConfigs.forEach(({ id }) => {
        weights[id.replace("-weight", "")] = parseFloat(
            document.getElementById(id).value
        );
    });
    return weights;
}

// Update rental listings
function updateRentalListings(rentals) {
    const listingsContainer = document.getElementById("listings");
    listingsContainer.innerHTML = "";

    if (rentals.length === 0) {
        listingsContainer.innerHTML =
            "<p>No rentals found for the selected filters.</p>";
        return;
    }

    rentals.forEach((rental) => {
        const listingElement = document.createElement("div");
        listingElement.classList.add("listing");
        listingElement.innerHTML = `
      <img src="${rental.imageUrl}" alt="${rental.title}" class="listing-image" />
      <h3>${rental.title}</h3>
      <p><span class="price">${rental.price}</span></p>
      <p><strong>${rental.bedrooms} Bed</strong> <strong>${rental.bathrooms} Bath</strong></p>
      <p class="address">${rental.address}</p>
    `;
        listingsContainer.appendChild(listingElement);
    });
}

// Update map pins
function updateMapPins(rentals) {
    markers.forEach((marker) => marker.setMap(null)); // Clear existing markers
    markers = []; // Reset markers array

    rentals.forEach((rental) => {
        const marker = new google.maps.Marker({
            position: { lat: rental.lat, lng: rental.lng },
            map: map,
            title: rental.title,
        });

        marker.addListener("click", () => {
            // Construct the Street View iframe URL
            const streetViewUrl = `https://www.google.com/maps/embed/v1/streetview?key=AIzaSyCoHWvGch-IqnyZY4KA206gEMDDe5kTCQM&location=${rental.lat},${rental.lng}&heading=210&pitch=10&fov=90`;

            // Set content for info window
            infoWindow.setContent(`
                <div>
                    <h3>${rental.title}</h3>
                    <p>Bedrooms: ${rental.bedrooms}</p>
                    <p>Bathrooms: ${rental.bathrooms}</p>
                    <p>Price: ${rental.price}</p>
                    <iframe 
                        width="300" 
                        height="200" 
                        frameborder="0" 
                        style="border:0;" 
                        src="${streetViewUrl}" 
                        allowfullscreen>
                    </iframe>
                </div>
            `);

            infoWindow.open(map, marker);
        });

        markers.push(marker);
    });
}

// Setup dropdowns and sliders
setupDropdown("price-button", "price-options", (value) => {
    console.log("Price selected:", value);
});
setupDropdown("bedrooms-button", "bedrooms-options", (value) => {
    console.log("Bedrooms selected:", value);
});
setupDropdown("bathrooms-button", "bathrooms-options", (value) => {
    console.log("Bathrooms selected:", value);
});
setupDropdown("locations-button", "locations-options", (value) => {
    console.log("Locations selected:", value);
});

setupSliders([
    { id: "amenities-weight", displayId: "amenities-value" },
    { id: "safety-weight", displayId: "safety-value" },
    { id: "neighborhood-weight", displayId: "neighborhood-value" },
    { id: "space-weight", displayId: "space-value" },
]);

// Add event listener for the "Save Locations" button
document
    .getElementById("save-locations-button")
    .addEventListener("click", () => {
        const locations = saveLocations();
        if (locations) {
            console.log("Locations saved:", locations);
        }
    });

// Handle form submission
document.getElementById("filters-form").addEventListener("submit", (event) => {
    event.preventDefault();

    const locations = saveLocations();
    if (!locations) {
        alert("Please set all three locations before applying filters.");
        return;
    }

    const filters = {
        price: document.getElementById("price-button").textContent.trim(),
        bedrooms: document.getElementById("bedrooms-button").textContent.trim(),
        bathrooms: document
            .getElementById("bathrooms-button")
            .textContent.trim(),
    };

    const weights = getWeightValues([
        { id: "amenities-weight" },
        { id: "safety-weight" },
        { id: "neighborhood-weight" },
        { id: "space-weight" },
    ]);

    const payload = { filters, locations, weights };

    sendToBackend(
        "/api/ranking",
        payload,
        "Filters and locations saved! Suggestions will update."
    );
});

// Initialize map on window load
google.maps.event.addDomListener(window, "load", initMap);
