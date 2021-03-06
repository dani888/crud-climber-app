const express = require("express")
const classRouter = express.Router()
const classes = require('../models/classes');
const schedule = require('../models/scheduler');
const User = require('../models/user');
const seed = require('../models/seed');
const isAuthenticated = require('../utils/auth');


// INDEX ROUTE
classRouter.get('/', (req, res) => {
    classes.find({}, (err, classes) => { 
      User.findById(req.session.user, (err, users) => { 
        console.log(users)
        res.render("index.ejs", {
            allClasses: classes,
            user: users,
            currentUser: req.session.user,
        })
      })
    })
  })   
// 
// classRouter.get("/", (req, res) => {
//   if (req.session.user) {
//     res.render("index.ejs", {
//       currentUser: req.session.user,
//     })
//   } else {
//     res.render("scheduler.ejs", {
//       currentUser: req.session.user,
//     })
//   }
// })
// protected route scheduler
classRouter.get('/scheduler', isAuthenticated, (req, res) => {
  try {
    schedule.find({}, async (err, schedules) => { 
        let usedClasses = await Promise.all(schedules.map(schedule=>classes.findById(schedule.classId).exec()))
        User.findById(req.session.user, (err, users) => { 
        res.render("indexschedule.ejs", {
            currentUser: req.session.user,
            user: users,
            usedClasses: usedClasses,
            schedules: schedules
      })
    })
  }
  )} catch (error){
      res.status(500).json({error: 'something went wrong'})
    }
})
// protected route create new class
classRouter.get("/new", isAuthenticated,  (req, res) => {
    res.render("new.ejs")
  })
// post new class
classRouter.post("/", (req, res) => {
    req.body.completed = !!req.body.completed;
    classes.create(req.body, (error, product) => {
    res.redirect('/classes')
    })
  })
// delete route
classRouter.delete("/scheduler/:id", (req, res) => {
    schedule.findByIdAndRemove(req.params.id, (err, data) => {
      res.redirect("/classes/scheduler")
    })
  })
// route seed database
classRouter.get('/seed', (req, res) => {
    classes.deleteMany({}, (error, classes) => {})
    schedule.deleteMany({}, (error, classes) => {})
    classes.create(seed, (error, data) => {
    res.redirect("/classes")
    // res.send(seed);
    })
})
// edit route
classRouter.get("/scheduler/:id/edit", (req, res) => {
    schedule.findById(req.params.id, (err, schduler) => {
        classes.findById(schduler.classId, (err, classe) => {
            res.render("edit.ejs", { 
                clas:classe,
                schedule:schduler
            })
        })
    })
})
classRouter.put("/scheduler/:id", (req, res) => {
    req.body.completed = !!req.body.completed;
    schedule.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      },
      (error, updatedProducts) => {
        res.redirect(`/classes/scheduler/${req.params.id}`)
      }
    )
})
classRouter.post('/:id', (req, res) => {
    req.body.completed = !!req.body.completed; // !!'on' -> true or !!undefined -> false
    schedule.create(req.body, (err, book) => {
        res.redirect('/classes/scheduler'); // tells the browser to make another GET request to /books
    });
});
// SHOW ROUTE
classRouter.get("/scheduler/:id", isAuthenticated, (req, res) => {
    schedule.findById(req.params.id, (err, schduler) => {
        classes.findById(schduler.classId, (err, classe) => {
            res.render("showsched.ejs", { 
                currentUser: req.session.user,
                clas:classe,
                schedule:schduler
            })
        })
    })
})

classRouter.get("/:id", isAuthenticated, (req, res) => {
    classes.findById(req.params.id, (err, classe) => {
      res.render("show.ejs", { classe, currentUser: req.session.user })
    })
  })

module.exports = classRouter