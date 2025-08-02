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
    
    res.render('lobby', { 
      user: user,
      nextTask: nextTask
    });
  } catch (error) {
    console.error('Error refreshing user data:', error);
    // Fallback to session data
    const user = req.session.user;
    const nextTask = (user.lastTaskCompleted || 0) + 1;
    
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
