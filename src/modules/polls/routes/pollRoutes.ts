import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { PollRepository } from "../repository/PollRepository";
import { PollService } from "../service/PollService";
import { authenticateJWT } from "../../../common/middlewares/authenticateJwt";
import { PollController } from "../controller/PollController";

const prismaClient = new PrismaClient();
const repo = new PollRepository(prismaClient);
const service = new PollService(repo);
const controller = new PollController(service);

const router = Router();


router.post("/", authenticateJWT, (req, res, next) => controller.create(req, res, next)); // criar poll (usuários autenticados)
router.get("/condominium/:condominiumId", authenticateJWT, (req, res, next) => controller.listByCondo(req, res, next)); // listar por condomínio
router.get("/:id", authenticateJWT, (req, res, next) => controller.get(req, res, next)); // detalhes do poll
router.post("/:id/vote", authenticateJWT, (req, res, next) => controller.vote(req, res, next)); // votar

export default router;