

const { createTask } = require("../Controllers/TaskControllers/createTask");
const { deleteTask } = require("../Controllers/TaskControllers/deleteTask");
const { getAllTasks } = require("../Controllers/TaskControllers/getAllTasks");
const { getIndividualTask } = require("../Controllers/TaskControllers/getIndividualTask");
const { updateTaskStatus } = require("../Controllers/TaskControllers/updateTaskStatus");
const { roleCheck } = require("../Middlewares/roleCheck");

const router = require("express").Router();

router.get("/", roleCheck(["admin", "employee", "influencer", "promoter"]), getAllTasks);
router.get("/:id", roleCheck(["admin", "employee", "influencer", "promoter"]), getIndividualTask);
router.post("/", roleCheck(["admin"]), createTask);
router.put("/:taskId", roleCheck(["admin", "employee", "influencer", "promoter"]), updateTaskStatus);
router.delete("/:taskId", roleCheck(["admin"]), deleteTask);

module.exports = router;
