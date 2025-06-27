
const { default: mongoose } = require("mongoose");
const { TaskModel } = require("../../Models/TaskModel");

const getIndividualTask = async (req, res) => {
    const { id } = req.params;

    try {
        const task = await TaskModel.find({ assignedTo: id }).populate("assignedBy")

        if (!task) {
            return res.status(404).send({
                message: "Task not found",
                error: true,
            });
        }

        res.status(200).send({
            message: "Task fetched successfully",
            error: false,
            data: task,
        });
    } catch (err) {
        res.status(500).send({
            message: "Server error while fetching task",
            error: true,
            details: err.message,
        });
    }
};

module.exports.getIndividualTask = getIndividualTask;
