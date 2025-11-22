import { Router, Request, Response, NextFunction } from "express";
import { AuthController } from "../controller/AuthController";
import { AuthService } from "../service/AuthService";
import { UserRepository } from "../../user/repository/UserRepository";
import { PrismaClient } from "@prisma/client";
import { OAuth2Client } from "google-auth-library";


const prismaClient = new PrismaClient();
const userRepository = new UserRepository(prismaClient);
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const authService = new AuthService(userRepository, googleClient);
const authController = new AuthController(authService);

const router = Router();

router.post("/login", (req, res, next) => authController.login(req, res, next));
router.post("/login/google", (req, res, next) => authController.loginWithGoogle(req, res, next));

export default router;