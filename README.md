# HostelHub — Accommodation Management System

HostelHub is an all-in-one property management system (PMS) designed for hostel owners, front-desk administrators, and maintenance teams. Built with a high-density, modern interface in a **Deep Slate** and **Vibrant Teal** design palette, it delivers complete operational visibility and rapid workflow execution.

---

## 🌟 Key Features & Core Modules

### 1. 📊 Admin Dashboard (Mission Control)
- **Real-Time Occupancy Gauge:** Interactive circular SVG gauge showing current occupancy percentage, active rooms vs total capacity, and bed counts.
- **Weekly Revenue Analytics:** Snapshot of financial health (\$12,450, +14.2% growth) with an interactive 7-day revenue and occupancy breakdown bar visualization.
- **Urgent Action Center & Popover:** Real-time operational alerts for maintenance issues, late check-in requests, and VIP housekeeping with one-click resolution and staff assignment.
- **Quick Action Grid:** Instant shortcuts for Front Desk Walk-In check-in, Quick Invoice generation, Room Maintenance blocking, and Daily Night Audit export.
- **Live Activity Feed:** Chronological stream of transactions, guest check-ins, room cleaning inspections, and new bookings.

### 2. 🛏️ Room Management
- **High-Density Inventory Table & Visual Grid:** Instant toggle between detailed table view and visual room cards.
- **Granular Multi-Filters:** Filter by status (*Available*, *Occupied*, *Maintenance*), room category (*4-Bed Mixed Dorm*, *6-Bed Mixed Dorm*, *8-Bed Female Dorm*, *Private Deluxe*, *Twin Ensuite*, *Penthouse Suite*, etc.), housekeeping condition (*Clean*, *Needs Cleaning*, *In Progress*), and floor (*Floor 1, 2, 3*).
- **Multi-Select & Bulk Operations:** Floating action toolbar to bulk mark cleaned, bulk set available, or bulk block for maintenance.
- **Inline State Toggles:** One-click status change and housekeeping condition updates.
- **Room Configuration:** Create new inventory units and edit nightly rates or bed configurations.

### 3. 📅 Booking Calendar (Gantt-Style Timeline)
- **Visual Gantt Matrix:** Unit/Bed rows on the Y-axis with a sticky header and date columns across a configurable 7-day, 14-day, or 21-day timeline span.
- **Color-Coded Reservation Blocks:** Visual distinction for *Confirmed* (Teal/Green), *Checked In* (Deep Teal/Indigo), *Pending* (Amber), and *Maintenance Downtime* (Red striped).
- **Click-to-Book:** Click any unoccupied timeline cell to immediately open the pre-populated reservation workflow for that room and date.
- **Reservation Details:** Click any booking bar to view stay details, payment status, and execute fast guest check-in or checkout.

### 4. 👥 Guest Directory & CRM
- **Centralized Guest Database:** Search across guest names, email addresses, phone numbers, and passport IDs.
- **Loyalty Program:** Tiered loyalty tracking (*🥈 Silver*, *🥇 Gold*, *💎 Platinum*) with accumulated reward points and lifetime spend records.
- **Slide-Over Profile Drawer:** Detailed personal records, ID verification, stay preferences (bed placement, dietary needs), internal staff notes, and complete booking history.
- **Communication Simulator:** 1-click SMS access notice and email confirmation dispatch.
- **CSV Data Export:** Generate and download a formatted CSV guest directory with one click.

### 5. ⚡ Global Command Palette & Interactivity
- **Command Palette (`Ctrl+K` / `Cmd+K` / `/`):** Spotlight search to quickly jump to rooms, guests, and views with arrow keys and Enter.
- **Theme Switcher:** Clean Light Mode and Cyber Slate Dark Mode with persistent memory.
- **Web Audio Sound Effects:** Subtle audio feedback for bookings, status toggles, and alert resolutions.

---

## 🛠️ Technology Architecture

- **Frontend:** Semantic HTML5, Tailwind CSS, Custom Design System tokens (`css/styles.css`).
- **State Store:** `HostelDataStore` (`js/data.js`) with persistent `localStorage` synchronization.
- **Modular Architecture:**
  - `js/dashboard.js`: Dashboard renderers, SVG gauge, alerts, and activity feed.
  - `js/rooms.js`: Inventory filtering, table/grid views, multi-select, and housekeeping logistics.
  - `js/calendar.js`: Gantt timeline matrix engine and date math.
  - `js/guests.js`: CRM table, profile slide-over drawer, and CSV generation.
  - `js/app.js`: Command palette, audio synthesis, routing, modals, and toast notifications.

---

## 🚀 How to Run

1. Open `index.html` directly in any modern web browser or serve via `python -m http.server 8000`.
2. All dependencies are loaded via CDN and local modules — zero build step required.
3. Reset demo state anytime using the **Reset Demo State** button in the sidebar.
