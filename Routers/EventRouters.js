const { createEvent } = require("../Controllers/EventControllers/createEvent");
const { deleteEvent } = require("../Controllers/EventControllers/deleteEvent");
const { getAEvent } = require("../Controllers/EventControllers/getAEvent");
const { getAllEvents } = require("../Controllers/EventControllers/getAllEvents");
const { updateEvent } = require("../Controllers/EventControllers/updateEvent");
const { roleCheck } = require("../Middlewares/roleCheck");

const router = require("express").Router();

router.get("/:today", getAllEvents);
router.get("/single/:name", getAEvent);
router.post("/", roleCheck(["admin"]), createEvent);
router.delete("/:eventId", roleCheck(["admin"]), deleteEvent);
router.put("/:id", updateEvent);

module.exports = router;
