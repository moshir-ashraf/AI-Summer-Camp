const express = require('express')
const router = express.Router()
const controller = require('./controller')
const render = require('./render')

// Main routes
router.get('/', render.renderIntro)
router.get('/lobby', render.renderLobby)
router.get('/admin', render.renderAdmin)

// Task routes
router.get('/task1', render.renderTask1)
router.get('/task2', render.renderTask2)
router.get('/task3', render.renderTask3)
router.get('/task4', render.renderTask4)
router.get('/task5', render.renderTask5)

// Final route
router.get('/final', render.renderFinal)

// API routes
router.post('/login', controller.login)
router.post('/loginAsStudent', controller.loginAsStudent)
router.get('/logout', controller.logout)
router.post('/register', controller.register)
router.post('/updateScore', controller.updateScore)
router.get('/api/leaderboard', controller.getAllUsers)
router.post('/api/removeAll', controller.removeAllUsers)

// Game State API routes
router.get('/api/gameState', controller.getGameState)
router.post('/api/pauseGame', controller.pauseGame)
router.post('/api/resumeGame', controller.resumeGame)
router.post('/api/startGame', controller.startGame)
router.post('/api/setCurrentTask', controller.setCurrentTask)
router.post('/api/updateGameSettings', controller.updateGameSettings)

// Default route handler
router.use(render.handleDefaultRoute)

module.exports = router
