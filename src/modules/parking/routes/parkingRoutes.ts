import { Router } from "express";
import { ParkingRepository } from "../repository/ParkingRepository";
import { PrismaClient } from "@prisma/client";
import { ParkingService } from "../services/ParkingService";
import { ParkingController } from "../controllers/ParkingController";
import { authenticateJWT } from "../../../common/middlewares/authenticateJwt";
import { authorizeRole } from "../../../common/middlewares/authorizeRole";
import { PrismaCondominiumRepository } from "../../condominium/repository/CondominiumRepository";

const prismaClient = new PrismaClient();
const parkingRepository = new ParkingRepository(prismaClient);
const condominiumRepository = new PrismaCondominiumRepository(prismaClient);
const parkingService = new ParkingService(parkingRepository,condominiumRepository );
const parkingController = new ParkingController(parkingService);

const router = Router();

router.post("/", authenticateJWT, authorizeRole("ADMIN"), (req, res, next) => parkingController.create(req, res, next));
router.get("/", authenticateJWT, authorizeRole("ADMIN"), (req, res, next) => parkingController.listAll(req, res, next));
router.get("/:id", authenticateJWT, authorizeRole("ADMIN"), (req, res, next) => parkingController.findById(req, res, next));
router.put("/:id", authenticateJWT, authorizeRole("ADMIN"), (req, res, next) => parkingController.update(req, res, next));
router.delete("/:id", authenticateJWT, authorizeRole("ADMIN"), (req, res, next) => parkingController.delete(req, res, next));

export default router;