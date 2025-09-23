import { PrismaClient } from "@prisma/client";
import { OccurrenceRepository } from "../repository/OccurrenceRepository";
import { OccurenceService } from "../services/OccurenceService";
import { OccurenceController } from "../controllers/OccurrenceController";
import { Router } from "express";
import { authenticateJWT } from "../../../common/middlewares/authenticateJwt";
import { authorizeRole } from "../../../common/middlewares/authorizeRole";


const prismaClient = new PrismaClient();
const occurenceRepository = new OccurrenceRepository(prismaClient);
const occurrenceService = new OccurenceService(occurenceRepository);
const occurrenceController = new OccurenceController(occurrenceService);


const router = Router();


router.post("/", authenticateJWT, (req, res, next) => occurrenceController.create(req, res, next));
router.get("/", authenticateJWT, authorizeRole("ADMIN"),  (req, res, next) => occurrenceController.list(req, res, next));
router.get("/mines", authenticateJWT, authorizeRole("USER"), (req, res, next) => occurrenceController.listMine(req, res, next));
router.get("/:id", (req, res, next) => occurrenceController.findById(req, res, next));
router.delete("/:id", authenticateJWT, authorizeRole("ADMIN"), (req, res, next) => occurrenceController.delete(req, res, next));
router.put("/:id", (req, res, next) => occurrenceController.update(req, res, next));


export default router;