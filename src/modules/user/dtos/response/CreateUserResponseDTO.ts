import { UserType } from "@prisma/client";


export class CreateUserResponseDTO {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phoneNumber?: string | null;
  cpf: string;
  userType: UserType;
  createdAt: Date;
  apartmentId: string | null;
}