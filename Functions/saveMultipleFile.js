const path = require("path");
const cloudinary = require("cloudinary").v2;
const fs = require("fs").promises;
const stream = require("stream");
const sharp = require("sharp");

const MAX_FILE_SIZE_KB = 5 * 1024;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const compressImage = async (inputBuffer, fileExtension) => {
    const sharpInstance = sharp(inputBuffer).resize({
        width: 1200,
        withoutEnlargement: true,
    });

    switch (fileExtension) {
        case ".jpg":
        case ".jpeg":
            return await sharpInstance
                .jpeg({
                    quality: 90,
                    mozjpeg: true,
                    chromaSubsampling: "4:4:4",
                })
                .toBuffer();

        case ".png":
            return await sharpInstance
                .png({
                    quality: 90,
                    compressionLevel: 9,
                    adaptiveFiltering: true,
                })
                .toBuffer();

        case ".webp":
            return await sharpInstance
                .webp({
                    quality: 90,
                    effort: 4,
                })
                .toBuffer();

        default:
            return inputBuffer; // Skip compression for unsupported formats (e.g., .svg)
    }
};

const saveMultipleFile = async (files) => {
    if (!files || files.length === 0) return [];

    const uploads = files.map(async (file) => {
        try {
            const inputBuffer = await fs.readFile(file.filepath);
            const fileExtension = path.extname(file.originalFilename).toLowerCase();
            const baseName = path.basename(file.originalFilename, fileExtension);

            let finalBuffer = inputBuffer;

            // Compress non-SVG images
            if (fileExtension !== ".svg") {
                finalBuffer = await compressImage(inputBuffer, fileExtension);
                const sizeKB = finalBuffer.length / 1024;
                if (sizeKB > MAX_FILE_SIZE_KB) {
                    console.warn(`Compression failed: ${file.originalFilename} is ${Math.round(sizeKB)} KB`);
                    return null;
                }
            }

            const uploadOptions = {
                folder: "uploads",
                public_id: baseName,
                resource_type: "image",
                overwrite: true,
                invalidate: true,
                use_filename: true,
                unique_filename: false,
                transformation: [],
            };

            // Apply Cloudinary transformations only if not SVG
            if (fileExtension !== ".svg") {
                uploadOptions.transformation.push({
                    width: 1200,
                    crop: "limit",
                    quality: "auto:best",
                    fetch_format: "auto",
                });
            }

            return await new Promise((resolve) => {
                const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
                    if (error) {
                        console.error("Upload failed:", error);
                        return resolve(null);
                    }

                    const sizeKB = result.bytes / 1024;
                    if (fileExtension !== ".svg" && sizeKB > MAX_FILE_SIZE_KB) {
                        console.warn(`Uploaded ${file.originalFilename} too large: ${Math.round(sizeKB)} KB`);
                        return resolve(null);
                    }

                    return resolve({
                        ...result,
                        name: file.originalFilename,
                        contentType: file.mimetype,
                    });
                });

                const bufferStream = new stream.PassThrough();
                bufferStream.end(finalBuffer);
                bufferStream.pipe(uploadStream);
            });
        } catch (err) {
            console.error("Upload error:", err);
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
