const fetchOrders = async (access_token, deviceId) => {
    const apiUrl = "https://tsb-mbaas.starbucksindia.net/api/order/transaction/v2/history?page=0&pageSize=100000&type=all";

    try {
        const response = await fetch(apiUrl, {
            headers: {
                "accept": "application/json, text/plain, */*",
                "authorization": `Bearer ${access_token}`,
                "device-meta-info": JSON.stringify({
                    appVersion: "5.0.4",
                    deviceCountry: "India",
                    deviceCity: "",
                    deviceId: deviceId,
                    deviceModel: "",
                    platform: "WEB",
                    deviceOSVersion: ""
                }),
            },
            referrer: "https://starbucks.in/",
            method: "GET",
            mode: "cors",
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch orders: ${response.statusText}`);
        }

        const rawData = await response.json();
        const orderList = rawData.response.transactions;

        const ordersToBeReturned = orderList.map(individualOrder => ({
            orderId: individualOrder.txnOid,
            orderDate: individualOrder.txnDate,
            orderTotal: individualOrder.totalOrderAmount,
            status: !individualOrder.isRefunded,
            items: individualOrder.items.map(individualItem => ({
                itemId: individualItem.id,
                itemName: individualItem.name,
                price: individualItem.price,
                imageUrl: individualItem.imageUrl
            }))
        }));

        return {
            orders: ordersToBeReturned
        };
    } catch (error) {
        console.error("Error fetching orders:", error);
        return { orders: [] };
    }
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "GET_ORDERS") {
        fetchOrders(message.access_token, message.deviceId).then((response) => {
            sendResponse(response);
        }).catch(error => {
            console.error("Error in message handler:", error);
            sendResponse({ orders: [] });
        });
        return true;
    }
});
