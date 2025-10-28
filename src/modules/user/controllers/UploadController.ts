import { Request, Response, NextFunction } from 'express';
import { UploadService } from '../services/UploadService';

export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  async uploadAvatar(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { userId } = req.params;
    const file = req.file;

    if (!file) {
      res.status(400).json({ 
        success: false,
        error: 'Nenhum arquivo enviado' 
      });
      return;
    }

    if (!userId) {
      res.status(400).json({ 
        success: false,
        error: 'ID do usuário é obrigatório' 
      });
      return;
    }

    const updatedUser = await this.uploadService.uploadUserAvatar({
      userId,
      file
    });

    res.status(200).json({
      success: true,
      message: 'Avatar atualizado com sucesso',
      data: updatedUser
    });
  }

  async removeAvatar(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({ 
        success: false,
        error: 'ID do usuário é obrigatório' 
      });
      return;
    }

    const updatedUser = await this.uploadService.removeUserAvatar(userId);

    res.status(200).json({
      success: true,
      message: 'Avatar removido com sucesso',
      data: updatedUser
    });
  }

  async getUserWithAvatar(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({ 
        success: false,
        error: 'ID do usuário é obrigatório' 
      });
      return;
    }

    const user = await this.uploadService.getUserWithAvatar(userId);
    res.status(200).json(user);
  }
}