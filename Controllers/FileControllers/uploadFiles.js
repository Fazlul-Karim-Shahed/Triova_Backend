const { IncomingForm } = require("formidable");
const fs = require("fs");
const path = require("path");
const cloudinary = require("cloudinary").v2;
const stream = require("stream");
const sharp = require("sharp");

const MAX_SIZE_KB = 5 * 1024;

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
            return inputBuffer; // No compression for SVG or unsupported formats
    }
};

const uploadFiles = async (req, res) => {
    const form = new IncomingForm({
        multiples: false,
        keepExtensions: true,
    });

    form.parse(req, async (err, fields, files) => {
        if (err) {
            return res.status(500).json({ error: true, message: "Upload failed." });
        }

        let file = files.file;
        if (Array.isArray(file)) file = file[0];
        if (!file) {
            return res.status(400).json({ error: true, message: "No file uploaded." });
        }

        const tempPath = file.filepath || file.path;
        const fileExtension = path.extname(file.originalFilename).toLowerCase();
        const baseName = path.basename(file.originalFilename, fileExtension);

        try {
            const fileBuffer = await fs.promises.readFile(tempPath);

            // Compress the file buffer if not SVG
            let finalBuffer = fileBuffer;
            if (fileExtension !== ".svg") {
                finalBuffer = await compressImage(fileBuffer, fileExtension);
                const sizeKB = finalBuffer.length / 1024;
                if (sizeKB > MAX_SIZE_KB) {
                    console.warn(`Compression failed: ${file.originalFilename} size after compression is ${Math.round(sizeKB)} KB`);
                    return res.status(413).json({ error: true, message: "File too large after compression." });
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

            const result = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
                    if (error) return reject(error);

                    const sizeKB = result.bytes / 1024;
                    if (fileExtension !== ".svg" && sizeKB > MAX_SIZE_KB) {
                        console.warn(`Upload skipped — ${result.original_filename} is too large: ${Math.round(sizeKB)} KB`);
                        return resolve(null);
                    }

                    return resolve(result);
                });

                const bufferStream = new stream.PassThrough();
                bufferStream.end(finalBuffer);
                bufferStream.pipe(uploadStream);
            });

            if (!result) {
                return res.status(413).json({ error: true, message: "File too large after upload." });
            }

            return res.status(200).json({
                error: false,
                message: "File uploaded successfully.",
                fileName: result.original_filename,
                url: result.secure_url,
                public_id: result.public_id,
            });
        } catch (uploadErr) {
            console.error(`Cloudinary upload error for ${baseName}`, uploadErr);
            return res.status(500).json({ error: true, message: "Upload failed." });
        }
    });
};

module.exports.uploadFiles = uploadFiles;

// for local upload folder

// const formidable = require("formidable");
// const fs = require("fs");
// const path = require("path");
// const { IncomingForm } = require("formidable");

// const uploadFiles = async (req, res) => {
//     const form = new IncomingForm({
//         multiples: false,
//         keepExtensions: true,
//     });

//     form.parse(req, (err, fields, files) => {
//         if (err) {
//             return res.status(500).json({ error: true, message: "Upload failed." });
//         }

//         let file = files.file;

//         if (Array.isArray(file)) file = file[0];
//         if (!file) {
//             return res.status(400).json({ error: true, message: "No file uploaded." });
//         }

//         const tempPath = file.filepath || file.path;
//         if (!tempPath) {
//             return res.status(400).json({ error: true, message: "File path missing." });
//         }

//         // Clean original filename
//         let originalName = file.originalFilename || `upload-${Date.now()}`;
//         originalName = originalName.split(/[/\\]/).pop();

//         const uploadDir = path.join(process.cwd(), "uploads");
//         if (!fs.existsSync(uploadDir)) {
//             fs.mkdirSync(uploadDir, { recursive: true });
//         }

//         const newPath = path.join(uploadDir, originalName);

//         // Use copy + unlink to avoid EXDEV error
//         fs.copyFile(tempPath, newPath, (copyErr) => {
//             if (copyErr) {
//                 console.error("Copy error:", copyErr);
//                 return res.status(500).json({ error: true, message: "File saving failed." });
//             }

//             // Delete temp file
//             fs.unlink(tempPath, (unlinkErr) => {
//                 if (unlinkErr) {
//                     console.warn("Warning: temp file not deleted", unlinkErr);
//                 }

//                 return res.status(200).json({
//                     error: false,
//                     message: "File uploaded successfully.",
//                     fileName: originalName,
//                     filePath: `/uploads/${originalName}`,
//                 });
//             });
//         });
//     });
// };

// module.exports.uploadFiles = uploadFiles;
