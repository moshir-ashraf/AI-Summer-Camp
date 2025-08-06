const User = require("./user");
const Game = require("./game");
const Task = require("./task");
const Result = require("./result");

const jsonToObject = (json, role = "STUDENT") => new User(json, role);

const isAjaxRequest = (req) => req.headers.accept && req.headers.accept.includes('application/json');

const register = async (req, res) => {
  try {
    const userJSON = { name: req.body.userName || req.body.name };
    const user = jsonToObject(userJSON);
    const result = await user.create();
    
    if (result.success.status) {
      req.session.user = result.data;
      
      if (isAjaxRequest(req)) {
        return res.json({
          success: true,
          message: 'Registration successful',
          redirectUrl: '/lobby'
        });
      }
      return res.redirect("/lobby");
    } else if (result.data) {
      // User already exists, don't set error message in session
      if (isAjaxRequest(req)) {
        return res.status(409).json({
          success: false,
          message: result.message,
          userExists: true,
          userName: req.body.userName || req.body.name
        });
      }
      return res.redirect("/");
    }
    
    // Only set session message for actual errors (not "user exists")
    if (!result.message.includes('already exists')) {
      req.session.message = result.message;
    }
    
    if (isAjaxRequest(req)) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }
    return res.redirect("/");
    
  } catch (error) {
    const errorMessage = `Error creating user: ${error.message}`;
    req.session.message = errorMessage;
    
    if (isAjaxRequest(req)) {
      return res.status(500).json({ success: false, message: errorMessage });
    }
    return res.redirect("/");
  }
};

const login = async (req, res) => {
  try {
    const result = await User.login(req.body.name, req.body.password);
    
    if (result.success.status) {
      const user = result.data;
      req.session.user = {
        _id: user._id,
        name: user.name,
        role: user.role,
        password: user.password, 
      };

      const redirectUrl = user.role === 'INSTRUCTOR' ? '/admin' : '/lobby';
      
      if (isAjaxRequest(req)) {
        return res.json({
          success: true,
          message: 'Login successful',
          redirectUrl
        });
      }
      return res.redirect(redirectUrl);
    }
    
    req.session.message = result.message;
    
    if (isAjaxRequest(req)) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }
    return res.redirect("/");
    
  } catch (error) {
    const errorMessage = `Error during login: ${error.message}`;
    req.session.message = errorMessage;
    
    if (isAjaxRequest(req)) {
      return res.status(500).json({ success: false, message: errorMessage });
    }
    return res.redirect("/");
  }
};

const logout = (req, res) => {
  req.session.user = undefined;
  res.redirect("/");
};

const loginAsStudent = async (req, res) => {
  try {
    const result = await User.get(req.body.name);
    
    if (result.success.status && result.data.role === 'STUDENT') {
      req.session.user = {
        _id: result.data._id,
        name: result.data.name,
        role: result.data.role,
        password: result.data.password
      };
      
      if (isAjaxRequest(req)) {
        return res.json({
          success: true,
          message: 'Welcome back!',
          redirectUrl: '/lobby'
        });
      }
      return res.redirect("/lobby");
    } else {
      const errorMessage = 'User not found or not a student';
      req.session.message = errorMessage;
      
      if (isAjaxRequest(req)) {
        return res.status(400).json({
          success: false,
          message: errorMessage
        });
      }
      return res.redirect("/");
    }
  } catch (error) {
    const errorMessage = `Error during student login: ${error.message}`;
    req.session.message = errorMessage;
    
    if (isAjaxRequest(req)) {
      return res.status(500).json({ success: false, message: errorMessage });
    }
    return res.redirect("/");
  }
};

const addUser = async (req, res) => {
  try {
    const userJSON = { name: req.body.name, password: req.body.password };
    const user = jsonToObject(userJSON);
    const result = await user.create();
    return res.json(result.toJSON());
  } catch (error) {
    return res.json(new Result(-1, null, `Error creating user: ${error.message}`).toJSON());
  }
};

const getUser = async (req, res) => {
  try {
    const by = req.body.name == undefined ? "_id" : "name";
    const result = await User.get(req.body.name == undefined ? req.body._id : req.body.name, by);
    return result;
  } catch (error) {
    return new Result(-1, null, `Error fetching user: ${error.message}`);
  }
};

