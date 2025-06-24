const { deleteFile } = require("../Controllers/FileControllers/deleteFile");
const { getAllFiles } = require("../Controllers/FileControllers/getAllFiles");
const { uploadFiles } = require("../Controllers/FileControllers/uploadFiles");

const router = require("express").Router();

router.delete("/:filename", deleteFile);
router.get("/", getAllFiles);
router.post("/upload", uploadFiles);

module.exports = router;
