
const { makePayment } = require("../Controllers/EmployeeControllers/makePayment");
const { updateEmployee } = require("../Controllers/EmployeeControllers/updateProfile");
const { roleCheck } = require("../Middlewares/roleCheck");

const router = require("express").Router();


router.post("/:employeeId/make-payment", roleCheck(["admin"]), makePayment);
router.put("/:id", roleCheck(["admin"]), updateEmployee);


module.exports = router;
