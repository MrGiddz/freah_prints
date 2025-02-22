import { Base, Document } from "../db/config/base-model";

export interface OrderItem {
  apparelId: string;
  size: string;
  quantity: number;
}

export interface CustomerOrder {
  orderId: string;
  customerName?: string;
  items: OrderItem[];
  totalPrice: number;
  status: "pending" | "fulfilled" | "canceled";
}

export interface CustomerOrderDocument extends Document<CustomerOrder> {}

export class OrderModel extends Base<CustomerOrderDocument> {
  constructor() {
    super("orders");
  }
}

const userModel = new OrderModel();
