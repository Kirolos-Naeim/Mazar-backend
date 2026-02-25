import { PaymentMethod, PrismaClient, Role } from '@prisma/client';
import { randomBytes, scryptSync } from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

async function main() {
  const admin = await prisma.user.upsert({
    where: { id: 'demo-admin' },
    update: {
      role: Role.ADMIN,
      name: 'Admin User',
      phone: '+201000000001',
      username: 'admin',
      passwordHash: hashPassword('admin123'),
      address: 'Head Office',
      location: 'Cairo',
    },
    create: {
      id: 'demo-admin',
      phone: '+201000000001',
      role: Role.ADMIN,
      name: 'Admin User',
      username: 'admin',
      passwordHash: hashPassword('admin123'),
      address: 'Head Office',
      location: 'Cairo',
    },
  });

  const customer = await prisma.user.upsert({
    where: { id: 'demo-customer' },
    update: {
      role: Role.CUSTOMER,
      name: 'Demo Customer',
      phone: '+201000000002',
      username: 'customer',
      passwordHash: hashPassword('customer123'),
      address: 'Nasr City, Cairo',
      location: 'Cairo',
    },
    create: {
      id: 'demo-customer',
      phone: '+201000000002',
      role: Role.CUSTOMER,
      name: 'Demo Customer',
      username: 'customer',
      passwordHash: hashPassword('customer123'),
      address: 'Nasr City, Cairo',
      location: 'Cairo',
    },
  });

  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();

  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Koshari Box',
        category: 'Egyptian',
        description: 'Classic Egyptian koshari bowl with crispy onions.',
        imageUrl: '/products/koshari.svg',
        price: 65,
        stock: 40,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Shawarma Wrap',
        category: 'Wraps',
        description: 'Chicken shawarma wrap with garlic sauce.',
        imageUrl: '/products/shawarma.svg',
        price: 85,
        stock: 30,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Molokhia Meal',
        category: 'Meals',
        description: 'Molokhia with rice and roasted chicken quarter.',
        imageUrl: '/products/molokhia.svg',
        price: 120,
        stock: 20,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Hawawshi Sandwich',
        category: 'Sandwiches',
        description: 'Spiced minced meat stuffed in baladi bread.',
        imageUrl: '/products/hawawshi.svg',
        price: 70,
        stock: 25,
      },
    }),
  ]);

  await prisma.order.create({
    data: {
      userId: customer.id,
      paymentMethod: PaymentMethod.COD,
      address: 'Nasr City, Cairo',
      notes: 'Call on arrival',
      status: 'PENDING',
      total: 150,
      items: {
        create: [
          { productId: products[0].id, quantity: 1, unitPrice: 65 },
          { productId: products[3].id, quantity: 1, unitPrice: 70 },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      userId: customer.id,
      paymentMethod: PaymentMethod.VODAFONE_CASH,
      paymentConfirmed: true,
      address: 'Maadi, Cairo',
      status: 'OUT_FOR_DELIVERY',
      total: 85,
      items: {
        create: [{ productId: products[1].id, quantity: 1, unitPrice: 85 }],
      },
    },
  });

  console.log('Seed completed');
  console.log('Admin user id:', admin.id, 'username: admin, password: admin123');
  console.log('Customer user id:', customer.id, 'username: customer, password: customer123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
