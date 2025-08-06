const Result = require("./result");
const crudInterface = require("./crud");
const jsonToObject = require("./mapper");


class Game {

  static crudInterface = crudInterface;
  static jsonToObject = jsonToObject;
  static tableName = 'game';

  constructor(gameJSON) {
    Game.jsonToObject(this, gameJSON);
  }
  
  static async get(key, by="id") {
    const result = await Game.crudInterface.get(Game.tableName, key, by);
    if (result.success.status) result.data = new Game(result.data);
    return result
  }
  
  static async getAll(sortBy=null) {
    const result = await Game.crudInterface.getAll(Game.tableName, sortBy);
    if (result.success.status) result.data = result.data.map(game => new Game(game));
    return result
  }
  
  static async getCurrentGame() {
    try {
      // Get all games and return the most recent one (there should only be one active game)
      const result = await Game.getAll();
      if (result.success.status && result.data.length > 0) {
        // Sort by creation date and get the most recent
        const sortedGames = result.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return new Result(1, sortedGames[0], "Current game found.");
      } else {
        return new Result(0, null, "No active game found.");
      }
    } catch (error) {
      return new Result(-1, null, `Error getting current game: ${error.message}`);
    }
  }

  static async createGame(gameData = {}) {
    try {
      // First, delete any existing games to ensure only one game instance
      await Game.deleteAllGames();
      
      // Default game state (don't include id - let database generate it)
      const defaultGame = {
        isPaused: true,
        currentQuestion: 1,
        numStudents: 0,
        attemptedQuestion: 0,
        ...gameData
      };

      // Remove id from gameData if it exists and is undefined
      if (defaultGame.id === undefined) {
        delete defaultGame.id;
      }

      const game = new Game(defaultGame);
      const result = await game.create();
      return result;
    } catch (error) {
      return new Result(-1, null, `Error creating game: ${error.message}`);
    }
  }

  static async deleteAllGames() {
    try {
      return await Game.crudInterface.removeAllRecords(Game.tableName);
    } catch (error) {
      return new Result(-1, null, `Error deleting existing games: ${error.message}`);
    }
  }

  static async updateGameState(gameId, updateData) {
    try {
      const updateResult = await Game.crudInterface.update(Game.tableName, gameId, updateData, 'id');
      if (updateResult.success.status) {
        return new Result(1, updateResult.data, "Game state updated successfully.");
      } else {
        return new Result(0, null, "Failed to update game state.");
      }
    } catch (error) {
      return new Result(-1, null, `Error updating game state: ${error.message}`);
    }
  }

  static async pauseGame(gameId) {
    return await Game.updateGameState(gameId, { isPaused: true });
  }

  static async resumeGame(gameId) {
    return await Game.updateGameState(gameId, { isPaused: false });
  }

  static async nextQuestion(gameId, maxLimit = 20) {
    try {
      const gameResult = await Game.get(gameId);
      if (!gameResult.success.status) {
        return new Result(0, null, "Game not found.");
      }

      const game = gameResult.data;
      const currentQuestion = game.currentQuestion || 1;
      
      // Check if we're already at the last question/task
      if (currentQuestion >= maxLimit) {
        const itemType = maxLimit === 5 ? "tasks" : "questions";
        return new Result(0, game, `All ${itemType} are complete! No more ${itemType} available.`);
      }
      
      const nextQuestionNumber = currentQuestion + 1;
      
      return await Game.updateGameState(gameId, { 
        currentQuestion: nextQuestionNumber,
        attemptedQuestion: 0 // Reset attempted count for new question/task
      });
    } catch (error) {
      return new Result(-1, null, `Error advancing to next question/task: ${error.message}`);
    }
  }

  static async previousQuestion(gameId) {
    try {
      const gameResult = await Game.get(gameId);
      if (!gameResult.success.status) {
        return new Result(0, null, "Game not found.");
      }

      const game = gameResult.data;
      const prevQuestionNumber = Math.max((game.currentQuestion || 1) - 1, 1);
      
      return await Game.updateGameState(gameId, { 
        currentQuestion: prevQuestionNumber,
        attemptedQuestion: 0 // Reset attempted count for new question
      });
    } catch (error) {
      return new Result(-1, null, `Error going to previous question: ${error.message}`);
    }
  }

  static async updateStudentCount(gameId, numStudents) {
    return await Game.updateGameState(gameId, { numStudents: numStudents });
  }

  static async incrementAttempted(gameId) {
    try {
      const gameResult = await Game.get(gameId);
      if (!gameResult.success.status) {
        return new Result(0, null, "Game not found.");
      }

      const game = gameResult.data;
      const newAttemptedCount = (game.attemptedQuestion || 0) + 1;
      
      return await Game.updateGameState(gameId, { attemptedQuestion: newAttemptedCount });
    } catch (error) {
      return new Result(-1, null, `Error incrementing attempted count: ${error.message}`);
    }
  }

  static async resetGame(gameId) {
    return await Game.updateGameState(gameId, {
      isPaused: true,
      currentQuestion: 1,
      attemptedQuestion: 0
    });
  }

  static async removeAll() {
    return await Game.crudInterface.removeAllRecords(Game.tableName);
  }

  async create() {
    // For games, we don't need to check for existing records by id since id is auto-generated
    // We'll pass null as compareKey to skip the existence check
    const result = await Game.crudInterface.create(Game.tableName, this, null);
    if(result.success.status) result.data = Game.jsonToObject(this, result.data)
    return result
  }

  async update(updateData) {
    const result = await Game.crudInterface.update(Game.tableName, this.id, updateData, 'id');
    if (result.success.status) {
      // Update current instance with new data
      Game.jsonToObject(this, result.data);
    }
    return result;
  }

  async delete() {
    return await Game.crudInterface.remove(Game.tableName, this.id, 'id');
  }

  // Instance methods for convenience
  async pause() {
    return await this.update({ isPaused: true });
  }

  async resume() {
    return await this.update({ isPaused: false });
  }

  async nextQuestion() {
    const nextQuestionNumber = (this.currentQuestion || 1) + 1;
    return await this.update({ 
      currentQuestion: nextQuestionNumber,
      attemptedQuestion: 0 
    });
  }

  async previousQuestion() {
    const prevQuestionNumber = Math.max((this.currentQuestion || 1) - 1, 1);
    return await this.update({ 
      currentQuestion: prevQuestionNumber,
      attemptedQuestion: 0 
    });
  }

  async updateStudentCount(numStudents) {
    return await this.update({ numStudents: numStudents });
  }

  async incrementAttempted() {
    const newAttemptedCount = (this.attemptedQuestion || 0) + 1;
    return await this.update({ attemptedQuestion: newAttemptedCount });
  }

  async reset() {
    return await this.update({
      isPaused: true,
      currentQuestion: 1,
      attemptedQuestion: 0
    });
  }
}

module.exports = Game;
