require("dotenv").config();
import * as fs from "fs";

import * as express from "express";
import * as multer from "multer";
import * as mime from "mime";
import * as uuidv4 from "uuid/v4";
import * as aws from "aws-sdk";
import * as unzipper from "unzipper";
import * as xml2js from "xml2js";

import IController from "interfaces/IController.interface";
import * as zip from "../utils/zip";

class ScormController implements IController {
  public router: express.Router;
  public parser: xml2js.Parser;
  public scorm: Object;

  private upload;
  private tmpStorage;
  private bucketName = "scorm-files";
  private s3;

  constructor() {
    this.router = express.Router();
    this.parser = new xml2js.Parser();
    this.scorm = {};

    const tmpStorage = `${__dirname}/../tmp/`;
    this.tmpStorage = tmpStorage;
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
    this.router.post("/parse", this.upload.single("scormfile"), this.parse);
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

  private parse = async (req, res) => {
    const file: Express.Multer.File = req.file;
    if (!file) {
      res.status(500).send("No file, sorry!");
    }
    // unzip
    zip.parse(file, this.tmpStorage);
/*
    fs.createReadStream(file.path)
      .pipe(unzipper.Extract({ path: this.tmpStorage }))
      .on('entry', entry => entry.autodrain())
      .promise()
      .then( () => {
        console.log(`done unzipping`);// ${file.originalname}`);
    }, e => console.log('error',e));

    fs.readdir(this.tmpStorage, (err, files) => {
      files.forEach(file => {
        const fileName = file;
        const filePath = `${this.tmpStorage}/${file}`;

        fs.lstat(filePath, (err, stats) => {
          if (stats.isFile()) {
            
            
            fs.unlink(filePath, err => {
              if (err) throw err;
              console.log(`${fileName}`);
            });
          }
        });

        fs.readFile(filePath, (err, data) => {
          this.parser.parseString(data, (err, result) => {
            if (err) throw err;
            this.scorm[fileName] = { ...result };
            console.log(`[${fileName}] ${result}`);
          });

          // clean-up
          /*
          fs.lstat(filePath, (err, stats) => {
            if (stats.isFile()) {
              fs.unlink(filePath, err => {
                if (err) throw err;
                console.log(`${fileName}`);
              });
            }
          });
          
        });

      });
*/
      // return response
      const message = `${file.originalname} was unzipped and parsed`;
      res.status(200).json({
        message,
        scorm: this.scorm
      });
    
    // /tmp clean-up
    /*
    fs.rmdir(this.tmpStorage, { recursive: true }, err => {
      if (err) throw err;
    });
    
    fs.mkdir(this.tmpStorage, err => {
      if (err) throw err;
    });
    */
  };
}

export default ScormController;
