
const { makePayment } = require("../Controllers/EmployeeControllers/makePayment");
const { roleCheck } = require("../Middlewares/roleCheck");

const router = require("express").Router();


router.post("/:employeeId/make-payment", roleCheck(["admin"]), makePayment);


module.exports = router;
