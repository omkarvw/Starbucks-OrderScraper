# Starbucks Order Tracker Chrome Extension
## Overview
This Chrome extension allows users to track their Starbucks orders directly from the browser popup. It provides detailed order statistics such as total orders, completed orders, refunded orders, and the total amount spent. The data is fetched from Starbucks' API and displayed in a user-friendly format.

# Files and Functions
## background.js

 Purpose: The background script serves as the service worker for the extension. It handles communication between the popup and the API to fetch order data.

## Key Functions:

### fetchOrders(access_token, deviceId):

- Purpose: Sends a GET request to the Starbucks API to retrieve order history.
- Parameters:
    - access_token: User’s authorization token.
    - deviceId: User’s device ID.
- Returns: A promise containing the list of orders fetched from the API.
- Process:
    - Sends a fetch request to the API endpoint https://tsb-mbaas.starbucksindia.net/api/order/transaction/v2/history with the necessary headers.
    - Includes the authorization header with the Bearer token and device-meta-info header containing device details.
    - If the response is not OK, returns an empty order list.
    - Parses the response as JSON to extract order data.
    - Maps through the transaction list to extract relevant order details (ID, date, total amount, status, and items).
    - Returns the processed data.
### Message Listener (chrome.runtime.onMessage.addListener):

- Purpose: Listens for messages from the popup script.
- Messages: The background script listens for a GET_ORDERS message.
- Response: Once the data is fetched, it sends the data back to the popup script.
- Process:
    - Upon receiving the GET_ORDERS message, it calls fetchOrders with the provided access_token and deviceId.
    - Sends the fetched data back through sendResponse.
      
## popup.js

## Purpose: This script runs in the browser extension popup. It manages the interaction between the user and the fetched order data.

## Key Functions:

### Button Event Listener (document.getElementById("fetch-orders").addEventListener("click")):

- Purpose: To initiate the order fetch process when the user clicks the button.
- Process:
    - Retrieves access_token and deviceId from localStorage.
    - Strips any surrounding quotes from the access_token.
    - Sends a message to the background script (chrome.runtime.sendMessage) with the GET_ORDERS type, the strippedToken, and deviceId.
    - Waits for the response from the background script.
    - If the response does not contain orders, it displays an error message.
    - Otherwise, it calculates and displays the order statistics and order details.

### calculateAndDisplayStats(orders):

- Purpose: To calculate the order statistics and display them in the popup.
- Parameters:
    - orders: An array of order objects fetched from the API.
- Process:
    - Creates a new container for the statistics if it doesn’t already exist.
    - Initializes variables to store totals:
    - totalAmountSpent: Sum of the total order amounts.
    - totalCompletedOrders: Count of completed orders.
    - totalRefundedOrders: Count of refunded orders.
    - Loops through the order list to update totals.
    - Displays the calculated statistics in the popup.
### displayOrders(orders):

- Purpose: To display individual order details in the popup.
- Parameters:
    - orders: An array of order objects fetched from the API.
- Process:
    - Clears any previous content in the orders-container.
    - If there are no orders, displays a "No orders found" message.
    - For each order, creates a new card element.
    - Populates the card with order details (ID, date, total amount, status, and items).
    - Appends the card to the orders-container.
### displayError(message):

- Purpose: To display an error message in the popup.
- Parameters:
    - message: Error message string.
- Process:
    - Clears any existing content in the orders-container.
    - Displays the provided error message styled in red.
 
## Example Usage
- Install the extension in Chrome.
- Click on the extension icon to open the popup.
- Click "Fetch Orders" to fetch the latest order data.
- View statistics and order details.
