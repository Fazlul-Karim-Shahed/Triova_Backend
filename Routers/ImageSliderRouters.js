const { createImageSlider } = require("../Controllers/ImageSliderControllers/createImageSlider");
const { deleteImageSlider } = require("../Controllers/ImageSliderControllers/deleteImageSlider");
const { getAllImageSlider } = require("../Controllers/ImageSliderControllers/getAllImageSlider");
const { roleCheck } = require("../Middlewares/roleCheck");

const router = require("express").Router();

router.get("/", getAllImageSlider);
router.post("/", roleCheck(["admin"]), createImageSlider);
router.delete("/:imageSliderId", roleCheck(["admin"]), deleteImageSlider);

module.exports = router;
