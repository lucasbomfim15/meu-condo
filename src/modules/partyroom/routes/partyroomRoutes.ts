import { Router, Request, Response, NextFunction } from "express";

import { PrismaClient } from "@prisma/client";
import { PartyRoomRepository } from "../repository/PartyRoomRepository";
import { PartyRoomService } from "../services/PartyRoomService";
import { PrismaCondominiumRepository } from "../../condominium/repository/CondominiumRepository";
import { PartyRoomsController } from "../controllers/PartyRoomController";
import { authenticateJWT } from "../../../common/middlewares/authenticateJwt";
import { authorizeRole } from "../../../common/middlewares/authorizeRole";


const prismaClient = new PrismaClient();
const partyRoomRepository = new PartyRoomRepository(prismaClient);
const condominiumRepository = new PrismaCondominiumRepository(prismaClient);
const partyRoomService = new PartyRoomService(partyRoomRepository, condominiumRepository);
const partyRoomControllers = new PartyRoomsController(partyRoomService);


const router = Router();

router.post("/", authenticateJWT, authorizeRole("ADMIN"), (req, res, next) =>
  partyRoomControllers.create(req, res, next)
);

router.get("/", authenticateJWT, authorizeRole("ADMIN"), (req, res, next) =>
  partyRoomControllers.listAll(req, res, next)
);

router.get("/:id", authenticateJWT, authorizeRole("ADMIN"), (req, res, next) =>
  partyRoomControllers.findById(req, res, next)
);

router.put("/:id", authenticateJWT, authorizeRole("ADMIN"), (req, res, next) =>
  partyRoomControllers.update(req, res, next)
);

router.delete("/:id", authenticateJWT, authorizeRole("ADMIN"), (req, res, next) =>
  partyRoomControllers.delete(req, res, next)
);

export default router;