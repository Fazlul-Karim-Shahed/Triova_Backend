


const { TaskModel } = require("../../Models/TaskModel")


const deleteTask = async (req, res) => {


    let task = await TaskModel.deleteOne({ _id: req.params.taskId })


    if (task.deletedCount != 0) {

        res.status(200).send({ message: 'task deleted successfully', error: false })
    }
    else {
        res.send({ message: 'No task found', error: true })
    }

}

module.exports.deleteTask = deleteTask