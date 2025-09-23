import { NextFunction, Request, Response } from "express";
import { OccurenceService } from "../services/OccurenceService";
import { CreateOccurrenceDTO } from "../dtos/request/CreateOccurrenceDTO";
import { OccurrenceMapper } from "../mappers/OccurrenceMapper";

export class OccurenceController {
  constructor(private readonly occurenceService: OccurenceService) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    const body: CreateOccurrenceDTO = req.body;
    const userId = (req as any).user.userId;
    const occurence = await this.occurenceService.create(body, userId);
    const response = OccurrenceMapper.toResponseDTO(occurence);

    res.status(201).json(response);
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    const occurences = await this.occurenceService.listAll();
    const response = OccurrenceMapper.toResponseDTOs(occurences);

    res.status(200).json(response);
  }

  async findById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { id } = req.params;
    const ocurrence = await this.occurenceService.findById(id);
    const response = OccurrenceMapper.toResponseDTO(ocurrence);

    res.status(200).json(response);
  }

  async listMine(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const userId = (req as any).user.userId;
    const occurrences = await this.occurenceService.listByUser(userId);
    const response = OccurrenceMapper.toResponseDTOs(occurrences);
    res.status(200).json(response);
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;
    const ocurrence = await this.occurenceService.delete(id);

    res.status(204).send();
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;
    const updated = await this.occurenceService.update(
      id,
      req.body as CreateOccurrenceDTO
    );
    res.status(200).json(OccurrenceMapper.toResponseDTO(updated));
  }
}
