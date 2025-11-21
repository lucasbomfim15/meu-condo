import { Router, Request, Response, NextFunction } from "express";

import { PrismaClient } from "@prisma/client";
import { authenticateJWT } from "../../../common/middlewares/authenticateJwt";
import { authorizeRole } from "../../../common/middlewares/authorizeRole";
import { PrismaCondominiumRepository } from "../repository/CondominiumRepository";
import { CondominiumService } from "../services/CondominiumService";
import { CondominiumsController } from "../controllers/CondominiumController";


const prismaClient = new PrismaClient();
const condominiumRepository = new PrismaCondominiumRepository(prismaClient);
const condominiumService = new CondominiumService(condominiumRepository);
const condominiumController = new CondominiumsController(condominiumService);

const router = Router();

router.post("/", (req, res, next) => condominiumController.create(req, res, next));
router.get("/", authenticateJWT, authorizeRole("ADMIN"),  (req, res, next) => condominiumController.listAll(req, res, next));
router.get("/:id", authenticateJWT, authorizeRole("ADMIN"), (req, res, next) => condominiumController.findById(req, res, next));
router.delete("/:id", authenticateJWT, authorizeRole("ADMIN"), (req, res, next) => condominiumController.delete(req, res, next));
router.put("/:id", authenticateJWT, authorizeRole("ADMIN"), (req, res, next) => condominiumController.update(req, res, next));

export default router;