const supabase = require("./supabase");
const crudInterface = require("./crud");
const Result = require("./result");

class GameState {
  static crudInterface = crudInterface;
  static tableName = 'game_state';

  constructor(gameStateJSON) {
    this.id = gameStateJSON.id;
    this.isPaused = gameStateJSON.is_paused || gameStateJSON.isPaused || false;
    this.currentTask = gameStateJSON.current_task || gameStateJSON.currentTask || 1;
    this.startTime = gameStateJSON.start_time || gameStateJSON.startTime;
    this.pauseTime = gameStateJSON.pause_time || gameStateJSON.pauseTime;
    this.totalPauseDuration = gameStateJSON.total_pause_duration || gameStateJSON.totalPauseDuration || 0;
    this.instructorId = gameStateJSON.instructor_id || gameStateJSON.instructorId;
    this.settings = gameStateJSON.settings || {};
    this.createdAt = gameStateJSON.created_at || gameStateJSON.createdAt;
    this.updatedAt = gameStateJSON.updated_at || gameStateJSON.updatedAt;
  }

  static async get() {
    try {
      // Get all game states and take the most recent one
      const result = await GameState.crudInterface.getAll(GameState.tableName, { createdAt: -1 });
      
      if (result.success.status && result.data.length > 0) {
        return new Result(1, new GameState(result.data[0]), "Game state retrieved successfully.");
      } else {
        // Create default game state if none exists
        const defaultState = await GameState.createDefault();
        return defaultState;
      }
    } catch (error) {
      return new Result(-1, null, `Error getting game state: ${error.message}.`);
    }
  }

  static async createDefault() {
    try {
      const defaultData = {
        isPaused: false,
        currentTask: 1,
        settings: {}
      };

      // For game state, we'll directly insert without checking for duplicates
      const { data: gameState, error } = await supabase
        .from(GameState.tableName)
        .insert([{
          is_paused: defaultData.isPaused,
          current_task: defaultData.currentTask,
          settings: defaultData.settings
        }])
        .select()
        .single();

      if (error) throw error;

      return new Result(1, new GameState(gameState), "Default game state created successfully.");
    } catch (error) {
      return new Result(-1, null, `Error creating default game state: ${error.message}.`);
    }
  }

  static async pauseGame(instructorId) {
    try {
      const currentResult = await GameState.get();
      if (!currentResult.success.status) {
        return currentResult;
      }

      const updateData = {
        isPaused: true,
        pauseTime: new Date().toISOString(),
        instructorId: instructorId
      };

      const result = await GameState.crudInterface.update(GameState.tableName, currentResult.data.id, updateData, 'id');
      if (result.success.status) {
        return new Result(1, new GameState(result.data), "Game paused successfully.");
      } else {
        return result;
      }
    } catch (error) {
      return new Result(-1, null, `Error pausing game: ${error.message}.`);
    }
  }

  static async resumeGame(instructorId) {
    try {
      const currentResult = await GameState.get();
      if (!currentResult.success.status) {
        return currentResult;
      }

      const gameState = currentResult.data;
      let additionalPauseDuration = 0;

      // Calculate additional pause duration if game was paused
      if (gameState.isPaused && gameState.pauseTime) {
        const pauseStart = new Date(gameState.pauseTime);
        const now = new Date();
        additionalPauseDuration = Math.floor((now - pauseStart) / 1000); // in seconds
      }

      const updateData = {
        isPaused: false,
        pauseTime: null,
        totalPauseDuration: gameState.totalPauseDuration + additionalPauseDuration,
        instructorId: instructorId
      };

      const result = await GameState.crudInterface.update(GameState.tableName, gameState.id, updateData, 'id');
      if (result.success.status) {
        return new Result(1, new GameState(result.data), "Game resumed successfully.");
      } else {
        return result;
      }
    } catch (error) {
      return new Result(-1, null, `Error resuming game: ${error.message}.`);
    }
  }

  static async startGame(instructorId) {
    try {
      const updateData = {
        isPaused: false,
        startTime: new Date().toISOString(),
        pauseTime: null,
        totalPauseDuration: 0,
        currentTask: 1,
        instructorId: instructorId
      };

      // Get current game state or create new one
      const currentResult = await GameState.get();
      let gameStateId;

      if (currentResult.success.status) {
        gameStateId = currentResult.data.id;
        // Update existing game state
        const result = await GameState.crudInterface.update(GameState.tableName, gameStateId, updateData, 'id');
        if (result.success.status) {
          return new Result(1, new GameState(result.data), "Game started successfully.");
        } else {
          return result;
        }
      } else {
        // Create new game state
        const result = await GameState.crudInterface.create(GameState.tableName, updateData, 'id');
        if (result.success.status) {
          return new Result(1, new GameState(result.data), "Game started successfully.");
        } else {
          return result;
        }
      }
    } catch (error) {
      return new Result(-1, null, `Error starting game: ${error.message}.`);
    }
  }

  static async setCurrentTask(taskNumber, instructorId) {
    try {
      const currentResult = await GameState.get();
      if (!currentResult.success.status) {
        return currentResult;
      }

      const updateData = {
        currentTask: taskNumber,
        instructorId: instructorId
      };

      const result = await GameState.crudInterface.update(GameState.tableName, currentResult.data.id, updateData, 'id');
      if (result.success.status) {
        return new Result(1, new GameState(result.data), `Current task set to ${taskNumber} successfully.`);
      } else {
        return result;
      }
    } catch (error) {
      return new Result(-1, null, `Error setting current task: ${error.message}.`);
    }
  }

  static async updateSettings(settings, instructorId) {
    try {
      const currentResult = await GameState.get();
      if (!currentResult.success.status) {
        return currentResult;
      }

      const updateData = {
        settings: settings,
        instructorId: instructorId
      };

      const result = await GameState.crudInterface.update(GameState.tableName, currentResult.data.id, updateData, 'id');
      if (result.success.status) {
        return new Result(1, new GameState(result.data), "Game settings updated successfully.");
      } else {
        return result;
      }
    } catch (error) {
      return new Result(-1, null, `Error updating game settings: ${error.message}.`);
    }
  }
}

module.exports = GameState;
