import { PrismaClient, User } from "@prisma/client";
import { CreateUserRequestDTO } from "../dtos/request/CreateUserRequestDTO";
import { UpdateUserRequestDTO } from "../dtos/request/UpdateUserRequestDTO";

interface UpdateAvatarData {
  avatarUrl: string | null;
  avatarFileName: string | null;
  avatarMimeType: string | null;
  avatarSize: number | null;
}

// Tipo para o retorno do findById com select
interface UserWithAvatar {
  id: string;
  fullName: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  avatarFileName: string | null;
  avatarMimeType: string | null;
  avatarSize: number | null;
  userType: import("@prisma/client").UserType;
}

// Tipo para o retorno do updateAvatar
interface UserAvatarResponse {
  id: string;
  fullName: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  avatarFileName: string | null;
  userType: import("@prisma/client").UserType;
}

export class UserRepository {
  constructor(private readonly prismaClient: PrismaClient) {}

  async createUser(data: CreateUserRequestDTO): Promise<User> {
    return await this.prismaClient.user.create({
      data,
    });
  }

  async findById(id: string): Promise<UserWithAvatar | null> {
    return await this.prismaClient.user.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        username: true,
        email: true,
        avatarUrl: true,
        avatarFileName: true,
        avatarMimeType: true,
        avatarSize: true,
        userType: true,
      }
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.prismaClient.user.findUnique({
      where: { email },
    });
  }

  async findAll() {
    return this.prismaClient.user.findMany();
  }

  async delete(id: string) {
    await this.prismaClient.user.delete({ where: { id } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return await this.prismaClient.user.findUnique({
      where: {
        username
      },
    });
  }

  async update(id: string, data: UpdateUserRequestDTO): Promise<User> {
    return await this.prismaClient.user.update({
      where: { id },
      data,
    });
  }

  async findByPhoneNumber(phoneNumber: string): Promise<User | null> {
    return await this.prismaClient.user.findUnique({
      where: { phoneNumber },
    });
  }

  async updateAvatar(userId: string, avatarData: UpdateAvatarData): Promise<UserAvatarResponse> {
    return await this.prismaClient.user.update({
      where: { id: userId },
      data: avatarData,
      select: {
        id: true,
        fullName: true,
        username: true,
        email: true,
        avatarUrl: true,
        avatarFileName: true,
        userType: true,
      }
    });
  }
}
