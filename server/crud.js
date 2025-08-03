const supabase = require("./supabase");
const Result = require("./result");

// Field mapping for different tables
const fieldMappings = {
  users: {
    camelToSnake: {
      lastTaskCompleted: 'last_task_completed'
    },
    snakeToCamel: {
      last_task_completed: 'lastTaskCompleted',
      created_at: 'createdAt',
      updated_at: 'updatedAt'
    }
  },
  game_state: {
    camelToSnake: {
      isPaused: 'is_paused',
      currentTask: 'current_task',
      instructorId: 'instructor_id',
      gameName: 'game_name'
    },
    snakeToCamel: {
      is_paused: 'isPaused',
      current_task: 'currentTask',
      instructor_id: 'instructorId',
      game_name: 'gameName',
      created_at: 'createdAt',
      updated_at: 'updatedAt'
    }
  }
};

// Helper function to convert camelCase object to snake_case for database
const convertToDbFormat = (data, tableName) => {
  const mapping = fieldMappings[tableName]?.camelToSnake || {};
  const dbData = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      const dbKey = mapping[key] || key;
      dbData[dbKey] = value;
    }
  }
  
  return dbData;
};

// Helper function to convert snake_case object to camelCase for application
const convertFromDbFormat = (record, tableName) => {
  const mapping = fieldMappings[tableName]?.snakeToCamel || {};
  const appData = {};
  
  for (const [key, value] of Object.entries(record)) {
    const appKey = mapping[key] || key;
    appData[appKey] = value;
  }
  
  // Always include both _id and id for backward compatibility
  if (record.id) {
    appData._id = record.id;
    appData.id = record.id;
  }
  
  return appData;
};

