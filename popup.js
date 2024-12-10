document.getElementById("fetch-orders").addEventListener("click", () => {
    // Get the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];

        // Inject a script to retrieve localStorage data from the active tab
        chrome.scripting.executeScript(
            {
                target: { tabId: activeTab.id },
                func: () => ({
                    access_token: localStorage.getItem("access_token"),
                    deviceId: localStorage.getItem("deviceId"),
                }),
            },
            (results) => {
                if (results && results[0] && results[0].result) {
                    const { access_token, deviceId } = results[0].result;

                    if (!access_token || !deviceId) {
                        return displayError("Failed to retrieve required data from localStorage.");
                    }

                    // Process and strip the token if needed
                    const strippedToken =
                        access_token.startsWith('"') && access_token.endsWith('"')
                            ? access_token.slice(1, -1)
                            : access_token;

                    // Send the message to background.js to fetch orders
                    chrome.runtime.sendMessage(
                        {
                            type: "GET_ORDERS",
                            access_token: strippedToken,
                            deviceId,
                        },
                        (response) => {
                            if (!response || !response.orders) {
                                return displayError("Failed to fetch orders. Please try again.");
                            }
                            calculateAndDisplayStats(response.orders);
                            displayOrders(response.orders);
                        }
                    );
                } else {
                    return displayError("Failed to execute script to retrieve localStorage.");
                }
            }
        );
    });
});

function calculateAndDisplayStats(orders) {
    const statsContainer = document.getElementById("stats-container") || document.createElement("div");
    statsContainer.id = "stats-container";
    document.body.insertBefore(statsContainer, document.getElementById("orders-container") || document.createElement("div"));

    let totalAmountSpent = 0;
    let totalCompletedOrders = 0;
    let totalRefundedOrders = 0;

    orders.forEach((order) => {
        if (order.status) {
            totalAmountSpent += order.orderTotal;
            totalCompletedOrders++;
        } else {
            totalRefundedOrders++;
        }
    });

    statsContainer.innerHTML = `
        <h3>Order Summary</h3>
        <p>Total Orders: ${orders.length}</p>
        <p>Total Completed Orders: ${totalCompletedOrders}</p>
        <p>Total Refunded Orders: ${totalRefundedOrders}</p>
        <p>Total Amount Spent: ₹${totalAmountSpent.toFixed(2)}</p>
    `;
}

function displayOrders(orders) {
    const ordersContainer = document.getElementById("orders-container");
    ordersContainer.innerHTML = "";

    if (orders.length === 0) {
        ordersContainer.innerHTML = "<p>No orders found.</p>";
        return;
    }

    orders.forEach((order) => {
        const orderElement = document.createElement("div");
        orderElement.classList.add("order");

        orderElement.innerHTML = `
            <div class="order-header">Order ID: ${order.orderId}</div>
            <p>Date: ${order.orderDate}</p>
            <p>Total: ₹${order.orderTotal}</p>
            <p>Status: ${order.status ? "Completed" : "Refunded"}</p>
            <p>Items:</p>
            <ul>
                ${order.items
                .map(
                    (item) =>
                        `<li>${item.itemName} - ₹${item.price} <img src="${item.imageUrl}" alt="${item.itemName}" width="50"></li>`
                )
                .join("")}
            </ul>
        `;

        ordersContainer.appendChild(orderElement);
    });
}

function displayError(message) {
    const ordersContainer = document.getElementById("orders-container");
    ordersContainer.innerHTML = `<p style="color: red;">${message}</p>`;
}
