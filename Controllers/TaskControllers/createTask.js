const fs = require("fs");
const path = require("path");
const { TaskModel } = require("../../Models/TaskModel");
const formidable = require("formidable");
const { formDataToObj } = require("../../Functions/formDataToObj");
const { cleanObject } = require("../../Functions/cleanObject");
const { sendEmail } = require("../../Functions/sendEmail");
const { SuperAdminModel } = require("../../Models/SuperAdminModel");

const createTask = async (req, res) => {
    const data = cleanObject(req.body);

    let task = new TaskModel(data);

    let admin = await SuperAdminModel.findOne({ _id: task.assignedTo });

    //console.log(admin);

    let emailTemplate = `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6fa; padding: 0px;">
    <div style="margin: auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
      
      <!-- Header -->
      <div style="background: linear-gradient(to right, #667eea, #764ba2); color: white; padding: 20px 30px;">
        <h2 style="margin: 0; font-size: 24px;">📝 New Task Assigned</h2>
      </div>
      
      <!-- Body -->
      <div style="padding: 10px;">
        <p style="font-size: 16px; margin-bottom: 20px;">
          Dear <strong>${admin.firstName} ${admin.lastName}</strong>,
        </p>
        
        <p style="font-size: 15px; color: #444;">You have been assigned a new task. Please review the details below:</p>

        <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #555;">📌 Task Name:</td>
            <td style="padding: 8px 0; color: #333;">${task.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #555;">🗓 Deadline:</td>
            <td style="padding: 8px 0; color: #333;">${new Date(task.deadline).toLocaleDateString()}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #555;">📈 Status:</td>
            <td style="padding: 8px 0; color: #333;">${task.status}</td>
          </tr>
        </table>

        <div style="margin-top: 20px; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #667eea; border-radius: 6px;">
          <div style="color: #333; font-size: 14px;">
            ${task.description}
          </div>
        </div>

        <p style="font-size: 14px; color: #666; margin-top: 40px;">
          Best regards,<br/>
          <strong>Triova Limited System</strong>
        </p>
      </div>
    </div>
  </div>
`;

    await sendEmail(admin.email, `New task created`, emailTemplate);

    task.save()
        .then((task) => {
            res.send({ message: "task created successfully", error: false, data: task });
        })
        .catch((err) => {
            res.send({ message: err.message, error: true });
        });
};

module.exports.createTask = createTask;
