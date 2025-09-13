import { PrismaClient } from "@prisma/client/extension";
import { CreateOccurrenceDTO } from "../dtos/request/CreateOccurrenceDTO";
import { occurrence } from "@prisma/client";
import { OccurrenceResponseDTO } from "../dtos/response/OccurrenceResponseDTO";

export class OccurrenceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(
    createOccurrenceDTO: CreateOccurrenceDTO,
    userId: string
  ): Promise<occurrence> {
    return await this.prisma.occurrence.create({
      data: {
        title: createOccurrenceDTO.title,
        description: createOccurrenceDTO.description,
        type: createOccurrenceDTO.type,
        user: { connect: { id: userId } },
        condominium: { connect: { id: createOccurrenceDTO.condominiumId } },
      },
    });
  }

  async find(): Promise<occurrence[]> {
    return this.prisma.occurrence.findMany();
  }

  async findById(id: string): Promise<occurrence | null> {
    return this.prisma.occurrence.findUnique({
      where: { id },
    });
  }

  async findByUserId(userId: string): Promise<occurrence[]> {
  return this.prisma.occurrence.findMany({
    where: { userId },
  });
}

  async findByTitle(title: string): Promise<occurrence | null> {
    return this.prisma.occurrence.findFirst({
      where: { title },
    });
  }

  async delete(id: string): Promise<occurrence | null> {
    return this.prisma.occurrence.delete({
      where: { id },
    });
  }

  async update(id: string, data: CreateOccurrenceDTO): Promise<occurrence> {
    return await this.prisma.occurrence.update({
      where: { id },
      data,
    });
  }
}
