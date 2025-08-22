/**
 * @typedef Event
 * @property {number} id
 * @property {string} name
 * @property {string} description
 * @property {string|Date} date
 * @property {string} location
 */

// === Constants ===
const BASE = "https://fsa-crud-2aa9294fe819.herokuapp.com/api";
const COHORT = "/2507"; // Make sure to change this!
const RESOURCE = "/events";
const API = BASE + COHORT + RESOURCE;

// === State ===
let events = [];
let selectedEvent;

/** Updates state with all events from the API */
async function getEvents() {
  try {
    const response = await fetch(API);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const eventsdata = await response.json();
    events = eventsdata.data;
  } catch (e) {
    console.error(`Failed to fetch events!`);
  }
}

/** Updates state with a single event from the API */
async function getEvent(id) {
  try {
    const response = await fetch(`${API}/${id}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const eventdata = await response.json();
    selectedEvent = eventdata.data;
  } catch (e) {
    console.error(`Failed to fetch event!`);
  }
}

// === Utilities ===
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// === Components ===

/** event name that shows more details about the event when clicked */

function EventListItem(event) {
  const listitem = document.createElement("li");
  const link = document.createElement("a");

  link.href = "#selected";
  link.textContent = event.name;

  link.addEventListener("click", async (e) => {
    e.preventDefault();
    await getEvent(event.id); // update selectedEvent
    render(); // refresh the UI so EventDetails shows up
    // optional: window.location.hash = "selected";
  });

  listitem.appendChild(link);
  listitem.classList.add("event");

  return listitem;
}

/** A list of names of all events */

function EventList() {
  // Create a <ul> element to hold the event list
  const ulElement = document.createElement("ul");

  // Loop through the list of events

  for (let i = 0; i < events.length; i++) {
    const event = events[i];

    // For each event, create an EventListItem
    const listItem = EventListItem(event);

    // Append the item to the <ul>
    ulElement.appendChild(listItem);
  }

  // Return the complete <ul> element

  return ulElement;
}

/** Detailed information about the selected event */
function EventDetails() {
  if (!selectedEvent) {
    const $p = document.createElement("p");
    $p.textContent = "Please select an event to learn more.";
    return $p;
  }

  // Create container element
  const $sec = document.createElement("section");

  // Create and append with details

  $sec.innerHTML = `
        <h3>${selectedEvent.name}</h3>
        <p>${selectedEvent.description}</p>
        <ul>
        <li><strong>ID:</strong> ${selectedEvent.id}</li>
        <li><strong>Date:</strong> ${formatDate(selectedEvent.date)}</li>
        <li><strong>Location:</strong> ${selectedEvent.location}</li>
        </ul>
    `;

  // Return the container element
  return $sec;
}

// === Render ===
function render() {
  const $app = document.querySelector("#app");
  $app.innerHTML = `
    <h1>Fullstack Events</h1>
    <main>
      <section>
        <h2>Lineup</h2>
        <EventList></EventList>
      </section>
      <section id="selected">
        <h2>Event Details</h2>
        <EventDetails></EventDetails>
      </section>
    </main>
  `;
  $app.querySelector("EventList").replaceWith(EventList());
  $app.querySelector("EventDetails").replaceWith(EventDetails());
}

async function init() {
  await getEvents();
  render();
}

init();
