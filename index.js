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
const COHORT = "/2507"; // change to your cohort if needed
const API = BASE + COHORT; // cohort-level base

const EVENTS_API = API + "/events";
const GUESTS_API = API + "/guests";
const RSVPS_API = API + "/rsvps";

// === State ===
let events = [];
let selectedEvent;
let guests = [];
let rsvps = [];

/** Updates state with all events from the API */
async function getEvents() {
  try {
    const response = await fetch(EVENTS_API);
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
    const response = await fetch(`${EVENTS_API}/${id}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const eventdata = await response.json();
    selectedEvent = eventdata.data;
  } catch (e) {
    console.error(`Failed to fetch event!`);
  }
}

async function getGuests() {
  try {
    const res = await fetch(GUESTS_API);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    guests = data.data;
  } catch (e) {
    console.error("Failed to fetch guests!", e);
    guests = [];
  }
}

async function getRsvps() {
  try {
    const res = await fetch(RSVPS_API);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    rsvps = data.data;
  } catch (e) {
    console.error("Failed to fetch RSVPs!", e);
    rsvps = [];
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

function guestsForEvent(eventId) {
  if (!eventId) return [];

  const guestIds = new Set(
    rsvps.filter((r) => r.eventId === eventId).map((r) => r.guestId)
  );

  return guests.filter((g) => guestIds.has(g.id));
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

  // create for rsvps attending
  const attending = guestsForEvent(selectedEvent.id);

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
          <h4>Guests</h4>
      ${
        attending.length
          ? `<ul>${attending
              .map((g) => `<li>${g.name} (${g.email})</li>`)
              .join("")}</ul>`
          : `<p>No RSVPs yet.</p>`
      }
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
  // Prefetch everything so EventDetails can show guests immediately
  await Promise.all([getEvents(), getGuests(), getRsvps()]);
  render();
}

init();
