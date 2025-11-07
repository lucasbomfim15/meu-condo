import bcrypt from "bcryptjs";
import { UserFoundException } from "../../user/exceptions/UserFoundException";
import { UserNotFoundException } from "../../user/exceptions/UserNotFoundException";
import jwt from "jsonwebtoken";
import { UserRepository } from "../../user/repository/UserRepository";
import { UserHasBeenDeletedException } from "../../user/exceptions/UserHasBeenDeleted";


const JWT_SECRET = process.env.JWT_SECRET || 'defaultsecret';

export class AuthService {

    constructor(private readonly usersRepository: UserRepository) {}

    async login(email: string, password: string): Promise<{ token: string }> {
    const user = await this.usersRepository.findByEmail(email);
    if (!user) {
      throw new UserNotFoundException("User not found!");
    }

    if(user.deletedAt) {
      throw new UserHasBeenDeletedException("User has been deleted!");
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new UserFoundException("Invalid credentials!");
    }

    // Gera o token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, userType: user.userType },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    return { token };
  }
}
