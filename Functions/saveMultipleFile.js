const fs = require("fs").promises;
const path = require("path");
const stream = require("stream");
const cloudinary = require("cloudinary").v2;
const sharp = require("sharp");

const MAX_SIZE_KB = 200;
const MAX_WIDTH = 1500;
const MAX_CONCURRENT_UPLOADS = 3; // throttle concurrency for memory safety

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Compress image buffer with sharp (resize + quality)
async function compressImage(inputBuffer, ext) {
    let quality = 90;
    let img = sharp(inputBuffer).rotate();

    const metadata = await img.metadata();

    if (metadata.width > MAX_WIDTH) {
        img = img.resize({ width: MAX_WIDTH });
    }

    while (quality >= 30) {
        let buffer;

        if (ext === ".jpg" || ext === ".jpeg") {
            buffer = await img.jpeg({ quality, progressive: true }).toBuffer();
        } else if (ext === ".png") {
            buffer = await img.png({ compressionLevel: 9 }).toBuffer();
        } else if (ext === ".webp") {
            buffer = await img.webp({ quality }).toBuffer();
        } else {
            return null; // unsupported format
        }

        if (buffer.length / 1024 < MAX_SIZE_KB) {
            return buffer;
        }

        quality -= 10;
    }

    return img.toBuffer();
}

// Upload buffer to Cloudinary using upload_stream
function uploadToCloudinary(buffer, baseName, file) {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "uploads",
                public_id: baseName,
                resource_type: "image",
                overwrite: true,
                invalidate: true,
            },
            (error, result) => {
                if (error) {
                    console.error("Cloudinary upload error:", error);
                    reject(error);
                } else {
                    resolve({
                        ...result,
                        name: file.originalFilename,
                        contentType: file.mimetype,
                    });
                }
            }
        );

        const bufferStream = new stream.PassThrough();
        bufferStream.end(buffer);
        bufferStream.pipe(uploadStream);
    });
}

// Throttled concurrency helper
async function asyncPool(poolLimit, array, iteratorFn) {
    const ret = [];
    const executing = [];

    for (const item of array) {
        const p = Promise.resolve().then(() => iteratorFn(item));
        ret.push(p);

        if (poolLimit <= array.length) {
            const e = p.then(() => executing.splice(executing.indexOf(e), 1));
            executing.push(e);
            if (executing.length >= poolLimit) {
                await Promise.race(executing);
            }
        }
    }
    return Promise.all(ret);
}

// Main function: saveMultipleFile
async function saveMultipleFile(files) {
    if (!files || files.length === 0) {
        console.log("No files to upload");
        return [];
    }

    console.log(`Uploading ${files.length} file(s)...`);

    // Worker for each file
    async function processFile(file) {
        console.log(`Processing: ${file.originalFilename}`);

        try {
            const inputBuffer = await fs.readFile(file.filepath);
            const ext = path.extname(file.originalFilename).toLowerCase();
            const baseName = path.basename(file.originalFilename, ext);

            let bufferToUpload;

            if (ext === ".svg") {
                // SVG - no compression
                bufferToUpload = inputBuffer;
            } else {
                bufferToUpload = await compressImage(inputBuffer, ext);

                if (!Buffer.isBuffer(bufferToUpload)) {
                    throw new Error("Compression failed, buffer invalid");
                }
            }

            const uploaded = await uploadToCloudinary(bufferToUpload, baseName, file);
            console.log(`Uploaded: ${file.originalFilename}`);

            return uploaded;
        } catch (error) {
            console.error(`Error with file ${file.originalFilename}:`, error);
            return null;
        }
    }

    // Limit concurrency to avoid memory spike
    const results = await asyncPool(MAX_CONCURRENT_UPLOADS, files, processFile);

    console.log("All files processed.");
    return results.filter(Boolean);
}

module.exports = { saveMultipleFile };

// For local upload folder

// const fs = require("fs").promises;
// const path = require("path");
// const sharp = require("sharp");

// const MAX_SIZE_KB = 400;

// const compressImage = async (inputBuffer, fileExtension) => {
//     let quality = 90;
//     let buffer;
//     let sharpInstance = sharp(inputBuffer);

//     // Optional: Resize image if very large (e.g. wider than 1500px)
//     const metadata = await sharpInstance.metadata();
//     if (metadata.width > 1500) {
//         sharpInstance = sharpInstance.resize({ width: 1500 });
//     }

//     // Reduce quality until file size < MAX_SIZE_KB
//     while (quality >= 30) {
//         if (fileExtension === ".jpg" || fileExtension === ".jpeg") {
//             buffer = await sharpInstance.jpeg({ quality }).toBuffer();
//         } else if (fileExtension === ".png") {
//             buffer = await sharpInstance.png({ compressionLevel: 9 }).toBuffer();
//         } else if (fileExtension === ".webp") {
//             buffer = await sharpInstance.webp({ quality }).toBuffer();
//         } else {
//             return null;
//         }

//         if (buffer.length / 1024 < MAX_SIZE_KB) {
//             return buffer;
//         }

//         quality -= 10;
//     }

//     // Final fallback: return the lowest quality buffer
//     return buffer;
// };

// const saveMultipleFile = async (files) => {
//     let arr = [];

//     if (files && files.length > 0) {
//         for (let file of files) {
//             const promise = new Promise(async (resolve) => {
//                 try {
//                     const oldPath = file.filepath;
//                     const originalFileName = file.originalFilename;
//                     const fileExtension = path.extname(originalFileName).toLowerCase();
//                     const baseName = path.basename(originalFileName, fileExtension);
//                     const newFileName = baseName + fileExtension;
//                     const newPath = path.join(process.cwd(), "uploads", newFileName);

//                     const inputBuffer = await fs.readFile(oldPath);

//                     //console.log(`\nProcessing: ${originalFileName}`);
//                     //console.log("Original size:", (inputBuffer.length / 1024).toFixed(2), "KB");

//                     let compressedBuffer = await compressImage(inputBuffer, fileExtension);

//                     if (!compressedBuffer) {
//                         //console.log("Unsupported format or compression failed, copying original.");
//                         await fs.copyFile(oldPath, newPath);
//                         return resolve({
//                             name: newFileName,
//                             contentType: file.mimetype,
//                         });
//                     }

//                     //console.log("Compressed size:", (compressedBuffer.length / 1024).toFixed(2), "KB");
//                     await fs.writeFile(newPath, compressedBuffer);

//                     resolve({
//                         name: newFileName,
//                         contentType: file.mimetype,
//                     });
//                 } catch (err) {
//                     console.error("Compression failed for a file:", err);
//                     resolve(null);
//                 }
//             });

//             arr.push(promise);
//         }
//     }

//     return Promise.all(arr);
// };

// module.exports.saveMultipleFile = saveMultipleFile;
