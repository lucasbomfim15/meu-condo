import { IsUUID } from "class-validator";

export class VoteDTO {
  @IsUUID("4")
  optionId: string;
}