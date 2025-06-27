const { TaskModel } = require("../../Models/TaskModel");

const getAllTasks = async (req, res) => {
    let tasks = await TaskModel.find({  }).populate(["assignedTo", "assignedBy"])

    if (tasks.length != 0) {
        res.status(200).send({ message: "All tasks", error: false, data: tasks });
    } else {
        res.send({ message: "No tasks found", error: true });
    }
};

module.exports.getAllTasks = getAllTasks;
