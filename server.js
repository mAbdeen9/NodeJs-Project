const mongoose = require("mongoose");
const app = require("./app");
require("dotenv").config();

//-Connect Mongoose
(async () => {
  try {
    await mongoose.connect(process.env.DB, {
      useNewUrlParser: true,
    });
    console.log("DB Connection Successful 💥 ");
  } catch (err) {
    console.log(err.message);
  }
})();

//-Listen To Server
const server = app.listen(process.env.PORT || 3000, () =>
  console.log(`Server is up 🚀 => PORT: ${process.env.PORT} `)
);

// Handle all not handled Promises
process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! Shutting down...");
  console.log(err);
  server.close(() => {
    process.exit(1);
  });
});
