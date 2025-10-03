import { PollRepository } from "../repository/PollRepository";
import { CreatePollDTO } from "../dtos/request/CreatePollDTO";
import { VoteDTO } from "../dtos/request/VoteDTO";
// ...existing code...
import { PollMapper } from "../mapper/PollMapper";
import { Poll } from "@prisma/client";

export class PollService {
  constructor(private readonly repo: PollRepository) {}

  async create(dto: CreatePollDTO, userId: string) {
    const created = await this.repo.createPoll(dto, userId);
    const full = await this.repo.findByIdWithOptionsAndCounts(created.id);
    return PollMapper.toResponseDTO(full);
  }

  async get(pollId: string) {
    const poll = await this.repo.findByIdWithOptionsAndCounts(pollId);
    if (!poll) throw new Error("poll not found");
    return PollMapper.toResponseDTO(poll);
  }

  async listByCondo(condominiumId: string) {
    const polls = await this.repo.listByCondominium(condominiumId);
    const pollsWithCounts = await Promise.all(
      polls.map(async (p: Poll) => await this.repo.findByIdWithOptionsAndCounts(p.id))
    );
    return PollMapper.toResponseDTOs(pollsWithCounts);
  }

  async vote(pollId: string, dto: VoteDTO, userId: string) {
    const existing = await this.repo.findVote(pollId, userId);
    if (existing) throw new Error("user already voted");
    await this.repo.createVote(pollId, dto.optionId, userId);
    const updated = await this.repo.findByIdWithOptionsAndCounts(pollId);
    return PollMapper.toResponseDTO(updated);
  }
}