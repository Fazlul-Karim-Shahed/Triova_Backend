const formidable = require("formidable");
const { EmployeeModel } = require("../../Models/EmployeeModel");
const { formDataToObj } = require("../../Functions/formDataToObj");
const { saveAndGetFile } = require("../../Functions/saveAndGetFile");
const { cleanObject } = require("../../Functions/cleanObject");

// Controller to update employee by ID
const updateEmployee = async (req, res) => {
    const form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, async (err, fields, files) => {
        if (err) return res.status(500).send({ message: "Form parse error", error: true });

        // Helper function to convert strings to proper types
        const convertTypes = (obj) => {
            const result = { ...obj };

            // Convert booleans (checkbox values come as strings)
            ["mobileVerified", "superAdminVerified"].forEach((key) => {
                if (result[key] !== undefined) {
                    result[key] = result[key] === "true" || result[key] === true;
                }
            });

            // Convert numbers
            ["commissionRate", "salary"].forEach((key) => {
                if (result[key] !== undefined) {
                    const num = Number(result[key]);
                    if (!isNaN(num)) result[key] = num;
                }
            });

            // Convert date strings to Date objects
            if (result.dob) {
                const date = new Date(result.dob);
                if (!isNaN(date)) {
                    result.dob = date;
                } else {
                    delete result.dob; // invalid date
                }
            }

            return result;
        };

        try {
            // Clean and convert form fields
            const cleanedFields = convertTypes(cleanObject(formDataToObj(fields)));

            const employeeId = req.params.id;
            const existing = await EmployeeModel.findById(employeeId);

            if (!existing) return res.status(404).send({ message: "Employee not found", error: true });

            // Update text and typed fields
            Object.assign(existing, cleanedFields);

            // File fields to handle
            const fileFields = [
                { key: "image", targetField: "image" },
                { key: "nidFrontImage", targetField: "nidFrontImage" },
                { key: "nidBackImage", targetField: "nidBackImage" },
            ];

            // Process files if uploaded
            for (const { key, targetField } of fileFields) {
                if (files[key]) {
                    const savedFile = await saveAndGetFile(files[key][0]);
                    if (savedFile) existing[targetField] = savedFile;
                }
            }

            // Save updated employee
            const updated = await existing.save();

            return res.send({
                message: "Employee updated successfully",
                error: false,
                data: updated,
            });
        } catch (error) {
            console.error("Update Employee Error:", error);
            return res.status(500).send({ message: error.message || "Server error", error: true });
        }
    });
};

module.exports.updateEmployee = updateEmployee;
