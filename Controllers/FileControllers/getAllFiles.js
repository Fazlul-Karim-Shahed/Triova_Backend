const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const fetchAllCloudinaryFiles = async (prefix) => {
    let allFiles = [];
    let nextCursor = undefined;

    do {
        const response = await cloudinary.api.resources({
            type: "upload",
            prefix: prefix,
            max_results: 100,
            next_cursor: nextCursor,
        });

        allFiles = allFiles.concat(response.resources);
        nextCursor = response.next_cursor;
    } while (nextCursor);

    return allFiles;
};

const getAllFiles = async (req, res) => {
    try {
        const files = await fetchAllCloudinaryFiles("uploads");

        const formattedFiles = files.map((file) => {

            // console.log(file)

            return {
                ...file,
                name: `${file.display_name}.${file.format}`,
            };
        });

        res.send({ message: "All files in database", error: false, data: formattedFiles });
    } catch (err) {
        console.error("Error fetching files from Cloudinary:", err);
        res.status(500).send({ message: "Failed to read files", error: true, data: [] });
    }
};

module.exports.getAllFiles = getAllFiles;

// For local upload folder

// const fs = require("fs");
// const path = require("path");

// const getAllFiles = async (req, res) => {
//     try {
//         const uploadsDir = path.join(process.cwd(), "uploads");
//         const files = await fs.promises.readdir(uploadsDir); // ✅ this waits properl

//         res.send({ message: "All files in database", error: false, data: files });
//     } catch (err) {
//         console.error("Error reading uploads directory:", err);
//         res.status(500).send({ message: "Failed to read files", error: true, data: [] });
//     }
// };

// module.exports.getAllFiles = getAllFiles;
