const express = require("express");
const app = express();
const router = require("./src/router/messageRouter");
const createUserRouter = require("./src/router/creatUserRouter");
const mongoose = require("mongoose");
const UserModel = require("./src/models/users-model");
const cors = require("cors");
const moment = require("moment-timezone");
const port = process.env.PORT || 5000;
require("dotenv").config();

app.use(cors());
app.use(express.json());
app.use(router);
app.use(createUserRouter);

//connect to mongoDb
mongoose
  .connect(process.env.mongoUrl, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log("mongodb connected");
  })
  .catch((err) => {
    console.log(err);
  });

function getCurrentISTTime() {
  return moment().tz("Asia/Kolkata");
}

//for cheacking is our whatsapp client is ready or not

const wish = (birthdays) => {
  try {
    birthdays.map((student) => {
      const data = JSON.stringify({
        messaging_product: "whatsapp",
        preview_url: false,
        recipient_type: "individual",
        to: `91${student.number}`,
        type: "template",
        template: {
          name: "student_birthday_wish",
          language: { code: "en" },
          components: [
            {
              type: "body",
              parameters: [
                {
                  type: "text",
                  text: `${student.Name}`,
                },
              ],
            },
          ],
        },
      });

      const headers = {
        Authorization: `Bearer EAAVrnNBcbqABO8GL1QhkMZB37LEbDyVwBmq2b78TqTyncGD7gxkZC1GX8aDXD6utIlfeLRJZATBajawxsfvvVXijVdY9IRgMeXBGXka1Hp7KjO6l7Oc6eCWVuFEW9mi6xpa0TXMHDs76BsBUVZCIzNlvyeNs3VqyNs13NbqZCXz0b3e6T5iKe4ZCCCqSCISPxFnEtyKcLBLMQ14MGWh8dCh4R1pIkXMwndU1UZD`,
        "Content-Type": "application/json",
      };
      axios
        .post(
          "https://graph.facebook.com/v20.0/362948586905168/messages",
          data,
          {
            headers,
          }
        )
        .then((response) => {
          // Handle the response
          console.log("Response:", response.data);
        })
        .catch((error) => {
          // Handle the error
          console.error(
            "Error:",
            error.response ? error.response.data : error.message
          );
        });
    });
  } catch (error) {
    console.log(error);
  }
};

const findBirthdays = async () => {
  try {
    // Get the current date and time in UTC
    const today = getCurrentISTTime();
    const formattedDate = today
      .format("DD-MM") // Format as "DD-MM"
      .toString();

    console.log("formatedDate", formattedDate);

    const pipeline = [
      {
        $addFields: {
          dayMonth: {
            $dateToString: {
              format: "%d-%m",
              date: "$DOB",
            },
          },
        },
      },
      {
        $match: {
          dayMonth: formattedDate,
        },
      },
    ];

    // const birthdays = await UserModel.aggregate(pipeline);
    const birthdays = await UserModel.aggregate(pipeline);
    console.log(birthdays);

    if (birthdays.length != 0) {
      wish(birthdays);
    } else {
      console.log("not a single birthday present");
    }
  } catch (error) {
    console.log(error);
  }
};

app.get("/api/cron", async (req, res) => {
  try {
    findBirthdays();
    console.log("Cron job is working (FROM ROUTE)");
    res.send("Cron job is working");
  } catch (error) {
    console.log(error);
  }
});

app.listen(port, () => {
  console.log("hello from port 5000");
});

//use for format whole dbs users dobs

// UserModel.updateMany(
//   { dob: { $type: 'string' } },
//   [{ $set: { dob: { $dateFromString: { dateString: "$dob" } } } }]
// ).exec();
