import { User } from "@prisma/client";
import { CreateUserResponseDTO } from "../dtos/response/CreateUserResponseDTO";

export class UserMapper {
  static toCreateUserResponseDTO(user: User): CreateUserResponseDTO {
    return {
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber,
      cpf: user.cpf,
      userType: user.userType,
      createdAt: user.createdAt,
      apartmentId: user.apartmentId,
    };
  }
}