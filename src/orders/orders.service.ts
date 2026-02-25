import { BadRequestException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RequestUser } from '../common/request-user';
import { CreateGuestOrderDto, CreateOrderDto, UpdateOrderStatusDto } from './orders.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) { }

  async create(user: RequestUser, dto: CreateOrderDto) {
    const existingUser = await this.prisma.user.findUnique({ where: { id: user.id } });
    if (!existingUser) {
      throw new UnauthorizedException('Invalid x-user-id. Run prisma seed and use demo-customer or a real user id.');
    }

    return this.createForUser(existingUser.id, dto);
  }

  async createGuest(dto: CreateGuestOrderDto) {
    const phone = dto.phone.trim();

    const guest = await this.prisma.user.upsert({
      where: { phone },
      update: {},
      create: { phone },
    });

    return this.createForUser(guest.id, dto);
  }

  private async createForUser(userId: string, dto: CreateOrderDto) {
    const productIds = dto.items.map((i) => i.productId);
    const products = await this.prisma.product.findMany({ where: { id: { in: productIds }, isActive: true } });
    if (products.length !== productIds.length) {
      throw new BadRequestException('One or more products are invalid');
    }

    const map = new Map(products.map((p) => [p.id, p]));
    let total = 0;

    for (const item of dto.items) {
      const p = map.get(item.productId)!;
      if (p.stock < item.quantity) throw new BadRequestException(`Not enough stock for ${p.name}`);
      total += Number(p.price) * item.quantity;
    }

    return this.prisma.$transaction(async (tx) => {
      for (const item of dto.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return tx.order.create({
        data: {
          userId,
          paymentMethod: dto.paymentMethod,
          address: dto.address,
          notes: dto.notes,
          total,
          items: {
            create: dto.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: Number(map.get(item.productId)!.price),
            })),
          },
        },
        include: {
          user: true,
          items: { include: { product: true } },
        },
      });
    });
  }

  myOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getById(user: RequestUser, id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (user.role !== 'ADMIN' && order.userId !== user.id) throw new ForbiddenException();
    return order;
  }

  allOrders() {
    return this.prisma.order.findMany({
      include: {
        user: true,
        items: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async adminOrderById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        items: { include: { product: true } },
      },
    });

    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  updateStatus(id: string, dto: UpdateOrderStatusDto) {
    return this.prisma.order.update({
      where: { id },
      data: {
        status: dto.status,
        paymentConfirmed: dto.paymentConfirmed,
      },
      include: {
        user: true,
        items: { include: { product: true } },
      },
    });
  }
}
