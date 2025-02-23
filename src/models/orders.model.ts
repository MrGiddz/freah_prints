import { Base, Document } from "../data/config/base-model";

export interface OrderItem {
  apparelCode: string;
  sizeId: string;
  quantity: number;
  vendorId: string;
}

export interface CustomerOrder {
  customerName?: string;
  items: OrderItem[];
  totalPrice?: number;
  status?: "pending" | "fulfilled" | "canceled";
}

export interface CustomerOrderDocument extends Document<CustomerOrder> {}

export class Order extends Base<CustomerOrderDocument> {
  constructor() {
    super("orders");
  }

  /**
   * Creates a new order.
   */
  async create(data: CustomerOrder): Promise<CustomerOrderDocument> {
    const order = await super.create(data);

    // Convert plain object to a CustomerOrderDocument instance
    return this.attachMethods(order);
  }

  /**
   * Finds a order by a given condition and returns a CustomerOrderDocument instance.
   */
  async findOne(
    condition: Partial<CustomerOrder>
  ): Promise<CustomerOrderDocument | undefined> {
    const user = await super.findOne(condition);
    return user ? this.attachMethods(user) : undefined;
  }

  /**
   * Finds a order by id and returns a CustomerOrderDocument instance.
   */
  async findById(id: string): Promise<CustomerOrderDocument | undefined> {
    const order = await super.findById(id);
    return order ? this.attachMethods(order) : undefined;
  }

  private attachMethods(user: Document<CustomerOrder>): CustomerOrderDocument {
    return {
      ...user,
    } as CustomerOrderDocument;
  }
}

const OrderModel = new Order();

export default OrderModel;
