var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
const nodemailer = require("nodemailer");

const Day = require("../models/day").model;

// Nodemailer transporter configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "stagore194@gmail.com",
    pass: "tnwc bafb jdke vddw" // Use the 16-digit app password here
  }
});

router.post("/", function(req, res, next) {
  console.log("request attempted");

  console.log(req.body);
  const dateTime = new Date(req.body.date);

  Day.find({ date: dateTime }, (err, docs) => {
    if (!err) {
      if (docs.length > 0) {
        // Record already exists
        console.log("Record exists. Sent docs.");
        res.status(200).send(docs[0]);
      } else {
        // Searched date does not exist and we need to create it
        const allTables = require("../data/allTables");
        const day = new Day({
          date: dateTime,
          tables: allTables
        });
        day.save(err => {
          if (err) {
            res.status(400).send("Error saving new date");
          } else {
            // Saved date and need to return all tables (because all are now available)
            console.log("Created new datetime. Here are the default docs");
            Day.find({ date: dateTime }, (err, docs) => {
              if (err) {
                res.sendStatus(400);
              } else {
                // Send email notification
                sendEmail(
                  "recipient@example.com",
                  "Reservation Confirmation",
                  req.body.name,
                  req.body.date, // Assuming this is the reservation time
                  req.body.table // Assuming this is the table number
                );
                res.status(200).send(docs[0]);
              }
            });
          }
        });
      }
    } else {
      res.status(400).send("Could not search for date");
    }
  });
});

// Function to send email
const sendEmail = (to, subject, name, reservationTime, tableNo) => {
  const text = `Dear ${name},\n\nYour reservation has been successfully made.\n\nReservation Time: ${reservationTime}\nTable Number: ${tableNo}\n\nThank you for choosing our restaurant!`;

  const mailOptions = {
    from: "stagore194@gmail.com",
    to,
    subject,
    text
  };

  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
};

module.exports = router;
