require("dotenv").config();
import * as fs from "fs";

import * as express from "express";
import * as multer from "multer";
import * as mime from "mime";
import * as uuidv4 from "uuid/v4";
import * as aws from "aws-sdk";

import IControllerBase from "interfaces/IControllerBase.interface";

class ScormController implements IControllerBase {
  public router;

  private upload;
  private bucketName = "scorm-files";
  private s3;

  constructor() {
    this.router = express.Router();

    const tmpStorage = `${__dirname}/../tmp/`;
    this.upload = multer({
      storage: multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, tmpStorage);
        },
        filename: (req, file, cb) => {
          cb(null, file.originalname);
        }
      })
    });

    this.s3 = new aws.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      params: { Bucket: this.bucketName }
    });

    this.initRoutes();
  }

  public initRoutes() {
    this.router.post(
      "/upload",
      this.upload.single("scormfile"),
      this.uploadToS3
    );
    this.router.post(
      "/parse",
      this.upload.single("scormfile"),
      this.parse
    );
  }

  private uploadToS3 = (req, res) => {
    const tmpFile = req.file;

    fs.readFile(tmpFile.path, (err, data) => {
      if (err) throw err;
      const uploadParams = {
        Key: tmpFile.originalname,
        Body: data
      };
      this.s3.upload(uploadParams, (err, data) => {
        // delete the temp stored file
        fs.unlink(tmpFile.path, err => {
          if (err) {
            console.error(err);
          }
          console.log("Temp File Delete");
        });

        console.log("PRINT FILE:", tmpFile);
        if (err) {
          console.log("ERROR MSG: ", err);
          res.status(500).send(err);
        } else {
          const message = "Successfully uploaded data";
          console.log(message);
          res.status(200).json({
            message,
            filename: tmpFile.originalname,
            url: `https://${this.bucketName}.s3.eu-central-1.amazonaws.com/${tmpFile.originalname}`
          });
        }
      });
    });
  };

  private parse = (req, res) => {
    const file = req.file;

    
  }

}

export default ScormController;
