import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { UserRepository } from "../repository/UserRepository";

interface UploadAvatarData {
  userId: string;
  file: Express.Multer.File;
}

export class UploadService {
 constructor(private readonly usersRepository: UserRepository) {}

  async uploadUserAvatar({ userId, file }: UploadAvatarData) {
    // Verificar se usuário existe
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Validar tipo de arquivo
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new Error('Tipo de arquivo não permitido. Use: JPEG, PNG ou WebP');
    }

    // Criar diretório se não existir
    const uploadDir = path.join(process.cwd(), 'uploads', 'avatars');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Gerar nome único para o arquivo
    const fileHash = crypto.randomUUID();
    const fileExtension = path.extname(file.originalname);
    const newFileName = `${userId}-${fileHash}${fileExtension}`;
    const filePath = path.join(uploadDir, newFileName);
    const fileUrl = `/uploads/avatars/${newFileName}`;

    // Salvar arquivo
    fs.writeFileSync(filePath, file.buffer);

    // Remover avatar anterior se existir
    if (user.avatarUrl) {
      const oldFilePath = path.join(process.cwd(), user.avatarUrl);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    // Atualizar usuário no banco
    const updatedUser = await this.usersRepository.updateAvatar(userId, {
      avatarUrl: fileUrl,
      avatarFileName: file.originalname,
      avatarMimeType: file.mimetype,
      avatarSize: file.size,
    });

    return updatedUser;
  }

  async removeUserAvatar(userId: string) {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    if (!user.avatarUrl) {
      throw new Error('Usuário não possui avatar');
    }

    // Remover arquivo
    const filePath = path.join(process.cwd(), user.avatarUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Atualizar banco
    const updatedUser = await this.usersRepository.updateAvatar(userId, {
      avatarUrl: null,
      avatarFileName: null,
      avatarMimeType: null,
      avatarSize: null,
    });

    return updatedUser;
  }

  async getUserWithAvatar(userId: string) {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }
    return user;
  }
}

