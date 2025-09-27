// ...existing code...
import { Request, Response, NextFunction } from "express";
import { PollService } from "../service/PollService";
import { CreatePollDTO } from "../dtos/request/CreatePollDTO";
import { VoteDTO } from "../dtos/request/VoteDTO";
import { Poll } from "@prisma/client";

export class PollController {
  constructor(private readonly service: PollService) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body as CreatePollDTO;
      const userId = (req as any).user.userId;
      const poll = await this.service.create(body, userId);
      res.status(201).json(poll);
    } catch (err) {
      next(err);
    }
  }

  async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const poll = await this.service.get(id);
      res.status(200).json(poll);
    } catch (err) {
      next(err);
    }
  }

  async listByCondo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { condominiumId } = req.params;
      const polls = await this.service.listByCondo(condominiumId);
      res.status(200).json(polls);
    } catch (err) {
      next(err);
    }
  }

  async vote(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const body = req.body as VoteDTO;
      const userId = (req as any).user.userId;
      const result = await this.service.vote(id, body, userId);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }
}
// ...existing code...