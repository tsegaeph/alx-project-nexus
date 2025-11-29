// src/utils/ordersStorage.js
export function getCustomerOrders() {
  try {
    return JSON.parse(localStorage.getItem("customer_orders")) || [];
  } catch {
    return [];
  }
}

export function saveCustomerOrders(orders) {
  try {
    localStorage.setItem("customer_orders", JSON.stringify(orders));
  } catch {}
}

export function getSellerOrders() {
  try {
    return JSON.parse(localStorage.getItem("seller_orders")) || [];
  } catch {
    return [];
  }
}

export function saveSellerOrders(orders) {
  try {
    localStorage.setItem("seller_orders", JSON.stringify(orders));
  } catch {}
}
