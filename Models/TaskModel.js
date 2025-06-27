const { model, Schema } = require("mongoose");

const TaskModel = model(
    "Task",
    new Schema(
        {
            name: { type: String, required: [true, "Task name is required"] },
            description: { type: String, required: [true, "Description is required"] },
            deadline: { type: Date, required: [true, "Deadline is required"] },
            priority: { type: String, required: [true, "Priority is required"], default: "high", enum: ["high", "medium", "low"] },
            status: { type: String, required: [true, "Status is required"], default: "pending", enum: ["pending", "completed"] },
            assignedTo: { type: Schema.Types.ObjectId, ref: "SuperAdmin", required: [true, "Assigned to is required"] },
            assignedBy: { type: Schema.Types.ObjectId, ref: "SuperAdmin", required: [true, "Assigned by is required"] },
            
        },
        { timestamps: true }
    )
);

module.exports.TaskModel = TaskModel;
