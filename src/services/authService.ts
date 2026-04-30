import bcrypt from 'bcryptjs';
import { userRepository } from '@/repositories/userRepository';
import { generateToken } from '@/lib/jwt';
import { ConflictError, AuthenticationError } from '@/utils/errors';
import type { RegisterInput, LoginInput } from '@/utils/validation';

export const authService = {
  async register(input: RegisterInput) {
    const exists = await userRepository.existsByEmail(input.email);
    if (exists) {
      throw new ConflictError('An account with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(input.password, 12);

    const user = await userRepository.create({
      email: input.email,
      fullName: input.fullName,
      password: hashedPassword,
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  },

  async login(input: LoginInput) {
    const user = await userRepository.findByEmail(input.email);
    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    const isValid = await bcrypt.compare(input.password, user.password);
    if (!isValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  },
};
