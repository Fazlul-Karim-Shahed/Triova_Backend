const fs = require("fs").promises;
const path = require("path");
const stream = require("stream");
const cloudinary = require("cloudinary").v2;
const { spawn } = require("child_process");

const MAX_SIZE_KB = 200;
const TIMEOUT_MS = 15000;

// Call compressor.js as child process
const runCompressor = (inputBuffer, ext) => {
    return new Promise((resolve, reject) => {
        const child = spawn("node", ["compressor.js", ext]);

        const chunks = [];
        const errors = [];

        child.stdout.on("data", (data) => chunks.push(data));
        child.stderr.on("data", (data) => errors.push(data.toString()));

        child.on("close", (code) => {
            if (code === 0) {
                resolve(Buffer.concat(chunks));
            } else {
                reject(new Error("Compression failed: " + errors.join("")));
            }
        });

        child.stdin.write(inputBuffer);
        child.stdin.end();
    });
};

// Upload with timeout
const uploadWithTimeout = (buffer, baseName, file) => {
    return new Promise((resolve) => {
        const timeout = setTimeout(() => {
            console.error("⏰ Upload timeout for:", file.originalFilename);
            resolve(null);
        }, TIMEOUT_MS);

        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "uploads",
                public_id: baseName,
                resource_type: "image",
                overwrite: true,
                invalidate: true,
            },
            (error, result) => {
                clearTimeout(timeout);
                if (error) {
                    console.error("❌ Upload failed:", error);
                    resolve(null);
                } else {
                    console.log("✅ Upload successful:", result.secure_url);
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
};

// Retry wrapper
const retry = async (fn, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
        const result = await fn();
        if (result) return result;
        console.warn(`🔁 Retrying upload (${i + 1}/${retries})...`);
        await new Promise((res) => setTimeout(res, delay));
    }
    return null;
};

const saveMultipleFile = async (files) => {
    if (!files || files.length === 0) {
        console.log("⚠️ No files provided.");
        return [];
    }

    console.log(`🚀 Starting upload for ${files.length} file(s).`);

    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    console.log("🔧 Cloudinary config:", {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET ? "***" : null,
    });

    const results = [];

    for (let index = 0; index < files.length; index++) {
        const file = files[index];
        try {
            console.log(`📂 Reading file ${index + 1}: ${file.originalFilename}`);
            const inputBuffer = await fs.readFile(file.filepath);
            const fileExtension = path.extname(file.originalFilename).toLowerCase();
            const baseName = path.basename(file.originalFilename, fileExtension);

            let bufferToUpload;

            if (fileExtension === ".svg") {
                console.log("🖼️ SVG detected. Skipping compression.");
                bufferToUpload = inputBuffer;
            } else {
                console.log("🧬 Running compression subprocess...");
                bufferToUpload = await runCompressor(inputBuffer, fileExtension);
            }

            const result = await retry(() => uploadWithTimeout(bufferToUpload, baseName, file));

            if (result) {
                results.push(result);
            } else {
                console.error(`❌ Final upload failed: ${file.originalFilename}`);
            }

            console.log("💾 Memory usage:", process.memoryUsage());
        } catch (err) {
            console.error("❗ Error processing file:", file.originalFilename, err);
        }
    }

    console.log("✅ All uploads attempted.");
    return results;
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
