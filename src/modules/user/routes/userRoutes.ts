import { Router, Request, Response, NextFunction } from "express";
import { UsersController } from "../controllers/UsersController";
import { UserService } from "../services/UserService";
import { UserRepository } from "../repository/UserRepository";
import { PrismaClient } from "@prisma/client";
import { authenticateJWT } from "../../../common/middlewares/authenticateJwt";
import { authorizeRole } from "../../../common/middlewares/authorizeRole";
import multer from "multer";
import { UploadController } from "../controllers/UploadController";
import { UploadService } from "../services/UploadService";


const prismaClient = new PrismaClient();
const userRepository = new UserRepository(prismaClient);
const userService = new UserService(userRepository);
const usersController = new UsersController(userService);

const uploadService = new UploadService(userRepository);
const uploadController = new UploadController(uploadService);


// Configuração do multer para upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido. Use: JPEG, PNG ou WebP'));
    }
  }
});

const router = Router();

router.post("/", (req, res, next) => usersController.create(req, res, next));
router.get("/", authenticateJWT, authorizeRole("ADMIN", "USER"),  (req, res, next) => usersController.listAll(req, res, next));
router.get("/:id", authenticateJWT, (req, res, next) => usersController.findById(req, res, next));
router.delete("/:id", authenticateJWT, authorizeRole("ADMIN"), (req, res, next) => usersController.delete(req, res, next));
router.put("/:id", authenticateJWT, authorizeRole("ADMIN", "USER"), (req, res, next) => usersController.update(req, res, next));


// 🔥 Novas rotas para avatar
router.post("/:userId/avatar", 
  authenticateJWT, 
  upload.single('avatar'), 
  (req, res, next) => uploadController.uploadAvatar(req, res, next)
);

router.delete("/:userId/avatar", 
  authenticateJWT, 
  (req, res, next) => uploadController.removeAvatar(req, res, next)
);

router.get("/:userId/avatar", 
  authenticateJWT, 
  (req, res, next) => uploadController.getUserWithAvatar(req, res, next)
);


export default router;