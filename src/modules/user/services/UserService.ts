import { CreateUserRequestDTO } from "../dtos/request/CreateUserRequestDTO";
import { UpdateUserRequestDTO } from "../dtos/request/UpdateUserRequestDTO";
import { CreateUserResponseDTO } from "../dtos/response/CreateUserResponseDTO";
import { UserFoundException } from "../exceptions/UserFoundException";
import { UserNotFoundException } from "../exceptions/UserNotFoundException";
import { UserMapper } from "../mappers/UserMapper";
import { UserRepository } from "../repository/UserRepository";
import bcrypt from "bcryptjs";

export class UserService {
  constructor(private readonly usersRepository: UserRepository) {}

  async create(
    createUserDto: CreateUserRequestDTO
  ): Promise<CreateUserResponseDTO> {
    const emailExists = await this.usersRepository.findByEmail(
      createUserDto.email
    );
    if (emailExists) {
      throw new UserFoundException("Email already exists!");
    }
    const usernameExists = await this.usersRepository.findByUsername(
      createUserDto.username
    );

    if (usernameExists) {
      throw new UserFoundException("Username already exists!");
    }

    let phoneExists = null;
    if (createUserDto.phoneNumber) {
      phoneExists = await this.usersRepository.findByPhoneNumber(
        createUserDto.phoneNumber
      );
      if (phoneExists) {
        throw new UserFoundException("Phone number already exists!");
      }
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password ?? "", 10);

    createUserDto.password = hashedPassword;

    const user = await this.usersRepository.createUser(createUserDto);

    return UserMapper.toCreateUserResponseDTO(user);
  }

  async listAll(): Promise<CreateUserResponseDTO[]> {
    const users = await this.usersRepository.findAll();

    return users.map((user) => UserMapper.toCreateUserResponseDTO(user));
  }

  async findById(id: string): Promise<CreateUserResponseDTO | null> {
    const user = await this.usersRepository.findByIdComplete(id);
    if (!user) {
      throw new UserNotFoundException("User not found!");
    }
    return UserMapper.toCreateUserResponseDTO(user);
  }

  async delete(id: string): Promise<void> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new UserNotFoundException("User not found!");
    }

    await this.usersRepository.delete(id);
  }

  async update(
    id: string,
    updateUserDto: UpdateUserRequestDTO
  ): Promise<CreateUserResponseDTO> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new UserNotFoundException("User not found!");
    }

    const emailExists = await this.usersRepository.findByEmail(
      updateUserDto.email
    );
    if (emailExists && emailExists.id !== id) {
      throw new UserFoundException("Email already exists!");
    }

    const updatedUser = await this.usersRepository.update(id, updateUserDto);

    return UserMapper.toCreateUserResponseDTO(updatedUser);
  }
}
