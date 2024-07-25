const express = require("express");
const app = express();
const router = require("./src/router/messageRouter");
const createUserRouter = require("./src/router/creatUserRouter");
// const cron = require("node-cron"); // cron is use for set a time when you want to run the function
const wppconnect = require("@wppconnect-team/wppconnect");
const mongoose = require("mongoose");
const UserModel = require("./src/models/users-model");
const cors = require("cors");
const moment = require("moment-timezone");
require("dotenv").config();

app.use(cors());
app.use(express.json());
app.use(router);
app.use(createUserRouter);

//connect to mongoDb
mongoose
  .connect(process.env.mongoUrl, { serverSelectionTimeoutMS: 3000 })
  .then(() => {
    console.log("mongodb connected");
  })
  .catch((err) => {
    console.log(err);
  });

function getCurrentISTTime() {
  return moment().tz("Asia/Kolkata");
}
// getCurrentISTTime();

const wish = (birthdays) => {
  try {
    wppconnect
      .create({
        session: "sessionName",
        headless: true, // Set to false to see the browser window
        devtools: false, // Optionally open devtools
        useChrome: false, // Use Chrome instead of Chromium if puppeeter is causing error
        puppeteerOptions: {
          args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-accelerated-2d-canvas",
            "--disable-gpu",
          ],
          ignoreDefaultArgs: ["--disable-extensions"], // Ignore this if causing issues
        },
      })
      .then((client) => {
        // start(client);
        birthdays.map((entry) => {
          let phoneNumber = `91${entry.number}@c.us`;
          let message = `hello ${entry.name} ,this message is for testing purpose`;
          client
            .sendText(phoneNumber, message)
            .then( async(result) => {
              console.log("Message sent: ", result);
              await client.close();
            })
            .catch((error) => {
              console.error("Error when sending message: ", error);
            });
            
        });
      })
      .catch((error) => {
        console.log(error);
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
              date: "$dob",
            },
          },
        },
      },
      {
        $match: {
          dayMonth: "24-07",
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

// findBirthdays();

// Schedule the function to run every day at 12.00 am
// cron.schedule(
//   "5 * * * *",
//   () => {
//     findBirthdays();
//   },
//   {
//     scheduled: true,
//     timezone: "Asia/Kolkata",
//   }
// );

app.get("/api/cron", async (req, res) => {
  try {
    findBirthdays();
    console.log("Cron job is working (FROM ROUTE)");
    res.send("Cron job is working");
  } catch (error) {
    console.log(error);
  }
});
app.listen(5000, () => {
  console.log("hello from port 5000");
});

//use for format whole dbs users dobs

// UserModel.updateMany(
//   { dob: { $type: 'string' } },
//   [{ $set: { dob: { $dateFromString: { dateString: "$dob" } } } }]
// ).exec();
