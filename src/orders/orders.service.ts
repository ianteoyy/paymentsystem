import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Order } from './orders.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel('Order') private readonly orderModel: Model<Order>,
  ) {}

  async insertOrder(orderedBy: string, productCode: string, price: number): Promise<string> {
    const newOrder = new this.orderModel({
      orderedBy,
      orderStatus: 'created',
      productCode,
      price
    });
    const result = await newOrder.save();
    return result.id as string;
  }

  async getOrders(): Promise<Order[]> {
    const orders = await this.orderModel.find().exec();

    return orders.map(order => ({
      id: order.id,
      orderedBy: order.orderedBy,
      productCode: order.productCode,
      orderStatus: order.orderStatus,
      price: order.price
    })) as Order[];
  }

  async getOrderById(
    orderId: string,
  ): Promise<{
    id: string;
    orderStatus: 'cancelled' | 'delivered' | 'confirmed' | 'created';
    orderedBy: string;
    productCode: string;
    price: number;
  }> {
    const order = await this.findOrder(orderId);
    return {
      id: order.id,
      orderStatus: order.orderStatus,
      orderedBy: order.orderedBy,
      productCode: order.productCode,
      price: order.price,
    };
  }

  async cancelOrder(orderId: string): Promise<void> {
    const updatedOrder = await this.findOrder(orderId);

    switch (updatedOrder.orderStatus) {
      case 'cancelled':
        throw new BadRequestException('Order has already been cancelled!');
      case 'delivered':
        throw new BadRequestException('Order is already being delivered!');
      default:
        // confirmed/created
        updatedOrder.orderStatus = 'cancelled';
        break;
    }

    updatedOrder.save();
  }

  private async findOrder(id: string): Promise<Order> {
    let order;
    try {
      order = await this.orderModel.findById(id);
    } catch (error) {
      throw new NotFoundException('Order not found!');
    }
    if (!order) {
      throw new NotFoundException('Order not found!');
    }

    return order;
  }
}
