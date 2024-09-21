const express = require("express");
const app = express();
const router = require("./src/router/messageRouter");
const createUserRouter = require("./src/router/creatUserRouter");
const mongoose = require("mongoose");
const UserModel = require("./src/models/users-model");
const cors = require("cors");
const moment = require("moment-timezone");
const nodemailer = require("nodemailer");
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

// send wish using mail

const wishUsingMail = async (birthdays) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail", // You can use other email services like 'hotmail', 'yahoo', etc.
      auth: {
        user: process.env.emailFrom, // Your email
        pass: process.env.emailPass, // Your email password or an App password for Gmail
      },
    });

    // Step 2: Define email options
    birthdays.map((student) => {
      const mailOptions = {
        from: process.env.emailFrom, // Sender's email
        to: student.Email, // Receiver's email
        subject: "Test Email from Nodemailer", // Subject line
        html: `<!DOCTYPE html>
 <html lang="en">
 <head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Birthday Wishes</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
      color: #333;
    }

    .container {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      background-color: #fff;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .header {
      background-color: #fcbf49;
      padding: 20px;
      text-align: center;
    }

    .header img {
      width: 250px;
      height: auto;
      border-top-left-radius: 10px;
      border-top-right-radius: 10px;
    }

    .content {
      padding: 20px;
      text-align: center;
    }

    .content h1 {
      color: #333;
      font-size: 28px;
    }

    .content p {
      font-size: 16px;
      line-height: 1.6;
      color: #555;
    }

    .content .btn {
      display: inline-block;
      margin-top: 20px;
      padding: 10px 20px;
      background-color: #f77f00;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      font-size: 16px;
    }

    .footer {
      background-color: #fcbf49;
      padding: 10px;
      text-align: center;
      font-size: 14px;
      color: #333;
    }

    .footer a {
      color: #f77f00;
      text-decoration: none;
    }
  </style>
</head>

<body>
  <div class="container">
    <!-- Header with Image -->
    <div class="header">
       <img src="https://thumbs.dreamstime.com/b/happy-birthday-flowers-background-323125849.jpg" alt="Happy Birthday">
    </div>

    <!-- Content Section -->
    <div class="content">
      <h1>Happy Birthday, ${student.Name}!</h1>
      <p>Wishing you a day filled with love, laughter, and all your heart's desires. We hope you have an amazing birthday surrounded by your loved ones.</p>
      <p>As you embark on another wonderful year, may your days be filled with happiness, and may all your dreams come true!</p>

      <!-- Optional Button (e.g., to send a gift, join a celebration) -->
      
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>Sent with love by [Ayushman]</p>
      
    </div>
  </div>
</body>

</html>
`,
      };

      // Step 3: Send the email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log(error);
        }
        console.log("Email sent: " + info.response);
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
      // wish(birthdays);
      wishUsingMail(birthdays);
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
    // wishUsingMail();
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

// UserModel.updateMany({ DOB: { $type: "string" } }, [
//   { $set: { DOB: { $dateFromString: { dateString: "$DOB" } } } },
// ]).exec();

// UserModel.updateMany({ DOB: { $exists: true, $type: "string" } }, [
//   {
//     $set: {
//       DOB: {
//         $let: {
//           vars: {
//             parts: {
//               $split: [
//                 {
//                   $replaceAll: {
//                     input: "$DOB",
//                     find: /[-./]/,
//                     replacement: "-",
//                   },
//                 },
//                 "-",
//               ],
//             },
//           },
//           in: {
//             $concat: [
//               { $arrayElemAt: ["$$parts", 2] }, // Year
//               "-",
//               { $arrayElemAt: ["$$parts", 1] }, // Month
//               "-",
//               { $arrayElemAt: ["$$parts", 0] }, // Day
//             ],
//           },
//         },
//       },
//     },
//   },
// ]);

UserModel.aggregate([
  {
    $addFields: {
      // Replace slashes, dots, and dashes with hyphens for uniformity
      formattedDOB: {
        $replaceAll: {
          input: "$dob", // Assuming "dob" is the field storing the date
          find: "/",
          replacement: "-",
        },
      },
    },
  },
  {
    $addFields: {
      formattedDOB: {
        $replaceAll: {
          input: "$formattedDOB",
          find: ".",
          replacement: "-",
        },
      },
    },
  },
  {
    $addFields: {
      // Convert the string to date using the format dd-MM-yyyy
      formattedDOB: {
        $dateFromString: {
          dateString: "$formattedDOB",
          format: "%d-%m-%Y",
        },
      },
    },
  },
  {
    $merge: {
      into: "collection", // Replace with your collection name
      whenMatched: "merge",
    },
  },
]);
