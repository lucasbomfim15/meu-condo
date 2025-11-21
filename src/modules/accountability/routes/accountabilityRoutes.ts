import { Router } from "express";
import { PrismaClient } from "@prisma/client";

import { authenticateJWT } from "../../../common/middlewares/authenticateJwt";
import { authorizeRole } from "../../../common/middlewares/authorizeRole";
import { PrismaAccountabilityRepository } from "../repository/PrismaAccountabilityRepository ";
import { AccountabilityService } from "../service/AccountabilityService";
import { AccountabilityController } from "../controller/AccountabilityController";

const prisma = new PrismaClient();
const repository = new PrismaAccountabilityRepository(prisma);
const service = new AccountabilityService(repository);
const controller = new AccountabilityController(service);

const router = Router();

router.post("/", authenticateJWT, authorizeRole("ADMIN"), (req, res, next) =>
  controller.create(req, res, next)
);

router.get(
  "/condominium/:condominiumId",
  authenticateJWT,
  authorizeRole("ADMIN"),
  (req, res, next) => controller.listByCondo(req, res, next)
);

router.get("/:id", authenticateJWT, authorizeRole("ADMIN"), (req, res, next) =>
  controller.findById(req, res, next)
);

router.put("/:id", authenticateJWT, authorizeRole("ADMIN"), (req, res, next) =>
  controller.update(req, res, next)
);

router.delete(
  "/:id",
  authenticateJWT,
  authorizeRole("ADMIN"),
  (req, res, next) => controller.delete(req, res, next)
);

export default router;
