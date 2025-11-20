import bcrypt from "bcryptjs";
import { UserFoundException } from "../../user/exceptions/UserFoundException";
import { UserNotFoundException } from "../../user/exceptions/UserNotFoundException";
import jwt from "jsonwebtoken";
import { UserRepository } from "../../user/repository/UserRepository";
import { UserHasBeenDeletedException } from "../../user/exceptions/UserHasBeenDeleted";


const JWT_SECRET = process.env.JWT_SECRET || 'defaultsecret';

export class AuthService {

    constructor(private readonly usersRepository: UserRepository) {}

    async login(email: string, password: string, recaptchaToken?: string): Promise<{ token: string }> {
        const user = await this.usersRepository.findByEmail(email);
        if (!user) {
            throw new UserNotFoundException("User not found!");
        }

        if (user.deletedAt) {
            throw new UserHasBeenDeletedException("User has been deleted!");
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            throw new UserFoundException("Invalid credentials!");
        }

        // Só valida recaptcha se o token for enviado
        if (recaptchaToken) {
            const isHuman = await this.verifyRecaptcha(recaptchaToken);
            if (!isHuman) {
                throw new UserFoundException("Recaptcha verification failed!");
            }
        }

        // Gera o token JWT
        const token = jwt.sign(
            { userId: user.id, email: user.email, userType: user.userType },
            JWT_SECRET,
            { expiresIn: "1d" }
        );

        return { token };
    }

    private async verifyRecaptcha(token: string): Promise<boolean> {
  try {
    const secret = process.env.RECAPTCHA_SECRET_KEY;

    if (!secret) {
      throw new Error("RECAPTCHA_SECRET_KEY is not set in environment variables.");
    }

    const params = new URLSearchParams();
    params.append("secret", secret);
    params.append("response", token);

    const response = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: params
      }
    );

    const data = await response.json();

    return data.success === true;
  } catch (err) {
    console.error("Error validating recaptcha:", err);
    return false;
  }
}
}
