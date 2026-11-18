from dataclasses import dataclass, field
from enum import Enum
from typing import List
from datetime import datetime

class OrderStatus(Enum):
    PLACED = 'PLACED'
    CONFIRMED = 'CONFIRMED'
    PREPARING = 'PREPARING'
    OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY'
    DELIVERED = 'DELIVERED'

@dataclass
class MenuItem:
    item_id: str
    name: str
    price: float

@dataclass
class Restaurant:
    restaurant_id: str
    name: str
    menu: List[MenuItem] = field(default_factory=list)

@dataclass
class Customer:
    customer_id: str
    name: str
    delivery_address: str

@dataclass
class Order:
    order_id: str
    customer: Customer
    restaurant: Restaurant
    items: List[MenuItem]
    status: OrderStatus = OrderStatus.PLACED

    def calculate_total(self) -> float:
        return sum(item.price for item in self.items) + 40.0

if __name__ == '__main__':
    c = Customer('C101', 'Mithun', 'SIMATS Campus')
    r = Restaurant('R50', 'Royal Kitchen', [MenuItem('M1', 'Biryani', 240.0), MenuItem('M2', 'Paneer Tikka', 180.0)])
    ord = Order('ORD-902', c, r, r.menu)
    print(f'Order {ord.order_id} Total: ₹{ord.calculate_total()}')