const CRUDInterface = {
  create: async function (tableName, data, compareKey) {
    try {
      // Check if record already exists
      const dbCompareKey = fieldMappings[tableName]?.camelToSnake[compareKey] || compareKey;
      
      const { data: existingRecord, error: selectError } = await supabase
        .from(tableName)
        .select('*')
        .eq(dbCompareKey, data[compareKey])
        .single();

      if (selectError && selectError.code !== 'PGRST116') { // PGRST116 = no rows found
        throw selectError;
      }

      if (existingRecord) {
        return new Result(0, convertFromDbFormat(existingRecord, tableName), `Record with ${compareKey}: ${data[compareKey]} already exists.`);
      }

      // Convert camelCase to snake_case for database
      const dbData = convertToDbFormat(data, tableName);

      const { data: record, error } = await supabase
        .from(tableName)
        .insert([dbData])
        .select()
        .single();

      if (error) throw error;

      // Convert snake_case back to camelCase
      const formattedRecord = convertFromDbFormat(record, tableName);

      return new Result(1, formattedRecord, `Created new record with ${compareKey}: ${data[compareKey]}.`);
    } catch (error) {
      return new Result(-1, null, `Error adding data: ${error.message}.`);
    }
  },
  removeAll: async function (tableName, primaryKey, compareKey) {
    try {
      const dbCompareKey = fieldMappings[tableName]?.camelToSnake[compareKey] || compareKey;
      
      const { data, error } = await supabase
        .from(tableName)
        .delete()
        .eq(dbCompareKey, primaryKey)
        .select();

      if (error) throw error;

      if (!data || data.length === 0) {
        return new Result(0, null, `No records found with ${compareKey}: ${primaryKey}. Skipping deletion.`);
      } else {
        return new Result(1, { deletedCount: data.length }, `Deleted ${data.length} records with ${compareKey}: ${primaryKey}.`);
      }
    } catch (error) {
      return new Result(-1, null, `Error removing data: ${error.message}.`);
    }
  },
  get: async function (tableName, primaryKey, compareKey) {
    try {
      const dbCompareKey = fieldMappings[tableName]?.camelToSnake[compareKey] || 
                          (compareKey === '_id' ? 'id' : compareKey);
      
      const { data: record, error } = await supabase
        .from(tableName)
        .select('*')
        .eq(dbCompareKey, primaryKey)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw error;
      }

      if (record) {
        // Convert snake_case back to camelCase
        const formattedRecord = convertFromDbFormat(record, tableName);
        return new Result(1, formattedRecord, `Found record with ${compareKey}: ${primaryKey}.`);
      } else {
        return new Result(0, null, `Record with ${compareKey}: ${primaryKey} not found.`);
      }
    } catch (error) {
      return new Result(-1, null, `Error getting data: ${error.message}.`);
    }
  },

  getAllFilteredSorted: async function (tableName, primaryKey, compareKey, sortBy={score:-1}){
    try {
      const dbCompareKey = fieldMappings[tableName]?.camelToSnake[compareKey] || compareKey;
      
      let query = supabase
        .from(tableName)
        .select('*')
        .eq(dbCompareKey, primaryKey);

      // Handle sorting - convert MongoDB style to Supabase style
      if (sortBy) {
        const sortField = Object.keys(sortBy)[0];
        const sortDirection = Object.values(sortBy)[0] === -1 ? false : true; // false = descending, true = ascending
        const dbSortField = fieldMappings[tableName]?.camelToSnake[sortField] || sortField;
        query = query.order(dbSortField, { ascending: sortDirection });
      }

      const { data: records, error } = await query;

      if (error) throw error;

      // Convert snake_case back to camelCase for all records
      const formattedRecords = records.map(record => convertFromDbFormat(record, tableName));

      return new Result(1, formattedRecords, `Found ${records.length} records in ${tableName} with ${dbCompareKey}: ${primaryKey} sorted by ${JSON.stringify(sortBy)}.`);
    } catch (error) {
      return new Result(-1, null, `Error getting all data: ${error.message}.`);
    }
  },

  update: async function (tableName, primaryKey, data, compareKey = "_id") {
    try {
      const dbCompareKey = fieldMappings[tableName]?.camelToSnake[compareKey] || 
                          (compareKey === '_id' ? 'id' : compareKey);
      
      // Convert camelCase to snake_case for database
      const dbData = convertToDbFormat(data, tableName);

      const { data: result, error } = await supabase
        .from(tableName)
        .update(dbData)
        .eq(dbCompareKey, primaryKey)
        .select()
        .single();

      if (error) throw error;

      if (result) {
        // Convert snake_case back to camelCase
        const formattedRecord = convertFromDbFormat(result, tableName);
        return new Result(1, formattedRecord, `Updated record with ${compareKey}: ${primaryKey}.`);
      } else {
        return new Result(0, null, `Record with ${compareKey}: ${primaryKey} not found.`);
      }
    } catch (error) {
      return new Result(-1, null, `Error updating data: ${error.message}.`);
    }
  },

  // Helper method to get all records from a table without filtering
  getAll: async function (tableName, sortBy = null) {
    try {
      let query = supabase.from(tableName).select('*');

      // Handle sorting if provided
      if (sortBy) {
        const sortField = Object.keys(sortBy)[0];
        const sortDirection = Object.values(sortBy)[0] === -1 ? false : true;
        const dbSortField = fieldMappings[tableName]?.camelToSnake[sortField] || sortField;
        query = query.order(dbSortField, { ascending: sortDirection });
      }

      const { data: records, error } = await query;

      if (error) throw error;

      const formattedRecords = records.map(record => convertFromDbFormat(record, tableName));

      return new Result(1, formattedRecords, `Found ${records.length} records in ${tableName}.`);
    } catch (error) {
      return new Result(-1, null, `Error getting all data: ${error.message}.`);
    }
  },

  // Helper method to get a single record by ID
  getById: async function (tableName, id) {
    try {
      const { data: record, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (record) {
        const formattedRecord = convertFromDbFormat(record, tableName);
        return new Result(1, formattedRecord, `Found record with id: ${id}.`);
      } else {
        return new Result(0, null, `Record with id: ${id} not found.`);
      }
    } catch (error) {
      return new Result(-1, null, `Error getting record: ${error.message}.`);
    }
  }
};

module.exports = CRUDInterface;
