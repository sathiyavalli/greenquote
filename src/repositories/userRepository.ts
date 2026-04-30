import { prisma } from '@/lib/prisma';
import type { User } from '@prisma/client';

export const userRepository = {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  },

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  },

  async create(data: {
    email: string;
    password: string;
    fullName: string;
    role?: string;
  }): Promise<User> {
    return prisma.user.create({ data });
  },

  async existsByEmail(email: string): Promise<boolean> {
    const count = await prisma.user.count({ where: { email } });
    return count > 0;
  },
};
