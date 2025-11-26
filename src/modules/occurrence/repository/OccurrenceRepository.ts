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

    const candidateLabels = ['baixo', 'medio', 'alto'];
    const newEndpoint = "https://router.huggingface.co/hf-inference/models/joeddav/xlm-roberta-large-xnli";

    const response = await fetch(newEndpoint, {
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

    const data = await response.json();

    if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status} ${response.statusText}. Detalhes: ${JSON.stringify(data)}`);
    }

    const maxScoreIndex = data.scores.indexOf(Math.max(...data.scores));
    const predictedLabel = data.labels[maxScoreIndex];
    
    let finalCriticality: string;

    switch (predictedLabel.toLowerCase()) {
        case 'alto':
            finalCriticality = 'Alta';
            break;
        case 'medio':
            finalCriticality = 'Media';
            break;
        case 'baixo':
            finalCriticality = 'Baixa';
            break;
        default:
            throw new Error(`Rótulo de criticidade inesperado retornado: ${predictedLabel}`);
    }

    return finalCriticality;
}

}
