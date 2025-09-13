import { OccurrenceStatusType, OccurrenceType } from "@prisma/client";

export class OccurrenceResponseDTO {
    id: string;
    title: string
    description: string | null;
    type: OccurrenceType;
    status: OccurrenceStatusType;
    userId: string;
    condominiumId: string
    createdAt: Date;
    updatedAt: Date;
}