import { AppError } from "../../../common/apiError/AppError";

export class UserHasBeenDeletedException extends AppError {
  constructor(message: string) {
    super(message, 404);
    this.name = "UserHasBeenDeletedException";
    Error.captureStackTrace(this, this.constructor);
  }
}