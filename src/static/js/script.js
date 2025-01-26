let map;
let markers = []; // To keep track of all markers on the map
let infoWindow; // Single InfoWindow instance to avoid multiple open popups

// Initialize Google Maps
function initMap() {
  const center = { lat: 47.6062, lng: -122.3321 }; // Seattle, WA
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 12,
    center: center,
  });

  infoWindow = new google.maps.InfoWindow(); // Initialize InfoWindow

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

// Reusable dropdown logic
function setupDropdown(buttonId, optionsId, selectedCallback) {
  const button = document.getElementById(buttonId);
  const options = document.getElementById(optionsId);

  // Toggle dropdown visibility
  button.addEventListener("click", () => {
    const isVisible = options.style.display === "block";
    options.style.display = isVisible ? "none" : "block";
  });

  // Handle selection
  options.addEventListener("click", (event) => {
    if (event.target.classList.contains("btn")) {
      const selectedValue = event.target.getAttribute("data-value");
      button.textContent = selectedValue; // Update button text
      options.style.display = "none"; // Hide dropdown
      selectedCallback(selectedValue);
    }
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", (event) => {
    if (!button.contains(event.target) && !options.contains(event.target)) {
      options.style.display = "none";
    }
  });
}

// Apply dropdown logic for filters
setupDropdown("price-button", "price-options", (selectedValue) => {
  console.log("Price selected:", selectedValue);
});
setupDropdown("bedrooms-button", "bedrooms-options", (selectedValue) => {
  console.log("Bedrooms selected:", selectedValue);
});
setupDropdown("bathrooms-button", "bathrooms-options", (selectedValue) => {
  console.log("Bathrooms selected:", selectedValue);
});

// Handle form submission
document
  .getElementById("filters-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    loadRentals();
  });

// Load rentals based on selected filters
function loadRentals() {
  const price = document.getElementById("price-button").textContent.trim();
  const bedrooms = document
    .getElementById("bedrooms-button")
    .textContent.trim();
  const bathrooms = document
    .getElementById("bathrooms-button")
    .textContent.trim();
  console.log("Filters Applied:");
  console.log("Price:", price);
  console.log("Bedrooms:", bedrooms);
  console.log("Bathrooms:", bathrooms);

  // Display selected filter values
  document.getElementById("selected-price").textContent = `Price: ${price}`;
  document.getElementById(
    "selected-bedrooms"
  ).textContent = `Bedrooms: ${bedrooms}`;
  document.getElementById(
    "selected-bathrooms"
  ).textContent = `Bathrooms: ${bathrooms}`;

  // Mock fetching filtered rentals
  fetch(`/rentals?price=${price}&bedrooms=${bedrooms}&bathrooms=${bathrooms}`)
    .then((response) => response.json())
    .then((data) => {
      updateRentalListings(data);
      updateMapPins(data);
    })
    .catch((error) => {
      console.error("Error fetching rental data:", error);
    });
}

// Update rental listings on the page
function updateRentalListings(rentals) {
  const listingsContainer = document.getElementById("listings");
  listingsContainer.innerHTML = ""; // Clear current listings

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
    <p> <span class="price">${rental.price}</span></p>
    <p> <strong>${rental.bedrooms} Bed</strong> <strong>${rental.bathrooms} Bath</strong></p>
    
    <p class="address">${rental.address}</p>
  `;
    listingsContainer.appendChild(listingElement);
  });
}

// Update map pins based on filtered rentals
function updateMapPins(rentals) {
  // Clear existing markers
  markers.forEach((marker) => marker.setMap(null));
  markers = [];

  rentals.forEach((rental) => {
    const marker = new google.maps.Marker({
      position: { lat: rental.lat, lng: rental.lng },
      map: map,
      title: rental.title,
    });

    // Toggle Locations Dropdown
    const locationsButton = document.getElementById("locations-button");
    const locationsOptions = document.getElementById("locations-options");

    locationsButton.addEventListener("click", () => {
      const isVisible = locationsOptions.style.display === "block";
      locationsOptions.style.display = isVisible ? "none" : "block";
    });

    // Handle sliders for weights
    const sliders = [
      { id: "transportation-weight", displayId: "transportation-value" },
      { id: "amenities-weight", displayId: "amenities-value" },
      { id: "safety-weight", displayId: "safety-value" },
      { id: "neighborhood-weight", displayId: "neighborhood-value" },
      { id: "space-weight", displayId: "space-value" },
    ];

    sliders.forEach((slider) => {
      const input = document.getElementById(slider.id);
      const display = document.getElementById(slider.displayId);

      // Update displayed value on input change
      input.addEventListener("input", () => {
        display.textContent = input.value;
      });
    });

    // Get weight values when needed
    function getWeightValues() {
      const weights = {};
      sliders.forEach((slider) => {
        weights[slider.id.replace("-weight", "")] = parseFloat(
          document.getElementById(slider.id).value
        );
      });
      console.log("Selected Weights:", weights);
      return weights;
    }

    // Include weights in filter submission
    document
      .getElementById("filters-form")
      .addEventListener("submit", function (event) {
        event.preventDefault();

        const weights = getWeightValues(); // Get weights dynamically

        // Use weights in your ML model call
        console.log("Weights sent to the model:", weights);

        // Your existing rental loading logic...
        loadRentals();
      });

    // Save Locations and Send to Backend
    document
      .getElementById("save-locations-button")
      .addEventListener("click", () => {
        const houseAddress = document.getElementById("location-1").value.trim();
        const officeAddress = document
          .getElementById("location-2")
          .value.trim();
        const friendsAddress = document
          .getElementById("location-3")
          .value.trim();

        // Validate Inputs
        if (!houseAddress || !officeAddress || !friendsAddress) {
          alert("Please enter all three locations.");
          return;
        }

        // Send Data to Backend
        const locations = {
          house: houseAddress,
          office: officeAddress,
          friend: friendsAddress,
        };

        fetch("/api/center-point", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(locations),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              alert("Locations saved! Suggestions will update.");
              console.log("Center point:", data.centerPoint); // Debug
              // Update the map or listings based on the returned center point.
            } else {
              alert("Failed to process locations.");
            }
          })
          .catch((error) => {
            console.error("Error sending locations:", error);
            alert("An error occurred while saving locations.");
          });

        // Close Dropdown
        locationsOptions.style.display = "none";
      });

    // Close dropdown when clicking outside
    document.addEventListener("click", (event) => {
      if (
        !locationsButton.contains(event.target) &&
        !locationsOptions.contains(event.target)
      ) {
        locationsOptions.style.display = "none";
      }
    });

    // Add click event to display property details in InfoWindow
    marker.addListener("click", () => {
      infoWindow.setContent(`
        <h3>${rental.title}</h3>
        <p>Bedrooms: ${rental.bedrooms}</p>
        <p>Bathrooms: ${rental.bathrooms}</p>
        <p>Price: ${rental.price}</p>
      `);
      infoWindow.open(map, marker);
    });

    markers.push(marker);
  });
}

// Initialize map on window load
google.maps.event.addDomListener(window, "load", initMap);
