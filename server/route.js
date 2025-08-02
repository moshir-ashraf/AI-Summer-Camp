const express = require('express')
const router = express.Router()
const controller = require('./controller')

router.get('/', (req, res) => {
  if (req.session.user) {
    return res.redirect('/lobby');
  }
  
  const message = req.session.message || null;
  req.session.message = null;
  res.render('intro', { message });
})

router.get('/lobby', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/');
  }
  
  try {
    // Refresh user data from database to get latest lastTaskCompleted
    const User = require('./model');
    const userResult = await User.get(req.session.user._id, '_id');
    
    let user = req.session.user;
    if (userResult.success.status) {
      // Update session with fresh data
      req.session.user.lastTaskCompleted = userResult.data.lastTaskCompleted;
      req.session.user.score = userResult.data.score;
      user = req.session.user;
    }
    
    const nextTask = (user.lastTaskCompleted || 0) + 1;
    
    // If all tasks are completed (lastTaskCompleted is 5), redirect to final page
    if (user.lastTaskCompleted >= 5) {
      return res.redirect('/final');
    }
    
    res.render('lobby', { 
      user: user,
      nextTask: nextTask
    });
  } catch (error) {
    console.error('Error refreshing user data:', error);
    // Fallback to session data
    const user = req.session.user;
    const nextTask = (user.lastTaskCompleted || 0) + 1;
    
    // If all tasks are completed (lastTaskCompleted is 5), redirect to final page
    if (user.lastTaskCompleted >= 5) {
      return res.redirect('/final');
    }
    
    res.render('lobby', { 
      user: user,
      nextTask: nextTask
    });
  }
})

router.get('/admin', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'INSTRUCTOR') {
    return res.redirect('/');
  }
  res.render('admin', { user: req.session.user });
})

router.get('/task1', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/');
  }
  
  const user = req.session.user;
  const lastCompleted = user.lastTaskCompleted || 0;
  
  // Only allow task 1 if no tasks completed or task 1 already completed (allow replay of current task)
  if (lastCompleted >= 1) {
    // Already completed, allow access
    res.render('task1', { user: req.session.user });
  } else if (lastCompleted === 0) {
    // First task, allow access
    res.render('task1', { user: req.session.user });
  } else {
    // Shouldn't happen, but redirect to lobby
    return res.redirect('/lobby');
  }
})

router.get('/task2', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/');
  }
  
  const user = req.session.user;
  const lastCompleted = user.lastTaskCompleted || 0;
  
  // Only allow task 2 if task 1 is completed
  if (lastCompleted >= 1) {
    res.render('task2', { user: req.session.user });
  } else {
    // Redirect to lobby if trying to access task 2 without completing task 1
    return res.redirect('/lobby');
  }
})

router.get('/task3', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/');
  }
  
  const user = req.session.user;
  const lastCompleted = user.lastTaskCompleted || 0;
  
  // Only allow task 3 if task 2 is completed
  if (lastCompleted >= 2) {
    res.render('task3', { user: req.session.user });
  } else {
    // Redirect to lobby if trying to access task 3 without completing task 2
    return res.redirect('/lobby');
  }
})

router.get('/task4', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/');
  }
  
  const user = req.session.user;
  const lastCompleted = user.lastTaskCompleted || 0;
  
  // Only allow task 4 if task 3 is completed
  if (lastCompleted >= 3) {
    res.render('task4', { user: req.session.user });
  } else {
    // Redirect to lobby if trying to access task 4 without completing task 3
    return res.redirect('/lobby');
  }
})

router.get('/task5', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/');
  }
  
  const user = req.session.user;
  const lastCompleted = user.lastTaskCompleted || 0;
  
  // Only allow task 5 if task 4 is completed
  if (lastCompleted >= 4) {
    res.render('task5', { user: req.session.user });
  } else {
    // Redirect to lobby if trying to access task 5 without completing task 4
    return res.redirect('/lobby');
  }
})

router.get('/final', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/');
  }
  
  try {
    // Refresh user data from database to get latest score
    const User = require('./model');
    const userResult = await User.get(req.session.user._id, '_id');
    
    let user = req.session.user;
    if (userResult.success.status) {
      // Update session with fresh data
      req.session.user.score = userResult.data.score;
      user = req.session.user;
    }
    
    const lastCompleted = user.lastTaskCompleted || 0;
    
    // Only allow final page if task 5 is completed
    if (lastCompleted >= 5) {
      res.render('final', { user: user });
    } else {
      // Redirect to lobby if trying to access final page without completing task 5
      return res.redirect('/lobby');
    }
  } catch (error) {
    console.error('Error refreshing user data:', error);
    // Fallback to session data
    const user = req.session.user;
    const lastCompleted = user.lastTaskCompleted || 0;
    
    if (lastCompleted >= 5) {
      res.render('final', { user: user });
    } else {
      return res.redirect('/lobby');
    }
  }
})

router.post('/login', controller.login)
router.post('/loginAsStudent', controller.loginAsStudent)
router.get('/logout', controller.logout)
router.post('/register', controller.register)
router.post('/updateScore', controller.updateScore)

router.use((req, res) => {
  if (req.session.user) {
    return res.redirect('/lobby');
  }
  res.redirect('/');
})

module.exports = router
