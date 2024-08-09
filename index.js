const express = require("express");
const app = express();
const router = require("./src/router/messageRouter");
const createUserRouter = require("./src/router/creatUserRouter");
const wppconnect = require("@wppconnect-team/wppconnect");
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
    wppconnect
      .create({
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
      .then(async (client) => {
        try {
          await client.initialize();
          console.log("Client initialized successfully");

          setTimeout(() => {
            sendMessage(client);
          }, 10000);
        } catch (error) {
          console.error("Error initializing client:", error);
        }
      })

      .catch((error) => {
        console.log(error);
      });

    const sendMessage = async (client) => {
      try {
        await birthdays.map(async (entry) => {
          let phoneNumber = `91${entry.number}@c.us`;
          let message = `Happy Birthday, ${entry.Name}!

🎉🎂 Wishing you a fantastic day filled with joy and laughter! May this year bring you success, happiness, and unforgettable moments. Your enthusiasm and positive spirit at VSBM are truly inspiring. Enjoy your special day to the fullest!

Best wishes,
[Saraswati Dash/VSBM]`;
          await client
            .sendText(phoneNumber, message)
            .then(async (result) => {
              console.log("Message sent: ", result);
            })
            .catch((error) => {
              console.error("Error when sending message: ", error);
            });

          //close client after 10 minutes
          setTimeout(() => {
            client.close();
          }, 1000 * 60 * 60);
        });
      } catch (error) {
        console.error("Error sending message:", error);
      }
    };
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
