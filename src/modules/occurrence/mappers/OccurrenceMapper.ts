import { occurrence } from "@prisma/client";
import { OccurrenceResponseDTO } from "../dtos/response/OccurrenceResponseDTO";

export class OccurrenceMapper {
       static toResponseDTO(occurrenceModel: occurrence): OccurrenceResponseDTO {
        const dto = new OccurrenceResponseDTO();
        dto.id = occurrenceModel.id;
        dto.title = occurrenceModel.title;
        dto.description = occurrenceModel.description ?? null;
        dto.type = occurrenceModel.type;
        dto.status = occurrenceModel.status;
        dto.userId = occurrenceModel.userId;
        dto.condominiumId = occurrenceModel.condominiumId;
        dto.createdAt = occurrenceModel.createdAt;
        dto.updatedAt = occurrenceModel.updatedAt || undefined;
        return dto;
    }

    
    static toResponseDTOs(occurrences: occurrence[]): OccurrenceResponseDTO[] {
        return occurrences.map(this.toResponseDTO);
    }
}