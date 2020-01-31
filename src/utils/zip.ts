import * as fs from "fs";

import * as unzipper from "unzipper";

export const extract = (file: Express.Multer.File, destination: string): void => {
    fs.createReadStream(file.path)
    .pipe(unzipper.Extract({ path: destination }))
}

export const parse = (file: Express.Multer.File, destination: string): void => {
    fs.createReadStream(file.path)
    .pipe(unzipper.Parse({ path: destination }))
    .on('entry', (entry) => {
        const fileName = entry.path;
        const type = entry.type; // 'Directory' or 'File'
        const size = entry.vars.uncompressedSize; // There is also compressedSize;
        console.dir(entry);
        /*
        // check if dir or file
        if (entry.type === 'File') {
            // xml.parse(entry.path) 
        }
*/
    })
}