const removeAllUsers = async (req, res) => {
  try {
    const result = await User.removeAll();
    if (result.success.status) {
      req.session.users = [];
      return res.json(result.toJSON());
    }
    return res.json(result.toJSON());
  } catch (error) {
    return res.json(new Result(-1, null, `Error removing users: ${error.message}`).toJSON());
  }
}

const getAllUsers = async (req, res) => {
  try {
    const sortBy = req.query.sortBy ? JSON.parse(req.query.sortBy) : { score: -1 };
    const result = await User.getAll(sortBy);
    return res.json(result.toJSON());
  } catch (error) {
    return res.json(new Result(-1, null, `Error getting all users: ${error.message}`).toJSON());
  }
}

const updateScore = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: 'Not logged in' });
    }

    const { score, taskNumber } = req.body;
    const userId = req.session.user._id;

    // Update user's score and last completed task in database
    const result = await User.updateScore(userId, score, taskNumber);
    
    if (result.success.status) {
      // Update session data
      req.session.user.score = (req.session.user.score || 0) + score;
      if (taskNumber) {
        req.session.user.lastTaskCompleted = Math.max(req.session.user.lastTaskCompleted || 0, taskNumber);
      }

      return res.json({
        success: true,
        message: result.message,
        data: result.data
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Error updating score: ${error.message}`
    });
  }
}

// Game Controller Functions
const createGame = async (req, res) => {
  try {
    // Check if a game already exists
    const existingGame = await Game.getCurrentGame();
    if (existingGame.success.status) {
      return res.json({
        success: true,
        message: 'Game already exists',
        data: existingGame.data
      });
    }

    // Get the number of students for the game
    const studentsResult = await User.getAll();
    const numStudents = studentsResult.success.status ? 
      studentsResult.data.filter(user => user.role === 'STUDENT').length : 0;

    // Create a new game (this will delete any existing games first)
    const result = await Game.createGame({
      isPaused: true,
      currentQuestion: 1,
      numStudents: numStudents,
      attemptedQuestion: 0
    });

    return res.json({
      success: result.success.status,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Error creating game: ${error.message}`
    });
  }
};

const resetGame = async (req, res) => {
  try {
    // Get the number of students for the game
    const studentsResult = await User.getAll();
    const numStudents = studentsResult.success.status ? 
      studentsResult.data.filter(user => user.role === 'STUDENT').length : 0;

    // Force create a new game (this will delete existing games first)
    const result = await Game.createGame({
      isPaused: true,
      currentQuestion: 1,
      numStudents: numStudents,
      attemptedQuestion: 0
    });

    return res.json({
      success: result.success.status,
      message: result.success.status ? 'Game reset successfully' : result.message,
      data: result.data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Error resetting game: ${error.message}`
    });
  }
};

const startGame = async (req, res) => {
  try {
    let game = await Game.getCurrentGame();
    
    // Create game if it doesn't exist
    if (!game.success.status) {
      const createResult = await createGame(req, res);
      if (!createResult.success) {
        return createResult;
      }
      game = await Game.getCurrentGame();
    }

    if (game.success.status) {
      const result = await Game.resumeGame(game.data.id);
      return res.json({
        success: result.success.status,
        message: result.message,
        data: result.data
      });
    } else {
      return res.status(404).json({
        success: false,
        message: 'No game found'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Error starting game: ${error.message}`
    });
  }
};

