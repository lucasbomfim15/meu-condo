import { PollOptionResponseDTO } from "./PollOptionResponseDTO";

export class PollResponseDTO {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  endsAt?: Date | null;
  options: PollOptionResponseDTO[];
  createdAt: Date;
  updatedAt: Date;
  condominiumId: string;
  creatorId: string;
}