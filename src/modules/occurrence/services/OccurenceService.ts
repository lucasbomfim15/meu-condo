import { occurrence } from "@prisma/client";
import { CreateOccurrenceDTO } from "../dtos/request/CreateOccurrenceDTO";
import { OccurrenceRepository } from "../repository/OccurrenceRepository";
import { OccurrenceResponseDTO } from "../dtos/response/OccurrenceResponseDTO";
import { OccurrenceMapper } from "../mappers/OccurrenceMapper";

export class OccurenceService {
  constructor(private readonly occurenceRepository: OccurrenceRepository) {}

  async create(
    createOccurrenceDTO: CreateOccurrenceDTO,
    userId: string
  ): Promise<OccurrenceResponseDTO> {
    const occurrenceExists = await this.occurenceRepository.findByTitle(
      createOccurrenceDTO.title
    );
    if (occurrenceExists) {
      throw new Error("this occurrence already exists");
    }
    const criticaly = await this.occurenceRepository.definesCriticality(createOccurrenceDTO.description);
    console.log('Determined Criticality:', criticaly); // Debug
    const occurence = await this.occurenceRepository.create(
      createOccurrenceDTO,
      userId,
      criticaly
    );
    console.log('Created Occurrence Model: - Service', occurence); // Debug
    const retorno = OccurrenceMapper.toResponseDTO(occurence);
    console.log('Mapped Occurrence DTO: - Service', retorno); // Debug
    return retorno
  }

  async listAll(): Promise<OccurrenceResponseDTO[]> {
    const occurences = await this.occurenceRepository.find();

    return OccurrenceMapper.toResponseDTOs(occurences);
  }

  async findById(id: string): Promise<OccurrenceResponseDTO> {
    const occurrenceExists = await this.occurenceRepository.findById(id);
    if (!occurrenceExists) {
      throw new Error("this occurrence not exists");
    }

    return OccurrenceMapper.toResponseDTO(occurrenceExists);
  }

  async listByUser(userId: string): Promise<OccurrenceResponseDTO[]> {
    const occurrences = await this.occurenceRepository.findByUserId(userId);
    return OccurrenceMapper.toResponseDTOs(occurrences);
  }

  async update(
    id: string,
    data: CreateOccurrenceDTO
  ): Promise<OccurrenceResponseDTO> {
    const occurrenceExists = await this.occurenceRepository.findById(id);
    if (!occurrenceExists) {
      throw new Error("this occurrence not exists");
    }

    const updatedOccurence = await this.occurenceRepository.update(id, data);

    return OccurrenceMapper.toResponseDTO(updatedOccurence);
  }

  async delete(id: string): Promise<void> {
    const occurrence = await this.occurenceRepository.findById(id);

    if (!occurrence) {
      throw new Error("this occurrence not exists");
    }

    await this.occurenceRepository.delete(id);
  }
}
