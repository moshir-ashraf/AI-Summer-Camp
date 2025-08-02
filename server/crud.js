const model =  require("./schema");
const Result = require("./result");

const CRUDInterface = {
  create: async function (data, compareKey) {
    try {
      const compareClause = { [compareKey]: data[compareKey] };
      const existingRecord = await model.findOne(compareClause);
      if (!existingRecord) {
        let record = await model.create(data);
        return new Result(1, record._doc, `Created new record with ${compareKey}: ${record._doc[compareKey]}.`);
      } else {
        return new Result(0, existingRecord._doc, `Record with ${compareKey}: ${data[compareKey]} already exists.`);
      }
    } catch (error) {
      return new Result(-1, null, `Error adding data: ${error.message}.`);
    }
  },
  removeAll: async function (primaryKey, compareKey) {
    try {
      const compareClause = { [compareKey]: primaryKey };
      const result = await model.deleteMany(compareClause);

      if (result.deletedCount === 0) {
        return new Result(0, null, `No records found with ${compareKey}: ${primaryKey}. Skipping deletion.`);
      } else {
        return new Result(1, result, `Deleted ${result.deletedCount} records with ${compareKey}: ${primaryKey}.`);
      }
    } catch (error) {
      return new Result(-1, null, `Error removing data: ${error.message}.`);
    }
  },
  get: async function (primaryKey, compareKey) {
    try {
      const compareClause = { [compareKey]: primaryKey };
      const record = await model.findOne(compareClause);
      if (record) {
        return new Result(1, record._doc, `Found record with ${compareKey}: ${primaryKey}.`);
      } else {
        return new Result( 0, null, `Record with ${compareKey}: ${primaryKey} not found.`);
      }
    } catch (error) {
      return new Result(-1, null, `Error getting data: ${error.message}.`);
    }
  },

  getAllFilteredSorted: async function (primaryKey, compareKey, sortBy={score:-1}){
    try {
      const compareClause = { [compareKey]: primaryKey };
      const records = await model.find(compareClause).sort(sortBy);
      const resultData = records.map((record) => record._doc) || [];
      return new Result(1, resultData, `Found ${records.length} records in ${model} with ${JSON.stringify(compareClause)} sorted by ${JSON.stringify(sortBy)}.`);
    } catch (error) {
      return new Result(-1, null, `Error getting all data: ${error.message}.`);
    }
  },

  update: async function (primaryKey, data, compareKey = "_id") {
    try {
      const compareClause = { [compareKey]: primaryKey };
      const result = await model.findOneAndUpdate(compareClause, data, { new: true });
      if (result) {
        return new Result(1, result._doc, `Updated record with ${compareKey}: ${primaryKey}.`);
      } else {
        return new Result(0, null, `Record with ${compareKey}: ${primaryKey} not found.`);
      }
    } catch (error) {
      return new Result(-1, null, `Error updating data: ${error.message}.`);
    }
  },
};

module.exports = CRUDInterface;
