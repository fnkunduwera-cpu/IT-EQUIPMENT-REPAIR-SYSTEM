NAMES NKUNDUWERA FELIX
REG: 25RP23306
GITHUB LINK:



# IT Equipment Repair Management System

Frontend workshop system for RP Karongi College, module ITLDF601 — Frontend development.

The repair center registers customers and equipment, opens repair tickets, assigns technicians, records diagnosis and costs, and tracks collection. There is no backend. All data lives in React state and browser localStorage.

## Technologies used

- React.js 18 with functional components
- Vite
- JavaScript ES6+
- React Router
- Material UI (MUI), including DataGrid, Stepper, Chips, Dialogs, and Snackbar
- Recharts
- Browser localStorage
- Animated login screen and page transitions

## Login

The app opens on a sign-in form. The session is stored in `irms_session` and survives refresh. Logout clears only the session, not repair data.

Demo accounts:

| Role | Email | Password |
| --- | --- | --- |
| Manager | admin@karongi-repair.rw | Admin@2026 |
| Desk Officer | officer@karongi-repair.rw | Officer@2026 |
| Technician | tech@karongi-repair.rw | Tech@2026 |

This is still frontend-only. Passwords are demo credentials in the browser, not a server login.

## Installation

```bash
cd it-repair-system
npm install
```

## How to run

```bash
npm run dev
```

Open the URL printed by Vite, usually http://localhost:5173.

Production build:

```bash
npm run build
npm run preview
```

## Main features

- Dashboard summary cards, workload, alerts, and six Recharts charts
- Customer, equipment, and technician CRUD with search, filter, sort, and pagination
- Customer, equipment, ticket, and technician detail pages
- Repair ticket creation with validation
- Technician assignment with workload shown before confirm
- Diagnosis linked to a ticket, including estimated cost
- Workflow Received → Diagnosis → Repairing → Ready → Collected
- Estimated vs actual cost, difference, and over-estimate warning
- Collection only when status is Ready
- Repair queue, payments, history, and filtered reports
- Print and CSV export on Reports
- Mock dataset seeded on first visit; Reset demo data restores it

## Repair workflow

Allowed forward transitions only:

1. Received — ticket created at intake
2. Diagnosis — requires an assigned technician
3. Repairing — requires a diagnosis record
4. Ready — requires a positive actual cost; collection status becomes Ready for Collection
5. Collected — only through the collection action

Skipping a stage is rejected. Each change stores date, time, staff, previous status, new status, and a history comment, then updates dashboard counts.

## Cost calculation rules

- Estimated cost is entered after diagnosis.
- Actual cost is entered when the repair is completed, before Ready.
- Cost difference = actual cost − estimated cost.
- Percentage difference = difference / estimated cost.
- Total estimated cost = sum of ticket estimated costs.
- Total actual cost = sum of ticket actual costs.
- A warning is shown when actual cost exceeds the estimate.

## Technician assignment process

1. Open a repair ticket.
2. Review equipment and the reported problem.
3. Open Assign technician.
4. Compare workload, for example “Alice Uwimana — 4 active repairs”.
5. Technicians On Leave or Inactive cannot be assigned.
6. Confirm. The ticket stores the technician and priority, and assignment history is written.

## Collection workflow

Collection is blocked unless repair status is Ready and collection status is Ready for Collection.

On confirm:

- collection status becomes Collected
- repair status becomes Collected
- collection date, time, and desk officer are stored
- a collection record and history row are written
- dashboard outstanding collection updates
- the change is saved to localStorage

## LocalStorage implementation

Separate keys:

- irms_customers
- irms_equipment
- irms_tickets
- irms_technicians
- irms_diagnoses
- irms_history
- irms_costs
- irms_collections
- irms_settings
- irms_session

Refreshing the browser keeps the data. Reset demo data clears those keys by replacing them with a new seed.

## Mock data

Generated on first load:

- 50 customers (CUS-2026-0001)
- 70 equipment records (EQP-2026-0001) with unique serial numbers
- 100 repair tickets (RPR-2026-0001)
- 15 technicians (TEC-2026-0001)
- 80 diagnosis records
- more than 150 history records
- 50 collected repairs

Statuses, priorities, brands, costs, and dates vary across 2026.


## Future improvements

- Receipt printing for collection
- Parts inventory
- SMS notification when equipment is ready
- Optional API backend if the center later needs multi-user access
