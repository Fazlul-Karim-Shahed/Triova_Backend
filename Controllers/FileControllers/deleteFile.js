const cloudinary = require("cloudinary").v2;

const deleteFile = async (req, res) => {
    const fileName = req.params.filename;

    if (!fileName) {
        return res.status(400).send({ message: "Filename is required" });
    }

    const publicId = `uploads/${fileName.replace(/\.[^/.]+$/, "")}`; // remove extension

    try {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });

        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: "image",
        });

        if (result.result === "not found") {
            return res.status(404).send({ message: "File not found in Cloudinary" });
        }
        else {
            console.log('Deleted')
            res.status(200).send({ error: false, message: "File deleted from Cloudinary" });
        }

        
    } catch (err) {
        console.error("Cloudinary deletion error:", err);
        res.status(500).send({ error: true, message: "Error deleting file from Cloudinary" });
    }
};

module.exports.deleteFile = deleteFile;

// For local upload folder

// const fs = require("fs")
// const path = require("path")

// const deleteFile = async (req, res) => {

//     let fileName = req.params.filename
//     let filePath = path.join(process.cwd(), "uploads", fileName)

//     fs.unlink(filePath, (err) => {
//         if (err) {
//             res.status(500).send({ message: "Error deleting file" })
//         } else {
//             res.status(200).send({ message: "File deleted" })
//         }
//     })

// }

// module.exports.deleteFile = deleteFile
