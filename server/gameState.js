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
    this.instructorId = gameStateJSON.instructor_id || gameStateJSON.instructorId;
    this.gameName = gameStateJSON.game_name || gameStateJSON.gameName;
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
        gameName: 'AI Summer Camp Game'
      };

      // For game state, we'll directly insert without checking for duplicates
      const { data: gameState, error } = await supabase
        .from(GameState.tableName)
        .insert([{
          is_paused: defaultData.isPaused,
          current_task: defaultData.currentTask,
          game_name: defaultData.gameName
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

      const updateData = {
        isPaused: false,
        instructorId: instructorId
      };

      const result = await GameState.crudInterface.update(GameState.tableName, currentResult.data.id, updateData, 'id');
      if (result.success.status) {
        return new Result(1, new GameState(result.data), "Game resumed successfully.");
      } else {
        return result;
      }
    } catch (error) {
      return new Result(-1, null, `Error resuming game: ${error.message}.`);
    }
  }

  static async startGame(instructorId, gameName = null) {
    try {
      const updateData = {
        isPaused: false,
        currentTask: 1,
        instructorId: instructorId
      };

      if (gameName) {
        updateData.gameName = gameName;
      }

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
        if (!gameName) {
          updateData.gameName = 'AI Summer Camp Game';
        }
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

  static async updateGameName(gameName, instructorId) {
    try {
      const currentResult = await GameState.get();
      if (!currentResult.success.status) {
        return currentResult;
      }

      const updateData = {
        gameName: gameName,
        instructorId: instructorId
      };

      const result = await GameState.crudInterface.update(GameState.tableName, currentResult.data.id, updateData, 'id');
      if (result.success.status) {
        return new Result(1, new GameState(result.data), "Game name updated successfully.");
      } else {
        return result;
      }
    } catch (error) {
      return new Result(-1, null, `Error updating game name: ${error.message}.`);
    }
  }
}

module.exports = GameState;
