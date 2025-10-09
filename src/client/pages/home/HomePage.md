This file is intended to explain the current state of the home page and its functionality.

## Current State (with expanded ideas around the objects)

### Control Bar:

- Alert Box:

  - Needs to expose an api endpoint to provide updates to the user.
  - Needs a modal designed to open if the user clicks
  - There was talk about badge icons and integrating them.

- Search Bar:

  - The team discussed implementing an "always" present view for searching, reducing the extra clicks it currently requires.
  - The search bar still needs a fuzzy search implemented.
  - Still needs to sync with the filter option to ensure:
    - It searches when filters are active
    - Searches without filters active

- Sort By Menu:

  - Currently displays the selected menu option with a button to clear filters.
    - Needs expanded to apply sorting to the data that's presented to the user.
    - Needs to be expanded to work alongside and independent of the search bar's query string.

- Multi Select Toggle:

  - Cards can be multi-selected, and the state is cleared when the user cycles between multi vs single select
  - When multiple cards are selected, we build a list of selected cards in the home page (selectedCards), which we can use to do batch operations. For now, it's just the static list.
  - When multiple cards are selected, we need to define and display quick options for the user to perform some actions, such as trash, archive, sort to a new column, etc., with an undo button.

- Info Modal:
  - Once the home page starts leaning towards a finalized state, the info modal needs to be developed for it.
  - The team needs to decide on the expected structure and flow for the info modal.
  - Currently, the modal opens and dismisses when the button is cycled, or through the modal's close button.

### Kan Ban Board

- Kanban Column:

  - Currently, the columns host a header that includes a static plus button (I'm not sure what the plus button is intended for), a title, and the active count of the children it's presenting.
  - The Count -> is related to the number of cards assigned to the column, it's reactive and updates when cards are added or removed.

  - Cards: Currently, the column can hold JobCard objects and support transfer from one column to another.
  - The columns are currently set up to use a shared height (the tallest column sets the minimum height for all columns). The preference would be that the column fills the view as a minimum, and if one expands beyond that, all columns size to match.

- Job Cards:
  - Job Cards currently have a primary title (the job title) with a hidden multi-select checkbox and a down chevron.
  - When the card is tapped, we expand to show nested content for the job in question (placeholder for now)
  - When multi-select is active and the card is selected, it displays a checked state and updates the selected cards array in the home page (adding and removing)
  - Job Cards support informing the Home Page if the user drags them across the screen.

## Still Needs Implementation:

### Data Retrieval:

- We need to integrate a proper api retrieval process (even for the mock data) to make it easy to integrate a DB call at a later date.
- This api call will exist inside of home.meta.tsx
- It should be an async function that can fetch data from a provided URL/link.
  - Ex: await fetch('./MockJobCards.json') or await fetch(dbURL)
- It needs to have proper error handling

**_As of right now, we are calling data from MockJobCards.json directly as an import. This works for building out base functionality, but ideally, we need to implement a mock api call for better generalization._**

### Current flow of the data is as follows:

- Data is pulled from a mock
- We iterate through all rows and create Job Card Objects.
- Each job card receives a data row and is provided an instance of the drag functionality.
- We then sort the cards by their provided column
- Columns are created and provided with a list of the cards that belong with them (as children).
  - Columns also provided the mouse event function to determine if the user is hovering over it.
- If the user drags on a card within a column, the card itself reports to the home page that it's being dragged.
- When the user drags that card over a column, the column reports to the home page that it's the current column the card is over.
- When the user drops the card over a column, and it's not the column of origin for the card, we then remove that card from its origin column and insert it into the new column.
- If multi-select is active, the cards will display checkboxes that append or remove the job card from an array maintained by the HomePage on selected cards (for future batch operations)

**These updates are purely visual. They don't write to the mock data file. True functionality would be writing to the DB to sync the updates with the user's action. Ideally, we process the visual changes, then call a sync function to update the database based on the changes made by the user. This way, we display immediate updates to the user.**

Can you update this to get it right
