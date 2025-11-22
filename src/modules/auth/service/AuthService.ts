import bcrypt from "bcryptjs";
import { UserFoundException } from "../../user/exceptions/UserFoundException";
import { UserNotFoundException } from "../../user/exceptions/UserNotFoundException";
import jwt from "jsonwebtoken";
import { UserRepository } from "../../user/repository/UserRepository";
import { UserHasBeenDeletedException } from "../../user/exceptions/UserHasBeenDeleted";
import { OAuth2Client } from "google-auth-library";
import { UserType } from "@prisma/client";
import { users } from "@clerk/clerk-sdk-node";


const JWT_SECRET = process.env.JWT_SECRET || 'defaultsecret';

export class AuthService {

    constructor(private readonly usersRepository: UserRepository,
                private readonly googleClient : OAuth2Client
    ) {}

    async login(email: string, password: string, recaptchaToken?: string): Promise<{ token: string }> {
        const user = await this.usersRepository.findByEmail(email);
        if (!user) {
            throw new UserNotFoundException("User not found!");
        }

        if (user.deletedAt) {
            throw new UserHasBeenDeletedException("User has been deleted!");
        }

        if (!user.password) {
            throw new UserFoundException("This user use social login. Please login with Google.");
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

 async loginWithGoogle(clerkUserId: string) {

  // 1. Buscar usuário no Clerk
  const clerkUser = await users.getUser(clerkUserId);

  if (!clerkUser) {
    throw new Error("Invalid Clerk user ID");
  }

  const email = clerkUser.emailAddresses?.[0]?.emailAddress;
  const fullName = `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim();
  const avatarUrl = clerkUser.imageUrl;
  const providerId = clerkUser.externalAccounts?.[0]?.id;  // ID do Google dentro do Clerk

  if (!email) {
    throw new Error("User has no email");
  }

  // 2. Verifica se já existe no seu banco
  let user = await this.usersRepository.findByEmail(email);

  // 3. Caso não exista no seu DB → cria
  if (!user) {
    const createUserDTO = {
      fullName,
      email,
      username: email,
      provider: "clerk-google",
      providerId,
      password: null,
      avatarUrl,
      userType: UserType.USER,
      cpf: "social-login",
    };

    user = await this.usersRepository.createUser(createUserDTO);
  }

  // 4. Gera o seu próprio JWT interno (opcional)
  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      userType: user.userType,
    },
    process.env.JWT_SECRET!,
    { expiresIn: "1d" }
  );

  return token;
}

}
