import * as express from "express";
import IControllerBase from "interfaces/IControllerBase.interface";
import {
  ScormUploadRequest,
  ScormUploadResponse
} from "interfaces/IScorm.interface";

class ScormController implements IControllerBase {
  public path = "/";
  public router = express.Router();

  constructor() {
    this.initRoutes();
  }

  public initRoutes() {
    this.router.post("/", this.upload);
  }

  upload = (
    req: ScormUploadRequest,
    res: ScormUploadResponse,
    next: express.NextFunction
  ): void => {
    console.log(req);
  };
    
}

export default ScormController;
