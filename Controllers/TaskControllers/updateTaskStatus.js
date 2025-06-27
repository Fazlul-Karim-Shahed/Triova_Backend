const { TaskModel } = require("../../Models/TaskModel");

const updateTaskStatus = async (req, res) => {

    const { taskId } = req.params;
    const { status } = req.body;

    
    try {
        const updatedTask = await TaskModel.findByIdAndUpdate(taskId, { status }, { new: true });

        if (!updatedTask) {
            return res.status(404).send({
                message: "Task not found",
                error: true,
            });
        }

        res.status(200).send({
            message: "Task status updated successfully",
            error: false,
            data: updatedTask,
        });
    } catch (err) {
        res.status(500).send({
            message: "Server error while updating task status",
            error: true,
            details: err.message,
        });
    }
};

module.exports.updateTaskStatus = updateTaskStatus;
