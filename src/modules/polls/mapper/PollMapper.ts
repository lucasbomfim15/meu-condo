import { Poll, PollOption } from "@prisma/client";
import {  PollResponseDTO } from "../dtos/response/PollResponseDTO";
import { PollOptionResponseDTO } from "../dtos/response/PollOptionResponseDTO";

export class PollMapper {
  static toResponseDTO(poll: any): PollResponseDTO {
    // poll.options deve vir com votes incluído (array) para contar
    const options: PollOptionResponseDTO[] = (poll.options || []).map((o: any) => ({
      id: o.id,
      text: o.text,
      votesCount: Array.isArray(o.votes) ? o.votes.length : (o._count?.votes ?? 0),
    }));

    return {
      id: poll.id,
      title: poll.title,
      description: poll.description ?? null,
      status: poll.status,
      endsAt: poll.endsAt ? new Date(poll.endsAt) : null,
      options,
      createdAt: new Date(poll.createdAt),
      updatedAt: new Date(poll.updatedAt),
      condominiumId: poll.condominiumId,
      creatorId: poll.creatorId,
    };
  }

  static toResponseDTOs(polls: any[]): PollResponseDTO[] {
    return (polls || []).map((p) => this.toResponseDTO(p));
  }
}