const pauseGame = async (req, res) => {
  try {
    const game = await Game.getCurrentGame();
    if (game.success.status) {
      const result = await Game.pauseGame(game.data.id);
      return res.json({
        success: result.success.status,
        message: result.message,
        data: result.data
      });
    } else {
      return res.status(404).json({
        success: false,
        message: 'No game found'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Error pausing game: ${error.message}`
    });
  }
};

const resumeGame = async (req, res) => {
  try {
    const game = await Game.getCurrentGame();
    if (game.success.status) {
      const result = await Game.resumeGame(game.data.id);
      return res.json({
        success: result.success.status,
        message: result.message,
        data: result.data
      });
    } else {
      return res.status(404).json({
        success: false,
        message: 'No game found'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Error resuming game: ${error.message}`
    });
  }
};

const nextQuestion = async (req, res) => {
  try {
    const game = await Game.getCurrentGame();
    const currentTask = await Task.getCurrent();
    
    if (game.success.status) {
      // Determine the maximum limit based on current mode
      let maxLimit = 20; // Default for Python Recap
      let itemType = "questions";
      
      if (currentTask.success.status && currentTask.data.mode === 'Model Mimic') {
        maxLimit = 5; // Model Mimic has 5 tasks
        itemType = "tasks";
      }
      
      // Check if we're already at the last question/task
      if (game.data.currentQuestion >= maxLimit) {
        return res.json({
          success: false,
          message: `All ${itemType} are complete! No more ${itemType} available.`,
          data: game.data,
          isComplete: true
        });
      }
      
      const result = await Game.nextQuestion(game.data.id, maxLimit);
      return res.json({
        success: result.success.status,
        message: result.message,
        data: result.data,
        isComplete: result.data && result.data.currentQuestion >= maxLimit
      });
    } else {
      return res.status(404).json({
        success: false,
        message: 'No game found'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Error advancing question/task: ${error.message}`
    });
  }
};

const endQuestion = async (req, res) => {
  try {
    const game = await Game.getCurrentGame();
    if (game.success.status) {
      // Reset attempted count for next question and update any other necessary state
      const result = await Game.updateGameState(game.data.id, {
        attemptedQuestion: 0
      });
      
      if (result.success.status) {
        return res.json({
          success: true,
          message: 'Question ended, scores calculated',
          data: result.data
        });
      } else {
        return res.status(500).json({
          success: false,
          message: 'Failed to update game state after ending question'
        });
      }
    } else {
      return res.status(404).json({
        success: false,
        message: 'No active game found'
      });
    }
  } catch (error) {
    console.error('Error in endQuestion controller:', error);
    return res.status(500).json({
      success: false,
      message: `Error ending question: ${error.message}`
    });
  }
};

const getGameStatus = async (req, res) => {
  try {
    const game = await Game.getCurrentGame();
    const currentTask = await Task.getCurrent();
    
    if (game.success.status) {
      // Add current mode to game data
      const gameData = { ...game.data };
      if (currentTask.success.status) {
        gameData.currentMode = currentTask.data.mode;
        
        // Handle different logic based on task mode
        if (currentTask.data.mode === 'Model Mimic') {
          // For Model Mimic mode, we track task progression instead of questions
          // currentQuestion represents the current task number (1-5)
          gameData.currentTask = gameData.currentQuestion || 1;
          gameData.maxTasks = 5; // Model Mimic has 5 tasks
          
          // For Model Mimic, students can start immediately when game is not paused
          if (!gameData.isPaused) {
            gameData.canStart = true;
          }
        } else if (currentTask.data.mode === 'Python Recap') {
          // For Python Recap mode, keep existing question-based logic
          gameData.currentQuestion = gameData.currentQuestion || 1;
          gameData.maxQuestions = 20;
          
          // For Python Recap, students join the real-time quiz
          if (!gameData.isPaused) {
            gameData.canStart = true;
          }
        }
      } else {
        gameData.currentMode = null;
      }
      
      return res.json({
        success: true,
        message: 'Game status retrieved',
        data: gameData
      });
    } else {
      // Create a new game if none exists
      const studentsResult = await User.getAll();
      const numStudents = studentsResult.success.status ? 
        studentsResult.data.filter(user => user.role === 'STUDENT').length : 0;

      // Initialize game based on current task mode
      let gameConfig = {
        isPaused: true,
        numStudents: numStudents,
        attemptedQuestion: 0
      };
      
      if (currentTask.success.status && currentTask.data.mode === 'Model Mimic') {
        // For Model Mimic, start with task 1
        gameConfig.currentQuestion = 1; // Represents current task number
      } else {
        // For Python Recap or default, start with question 1
        gameConfig.currentQuestion = 1;
      }

      const createResult = await Game.createGame(gameConfig);

      // Add current mode to new game data
      const gameData = { ...createResult.data };
      if (currentTask.success.status) {
        gameData.currentMode = currentTask.data.mode;
        
        if (currentTask.data.mode === 'Model Mimic') {
          gameData.currentTask = gameData.currentQuestion || 1;
          gameData.maxTasks = 5;
        } else if (currentTask.data.mode === 'Python Recap') {
          gameData.maxQuestions = 20;
        }
      } else {
        gameData.currentMode = null;
      }

      return res.json({
        success: createResult.success.status,
        message: 'New game created',
        data: gameData
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Error getting game status: ${error.message}`
    });
  }
};

const submitAnswer = async (req, res) => {
  try {
    const { questionNumber, answer, timeTaken, isTimeout } = req.body;
    const userId = req.session.user._id;

    // Get current game
    const game = await Game.getCurrentGame();
    if (!game.success.status) {
      return res.status(404).json({
        success: false,
        message: 'No active game found'
      });
    }

    // Check if game is paused
    if (game.data.isPaused) {
      return res.json({
        success: false,
        message: 'Game is currently paused'
      });
    }

    // Check if question matches current game question
    if (questionNumber !== game.data.currentQuestion) {
      return res.json({
        success: false,
        message: 'Question number does not match current game question'
      });
    }

    // Calculate score (20 points for correct, time factor for speed bonus)
    const answerResult = checkAnswer(questionNumber, answer);
    const isCorrect = answerResult.isCorrect;
    let score = 0;
    
    if (isCorrect) {
      score = 20; // Base points for correct answer
      
      // Time bonus: faster answers get more points (max 5 bonus points)
      const timeBonus = Math.max(0, Math.min(5, (20 - timeTaken) / 4));
      score += Math.round(timeBonus);
    }

    // Update user score
    const scoreResult = await User.updateScore(userId, score, 1);
    
    if (scoreResult.success.status) {
      // Update session data
      req.session.user.score = (req.session.user.score || 0) + score;

      // Increment questions attempted in game
      await Game.incrementAttempted(game.data.id);

      return res.json({
        success: true,
        message: isTimeout ? 'Time\'s up!' : (isCorrect ? 'Correct answer!' : 'Incorrect answer'),
        data: {
          isCorrect,
          score,
          totalScore: req.session.user.score,
          correctAnswer: answerResult.correctAnswer,
          explanation: answerResult.explanation,
          isTimeout: isTimeout
        }
      });
    } else {
      return res.status(400).json({
        success: false,
        message: scoreResult.message
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Error submitting answer: ${error.message}`
    });
  }
};

// Helper function to check answers and get explanations
const checkAnswer = (questionNumber, answer) => {
  const answerKey = {
    1: { correct: 'C', explanation: 'Both 15 and 30 are divisible by 15. 15 % 15 = 0 (at position 1), and 30 % 15 = 0 (at position 4), so both "Position 1: 15" and "Position 4: 30" will be printed.' },
    2: { correct: 'B', explanation: 'Use a dictionary for better data structure - it provides clear key-value mapping and makes code more readable and maintainable.' },
    3: { correct: 'C', explanation: 'List comprehension is most efficient - it creates lists in a single, optimized operation that is both faster and more readable than traditional loops.' },
    4: { correct: 'A', explanation: 'Use a set for unique student IDs - sets automatically handle uniqueness and provide O(1) lookup time for checking membership.' },
    5: { correct: 'B', explanation: 'Function should do one specific task clearly - this follows the Single Responsibility Principle, making code easier to test, debug, and maintain.' },
    6: { correct: 'C', explanation: 'The .join() method is best for combining words - it is more efficient than string concatenation and handles edge cases better.' },
    7: { correct: 'A', explanation: 'Use enumerate() when you need both position and value - it provides a clean, Pythonic way to get index-value pairs without manual counting.' },
    8: { correct: 'B', explanation: 'graduation_year follows Python conventions - it uses lowercase with underscores (snake_case) which is the standard Python naming convention.' },
    9: { correct: 'C', explanation: 'dict.get(key, default_value) is safest - it prevents KeyError exceptions by returning a default value when the key does not exist.' },
    10: { correct: 'B', explanation: 'Separate functions for different tasks - this promotes code reusability, maintainability, and follows the principle of separation of concerns.' },
    11: { correct: 'B', explanation: 'Dictionary structure is more appropriate - it provides clear key-value relationships and makes the data self-documenting and easier to access.' },
    12: { correct: 'C', explanation: 'if-elif-else structure is most readable - it clearly shows the decision flow and handles all cases in a logical, easy-to-follow manner.' },
    13: { correct: 'B', explanation: 'Check if input can be converted and is reasonable - this prevents runtime errors and ensures data quality by validating before processing.' },
    14: { correct: 'B', explanation: 'Clear variable names and logical structure - this makes code self-documenting and easier for others (and future you) to understand and maintain.' },
    15: { correct: 'B', explanation: 'Process records in small batches - this prevents memory overflow with large datasets and provides better performance and error recovery.' },
    16: { correct: 'B', explanation: 'Identify main tasks first - this helps break down complex problems into manageable pieces and ensures nothing important is overlooked.' },
    17: { correct: 'B', explanation: 'Plan for common errors and handle gracefully - this makes programs more robust and provides better user experience when things go wrong.' },
    18: { correct: 'C', explanation: 'Binary search is most efficient for sorted lists - it has O(log n) time complexity compared to O(n) for linear search, making it much faster for large datasets.' },
    19: { correct: 'A', explanation: 'Test with different inputs and check outputs - this ensures the function works correctly across various scenarios and helps catch edge cases early.' },
    20: { correct: 'D', explanation: 'Both b and c are good approaches depending on complexity - different situations call for different solutions, and the best choice depends on specific requirements and constraints.' }
  };
  
  const questionData = answerKey[questionNumber];
  if (!questionData) return { isCorrect: false, explanation: 'Question not found.' };
  
  return {
    isCorrect: questionData.correct === answer,
    correctAnswer: questionData.correct,
    explanation: questionData.explanation
  };
};

// Task Management Functions

const getCurrentTask = async (req, res) => {
  try {
    const result = await Task.getCurrent();
    
    if (result.success.status) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.json({
        success: false,
        message: result.message,
        data: null
      });
    }
  } catch (error) {
    console.error('Error getting current task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get current task'
    });
  }
};

const setTaskMode = async (req, res) => {
  try {
    // Check if user is instructor
    if (!req.session.user || req.session.user.role !== 'INSTRUCTOR') {
      return res.status(403).json({
        success: false,
        message: 'Only instructors can set task mode'
      });
    }

    const { mode } = req.body;
    
    if (!mode) {
      return res.status(400).json({
        success: false,
        message: 'Mode is required'
      });
    }

    const result = await Task.setMode(mode);
    
    if (result.success.status) {
      // Initialize or reset game state when task mode is set
      try {
        // Get number of students
        const studentsResult = await User.getAll();
        const numStudents = studentsResult.success.status ? 
          studentsResult.data.filter(user => user.role === 'STUDENT').length : 0;

        // Create a new game state for the new task mode
        await Game.createGame({
          isPaused: true, // Will be un-paused when instructor starts the activity
          currentQuestion: 1,
          numStudents: numStudents,
          attemptedQuestion: 0
        });
        
      } catch (gameError) {
        // Don't fail the entire request if game creation fails
      }
      
      res.json({
        success: true,
        message: `Task mode set to ${mode}`,
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Error setting task mode:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set task mode'
    });
  }
};

const removeAllTasks = async (req, res) => {
  try {
    // Check if user is instructor
    if (!req.session.user || req.session.user.role !== 'INSTRUCTOR') {
      return res.status(403).json({
        success: false,
        message: 'Only instructors can remove tasks'
      });
    }

    const result = await Task.removeAll();
    
    if (result.success.status) {
      res.json({
        success: true,
        message: 'All tasks removed successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Error removing all tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove tasks'
    });
  }
};

module.exports = {
  _jsonToObject: jsonToObject,
  addUser,
  getUser,
  getAllUsers,
  register,
  login,
  loginAsStudent,
  logout,
  removeAllUsers,
  updateScore,
  // Game functions
  createGame,
  resetGame,
  startGame,
  pauseGame,
  resumeGame,
  nextQuestion,
  endQuestion,
  getGameStatus,
  submitAnswer,
  // Task functions
  getCurrentTask,
  setTaskMode,
  removeAllTasks
};

