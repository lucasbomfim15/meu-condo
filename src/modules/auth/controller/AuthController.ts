import { AuthService } from "../service/AuthService";
import { Request, Response, NextFunction } from "express";



export class AuthController {
  constructor(private readonly authService: AuthService) {}

  async login(req: Request, res: Response, next: NextFunction):Promise<void> {
    const { email, password, captchaToken } = req.body;
    console.log(captchaToken);
    const result = await this.authService.login(email, password, captchaToken);
    res.status(200).json(result);
  }

  async loginWithGoogle(req: Request, res: Response, next: NextFunction):Promise<void> {
    const { clerkId } = req.body;
    console.log(clerkId);
    const token = await this.authService.loginWithGoogle(clerkId);
    res.status(200).json({ token });
  }
}
