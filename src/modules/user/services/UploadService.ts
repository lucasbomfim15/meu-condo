import cloudinary from "../../../config/Cloudnary";
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

    try {
      // Remover avatar anterior do Cloudinary se existir
      if (user.avatarUrl) {
        const publicIdMatch = user.avatarUrl.match(/\/avatars\/(.+)\./);
        if (publicIdMatch) {
          const publicId = `avatars/${publicIdMatch[1]}`;
          await cloudinary.uploader.destroy(publicId);
        }
      }

      // Upload para o Cloudinary
      const uploadResult = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'avatars',
            public_id: `${userId}-${Date.now()}`,
            transformation: [
              { width: 500, height: 500, crop: 'limit' },
              { quality: 'auto' },
              { fetch_format: 'auto' }
            ]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        uploadStream.end(file.buffer);
      });

      // Atualizar usuário no banco
      const updatedUser = await this.usersRepository.updateAvatar(userId, {
        avatarUrl: uploadResult.secure_url,
        avatarFileName: file.originalname,
        avatarMimeType: file.mimetype,
        avatarSize: uploadResult.bytes,
      });

      return updatedUser;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      throw new Error(`Erro ao fazer upload: ${errorMessage}`);
    }
  }

  async removeUserAvatar(userId: string) {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    if (!user.avatarUrl) {
      throw new Error('Usuário não possui avatar');
    }

    try {
      // Extrair public_id da URL do Cloudinary
      const publicIdMatch = user.avatarUrl.match(/\/avatars\/(.+)\./);
      if (publicIdMatch) {
        const publicId = `avatars/${publicIdMatch[1]}`;
        await cloudinary.uploader.destroy(publicId);
      }

      // Atualizar banco
      const updatedUser = await this.usersRepository.updateAvatar(userId, {
        avatarUrl: null,
        avatarFileName: null,
        avatarMimeType: null,
        avatarSize: null,
      });

      return updatedUser;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      throw new Error(`Erro ao remover avatar: ${errorMessage}`);
    }
  }

  async getUserWithAvatar(userId: string) {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }
    return user;
  }
}

