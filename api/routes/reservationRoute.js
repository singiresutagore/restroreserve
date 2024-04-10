var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
const nodemailer = require("nodemailer");

const Day = require("../models/day").model;
const Reservation = require("../models/reservation").model;

// Nodemailer transporter configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "stagore194@gmail.com",
    pass: "tnwc bafb jdke vddw" // Use the 16-digit app password here
  }
});

router.post("/", function(req, res, next) {
  Day.find({ date: req.body.date }, (err, days) => {
    if (!err) {
      if (days.length > 0) {
        let day = days[0];
        day.tables.forEach(table => {
          if (table._id == req.body.table) {
            // The correct table is table
            table.reservation = new Reservation({
              name: req.body.name,
              phone: req.body.phone,
              email: req.body.email
            });
            table.isAvailable = false;
            day.save(err => {
              if (err) {
                console.log(err);
                res.status(500).send("Error occurred while making reservation");
              } else {
                console.log("Reserved");
                sendReservationEmail(
                  req.body.email,
                  req.body.name,
                  req.body.date,
                  req.body.table
                );
                res.status(200).send("Reservation successfully made");
              }
            });
          }
        });
      } else {
        console.log("Day not found");
        res.status(404).send("Day not found");
      }
    } else {
      console.log("Error finding day:", err);
      res.status(500).send("Error occurred while searching for day");
    }
  });
});

// Function to send reservation confirmation email
const sendReservationEmail = (to, name, date, tableNo) => {
  const mailOptions = {
    from: "stagore194@gmail.com",
    to,
    subject: "Reservation Confirmation",
    text: `Dear ${name},\n\nYour reservation has been successfully made.\n\nDate: ${date}\nTable Number: ${tableNo}\n\nThank you for choosing our restaurant!`
  };

  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Reservation confirmation email sent:", info.response);
    }
  });
};

module.exports = router;
