
const DEMO_FOODS = [
  {
    id: "demo-1",
    name: "Rice & Curry",
    donor: "Green Restaurant",
    location: "Negombo",
    quantity: "5 portions",
    category: "meals",
    emoji: "🍛",
    demo: true
  },
  {
    id: "demo-2",
    name: "Fresh Bread",
    donor: "City Bakery",
    location: "Colombo",
    quantity: "10 pieces",
    category: "bakery",
    emoji: "🍞",
    demo: true
  },
  {
    id: "demo-3",
    name: "Fresh Vegetables",
    donor: "Local Market",
    location: "Gampaha",
    quantity: "3 packs",
    category: "vegetables",
    emoji: "🥬",
    demo: true
  },
  {
    id: "demo-4",
    name: "Fresh Fruits",
    donor: "Kindness Store",
    location: "Negombo",
    quantity: "4 packs",
    category: "fruits",
    emoji: "🍎",
    demo: true
  },
  {
    id: "demo-5",
    name: "Vegetable Sandwiches",
    donor: "Happy Cafe",
    location: "Colombo",
    quantity: "6 pieces",
    category: "meals",
    emoji: "🥪",
    demo: true
  },
  {
    id: "demo-6",
    name: "Fresh Buns",
    donor: "Sweet Bakery",
    location: "Gampaha",
    quantity: "8 pieces",
    category: "bakery",
    emoji: "🥐",
    demo: true
  }
];

const STORAGE_KEY = "foodiehug_foods_v1";
const RESERVATION_KEY = "foodiehug_reservations_v1";

const foodList = document.getElementById("foodList");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const emptyMessage = document.getElementById("emptyMessage");
const donationForm = document.getElementById("donationForm");
const modal = document.getElementById("modal");
const modalContent = document.getElementById("modalContent");
const toast = document.getElementById("toast");

let toastTimer;

function loadData(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return Array.isArray(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

let foods = loadData(STORAGE_KEY, DEMO_FOODS);
let reservations = loadData(RESERVATION_KEY, []);

function saveFoods() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(foods));
}

function saveReservations() {
  localStorage.setItem(
    RESERVATION_KEY,
    JSON.stringify(reservations)
  );
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

function getEmoji(category) {
  const icons = {
    meals: "🍛",
    bakery: "🍞",
    vegetables: "🥬",
    fruits: "🍎"
  };

  return icons[category] || "🍱";
}

function renderFoods() {
  const search = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;

  foodList.replaceChildren();

  const filteredFoods = foods.filter(food => {
    const matchesSearch =
      food.name.toLowerCase().includes(search) ||
      food.location.toLowerCase().includes(search) ||
      food.donor.toLowerCase().includes(search);

    const matchesCategory =
      category === "all" || food.category === category;

    return matchesSearch && matchesCategory;
  });

  emptyMessage.hidden = filteredFoods.length !== 0;

  filteredFoods.forEach(food => {
    const card = document.createElement("article");
    card.className = "food-card";

    const icon = document.createElement("div");
    icon.className = "food-emoji";
    icon.textContent = food.emoji || getEmoji(food.category);

    const title = document.createElement("h3");
    title.textContent = food.name;

    const donor = document.createElement("p");
    donor.textContent = "💗 Donor: " + food.donor;

    const location = document.createElement("p");
    location.textContent = "📍 " + food.location;

    const quantity = document.createElement("p");
    quantity.textContent = "🍱 " + food.quantity;

    const status = document.createElement("p");
    status.className = "food-status";
    status.textContent = food.demo
      ? "Demo listing"
      : "Awaiting collection";

    const button = document.createElement("button");
    button.className = "reserve-btn";

    const alreadyReserved = reservations.includes(food.id);

    button.textContent = alreadyReserved
      ? "Reserved ✓"
      : "Reserve Food ❤️";

    button.disabled = alreadyReserved;

    button.addEventListener("click", () => {
      reserveFood(food.id);
    });

    card.append(
      icon,
      title,
      donor,
      location,
      quantity,
      status,
      button
    );

    foodList.appendChild(card);
  });
}

function reserveFood(id) {
  const food = foods.find(item => item.id === id);

  if (!food || reservations.includes(id)) {
    return;
  }

  const confirmed = confirm(
    "Reserve " + food.name + " from " + food.donor + "?"
  );

  if (!confirmed) return;

  reservations.push(id);
  saveReservations();

  renderFoods();

  showToast("Food reserved in this browser! ❤️");
}

searchInput.addEventListener("input", renderFoods);

categoryFilter.addEventListener("change", renderFoods);

donationForm.addEventListener("submit", event => {
  event.preventDefault();

  const name = document.getElementById("foodName").value.trim();
  const donor = document.getElementById("donorName").value.trim();
  const location = document.getElementById("foodLocation").value.trim();
  const quantity = document.getElementById("foodQuantity").value.trim();
  const category = document.getElementById("foodCategory").value;
  const expiry = document.getElementById("expiryTime").value;
  const safety = document.getElementById("safetyCheck").checked;

  if (!name || !donor || !location || !quantity || !expiry || !safety) {
    showToast("Please complete all fields.");
    return;
  }

  const expiryDate = new Date(expiry);

  if (
    Number.isNaN(expiryDate.getTime()) ||
    expiryDate.getTime() <= Date.now()
  ) {
    showToast("Please select a future collection deadline.");
    return;
  }

  const newFood = {
    id: "food-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7),
    name,
    donor,
    location,
    quantity,
    category,
    emoji: getEmoji(category),
    expiry,
    demo: false
  };

  foods.unshift(newFood);
  saveFoods();

  donationForm.reset();

  searchInput.value = "";
  categoryFilter.value = "all";

  renderFoods();

  showToast("Thank you for sharing food! 🍓");

  document.getElementById("food").scrollIntoView({
    behavior: "smooth"
  });
});

function showLogin() {
  openModal(
    "Welcome to FoodieHug 🍓",
    "Login and registration will be connected to a secure account system in a future version."
  );
}

function showDonate() {
  document.getElementById("donate").scrollIntoView({
    behavior: "smooth"
  });

  document.getElementById("foodName").focus();
}

function openModal(title, message) {
  modalContent.replaceChildren();

  const heading = document.createElement("h2");
  heading.textContent = title;

  const paragraph = document.createElement("p");
  paragraph.textContent = message;
  paragraph.style.lineHeight = "1.8";

  modalContent.append(heading, paragraph);

  modal.hidden = false;
}

function closeModal() {
  modal.hidden = true;
}

document.getElementById("loginBtn")
  .addEventListener("click", showLogin);

document.getElementById("closeModal")
  .addEventListener("click", closeModal);

modal.addEventListener("click", event => {
  if (event.target === modal) {
    closeModal();
  }
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !modal.hidden) {
    closeModal();
  }
});

renderFoods();
