import { UserType } from "@prisma/client";
import { IsEmail, IsEnum, IsOptional, IsString, Length } from "class-validator";

export class CreateUserRequestDTO {
  @IsString({ message: "Full name must be a string" })
  @Length(3, 100, { message: "Full name must be between 3 and 100 characters" })
  fullName: string;

  @IsString({ message: "Username must be a string" })
  @Length(3, 30, { message: "Username must be between 3 and 30 characters" })
  username: string;

  @IsEmail({}, { message: "Invalid email format" })
  email: string;

  @IsOptional()
  @IsString({ message: "Password must be a string" })
  @Length(6, 100, { message: "Password must be at least 6 characters" })
  password: string | null;

  @IsOptional()
  @IsString({ message: "Phone number must be a string" })
  phoneNumber?: string;

  @IsString({ message: "CPF must be a string" })
  cpf: string;

  @IsEnum(UserType, { message: "Invalid user type" })
  userType: UserType;
}
