const sharp = require("sharp");
const path = require("path");
const cloudinary = require("cloudinary").v2;
const fs = require("fs").promises;
const stream = require("stream");

const MAX_SIZE_KB = 200;

const compressImage = async (inputBuffer, fileExtension) => {
    let quality = 90;
    let sharpInstance = sharp(inputBuffer);

    const metadata = await sharpInstance.metadata();
    if (metadata.width > 1500) {
        sharpInstance = sharpInstance.resize({ width: 1500 });
    }

    while (quality >= 30) {
        let buffer;
        if (fileExtension === ".jpg" || fileExtension === ".jpeg") {
            buffer = await sharpInstance.jpeg({ quality }).toBuffer();
        } else if (fileExtension === ".png") {
            buffer = await sharpInstance.png({ compressionLevel: 9 }).toBuffer();
        } else if (fileExtension === ".webp") {
            buffer = await sharpInstance.webp({ quality }).toBuffer();
        } else {
            // Unsupported formats return null here
            return null;
        }

        if (buffer.length / 1024 < MAX_SIZE_KB) {
            return buffer;
        }

        quality -= 10;
    }

    return sharpInstance.toBuffer();
};

const saveMultipleFile = async (files) => {
    if (!files || files.length === 0) return [];

    const uploads = files.map(async (file) => {
        try {
            const inputBuffer = await fs.readFile(file.filepath);
            const fileExtension = path.extname(file.originalFilename).toLowerCase();
            const baseName = path.basename(file.originalFilename, fileExtension);

            let bufferToUpload;

            if (fileExtension === ".svg") {
                // Bypass compression, upload original buffer for SVG
                bufferToUpload = inputBuffer;
            } else {
                // Compress for other image types
                const compressedBuffer = await compressImage(inputBuffer, fileExtension);
                if (!compressedBuffer) {
                    // console.warn(`Unsupported file format: ${file.originalFilename}`);
                    return null;
                }
                bufferToUpload = compressedBuffer;
            }

            cloudinary.config({
                cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                api_key: process.env.CLOUDINARY_API_KEY,
                api_secret: process.env.CLOUDINARY_API_SECRET,
            });

            return await new Promise((resolve, reject) => {
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
                            console.error("Upload failed:", error);
                            resolve(null);
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
                bufferStream.end(bufferToUpload);
                bufferStream.pipe(uploadStream);
            });
        } catch (err) {
            console.error("Compression or upload error:", err);
            return null;
        }
    });

    return Promise.all(uploads);
};

module.exports.saveMultipleFile = saveMultipleFile;

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
