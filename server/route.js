const express = require('express')
const router = express.Router()
const controller = require('./controller')
const render = require('./render')

// Main routes
router.get('/', render.renderIntro)
router.get('/lobby', render.renderLobby)
router.get('/admin', render.renderAdmin)

// Task routes
router.get('/task1-realtime', render.renderTask1Realtime)
router.get('/task1', render.renderTask1)
router.get('/task2', render.renderTask2)
router.get('/task3', render.renderTask3)
router.get('/task4', render.renderTask4)
router.get('/task5', render.renderTask5)
router.get('/task-deep-learning', render.renderTaskDeepLearning)

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

// Game API routes
router.post('/api/game/create', controller.createGame)
router.post('/api/game/reset', controller.resetGame)
router.post('/api/game/start', controller.startGame)
router.post('/api/game/pause', controller.pauseGame)
router.post('/api/game/resume', controller.resumeGame)
router.post('/api/game/next-question', controller.nextQuestion)
router.post('/api/game/end-question', controller.endQuestion)
router.post('/api/game/auto-end-question', controller.endQuestion)
router.get('/api/game/status', controller.getGameStatus)
router.post('/api/game/submit-answer', controller.submitAnswer)

// Task API routes
router.get('/api/task/current', controller.getCurrentTask)
router.post('/api/task/set-mode', controller.setTaskMode)
router.post('/api/task/remove-all', controller.removeAllTasks)

// Default route handler
router.use(render.handleDefaultRoute)

module.exports = router
