import * as express from "express";
import * as multer from "multer";

import IControllerBase from "interfaces/IControllerBase.interface";
import {
  ScormUploadRequest,
  ScormUploadResponse
} from "interfaces/IScorm.interface";

class ScormController implements IControllerBase {
  public path = "/";
  public router = express.Router();
  public upload = multer({
    dest: 'uploads/' // this saves your file into a directory called "uploads"
  }); 

  constructor() {
    

    this.initRoutes();
  }

  public initRoutes() {
    this.router.post("/", this.upload.single('ContentPackagingSingleSCO_SCORM20042ndEdition.zip'), (req, res) => {
      res.json({ 
        message: 'file uploaded successfuly',

      })
    });
  } 
}

export default ScormController;
