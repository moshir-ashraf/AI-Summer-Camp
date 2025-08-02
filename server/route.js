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

router.get('/lobby', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/');
  }
  res.render('lobby', { user: req.session.user });
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
  res.render('task1', { user: req.session.user });
})

router.get('/task2', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/');
  }
  res.render('task2', { user: req.session.user });
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
