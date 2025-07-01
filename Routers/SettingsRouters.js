const { createSettings } = require("../Controllers/SettingsControllers/createSettings");
const { getSettings } = require("../Controllers/SettingsControllers/getSettings");
const { updateSettings } = require("../Controllers/SettingsControllers/updateSettings");
const { roleCheck } = require("../Middlewares/roleCheck");

const router = require("express").Router();

router.get("/", getSettings);
router.post("/", roleCheck(["admin"]), createSettings);
router.put("/:id", roleCheck(["admin"]), updateSettings);

module.exports = router;
