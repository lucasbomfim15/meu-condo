import { IsString, IsNotEmpty, IsOptional, IsArray, ArrayMinSize, IsUUID, IsDateString } from "class-validator";

export class CreatePollDTO {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @ArrayMinSize(2)
  @IsString({ each: true })
  options: string[];

  @IsUUID("4")
  condominiumId: string;

  @IsDateString()
  @IsOptional()
  endsAt?: string; // ISO date
}