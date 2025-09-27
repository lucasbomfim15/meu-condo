import { PrismaClient } from "@prisma/client/extension";
import { CreatePollDTO } from "../dtos/request/CreatePollDTO";
import { Poll, PollOption, Vote } from "@prisma/client";

export class PollRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createPoll(dto: CreatePollDTO, creatorId: string): Promise<Poll> {
    return this.prisma.poll.create({
      data: {
        title: dto.title,
        description: dto.description,
        creator: { connect: { id: creatorId } },
        condominium: { connect: { id: dto.condominiumId } },
        endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
        options: {
          create: dto.options.map((text) => ({ text })),
        },
      },
    });
  }

  async findByIdWithOptionsAndCounts(pollId: string) {
    return this.prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        options: {
          include: {
            votes: { select: { id: true } }
          }
        }
      }
    });
  }

  async listByCondominium(condominiumId: string) {
    return this.prisma.poll.findMany({
      where: { condominiumId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findVote(pollId: string, userId: string) {
    return this.prisma.vote.findUnique({ where: { pollId_userId: { pollId, userId } } as any });
  }

  async createVote(pollId: string, optionId: string, userId: string) {
    return this.prisma.vote.create({
      data: {
        poll: { connect: { id: pollId } },
        option: { connect: { id: optionId } },
        user: { connect: { id: userId } },
      },
    });
  }
}