// Dependencies
const express = require("express")
const bcrypt = require("bcrypt")
const sessionsRouter = express.Router()
const User = require("../models/user.js")

// New (login page)
sessionsRouter.get("/new", (req, res) => {
    res.render("sessions/new.ejs", {
      currentUser: req.session.currentUser,
    })
  })
// Create (login route)
sessionsRouter.post("/", (req, res) => {
    // Check for an existing user
    User.findOne(
      {
        email: req.body.email,
      },
      (error, foundUser) => {
        // send error message if no user is found
        if (!foundUser) {
          res.send(`Oops! No user with that email address has been registered.`)
        } else {
          // If a user has been found
          // compare the given password with the hashed password we have stored
          const passwordMatches = bcrypt.compareSync(
            req.body.password,
            foundUser.password
          )
  
          // if the passwords match
          if (passwordMatches) {
            // add the user to our session
            req.session.user = foundUser._id
  
            // redirect back to our home page
            res.redirect("/classes")
          } else {
            // if the passwords don't match
            res.send("Oops! Invalid credentials.")
          }
        }
      }
    )
  })

// Delete (logout route)
sessionsRouter.delete("/", (req, res) => {
    req.session.destroy((error) => {
      res.redirect("/classes")
    })
  })
// Create (login route)
// New (login page)
sessionsRouter.get("/new", (req, res) => {
    res.render("sessions/new.ejs")
  })
// Export Sessions Router
module.exports = sessionsRouter