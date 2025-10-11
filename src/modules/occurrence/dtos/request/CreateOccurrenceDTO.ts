import { OccurrenceType } from "@prisma/client";
import { IsEnum, isString, IsString, IsUUID, Length } from "class-validator";

export class CreateOccurrenceDTO {
    @IsString()
    @Length(3, 100, { message: "title must be between 3 and 50 characters" })
    title: string;

    @IsString()
    @Length(3, 100, { message: "description must be between 3 and 100 characters" })
    description: string;

    @IsEnum(OccurrenceType, { message: "Invalid occurence type" })
    type: OccurrenceType;

    @IsUUID("4", { message: "Invalid condominium ID" })
    condominiumId: string;
}
