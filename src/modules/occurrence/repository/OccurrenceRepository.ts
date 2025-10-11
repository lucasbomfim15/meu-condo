import { PrismaClient } from "@prisma/client/extension";
import { CreateOccurrenceDTO } from "../dtos/request/CreateOccurrenceDTO";
import { occurrence } from "@prisma/client";
import { OccurrenceResponseDTO } from "../dtos/response/OccurrenceResponseDTO";
import { env } from "process";

export class OccurrenceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(
    createOccurrenceDTO: CreateOccurrenceDTO,
    userId: string,
    criticality: string
  ): Promise<occurrence> {
    return await this.prisma.occurrence.create({
      data: {
        title: createOccurrenceDTO.title,
        description: createOccurrenceDTO.description,
        type: createOccurrenceDTO.type,
        user: { connect: { id: userId } },
        condominium: { connect: { id: createOccurrenceDTO.condominiumId } },
        criticality
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

  async definesCriticality(description: string) : Promise<string>{

    const candidateLabels = ['Alto', 'Medio', 'Baixo']

   const response = await fetch("https://api-inference.huggingface.co/models/facebook/bart-large-mnli", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.HUGGINGFACE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: description,
          parameters: {
            candidate_labels: candidateLabels,
            multi_label: false,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (!data?.labels?.length || !data?.scores?.length) {
        throw new Error("Resposta inesperada da API Hugging Face.");
      }

      return data.labels[0] as "Alto" | "Médio" | "Baixo";
  }

}
