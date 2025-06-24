const { createPromo } = require("../Controllers/PromoControllers/createPromo");
const { deletePromo } = require("../Controllers/PromoControllers/deletePromo");
const { getAllPromo } = require("../Controllers/PromoControllers/getAllPromo");
const { getAPromo } = require("../Controllers/PromoControllers/getAPromo");
const { roleCheck } = require("../Middlewares/roleCheck");

const router = require("express").Router();

router.get("/", getAllPromo);
router.get("/:code", getAPromo);
router.post("/", roleCheck(["admin"]), createPromo);
router.delete("/:promoId", roleCheck(["admin"]), deletePromo);

module.exports = router;
