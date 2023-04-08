const neo4j = require('neo4j-driver');

const uri = 'neo4j+s://1e5c4003.databases.neo4j.io';
const user = 'neo4j';
const password = 'JdQ1_Ikd2Gq6z0U65kXsz0FCArU5SWFrzp2bQHLgf8I';

var driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

async function neoWriter (query) {
  driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
  const session = driver.session();
  try {
    const result = await session.writeTransaction(tx => tx.run(query));
    return result.summary.counters; // devuelve información sobre las operaciones realizadas
  } finally {
    await session.close();
  }
}

async function neoReader(query, value_r) {
  driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
  const session = driver.session();
  try {
    const result = await session.run(query);
    return result.records.map(record => {
      const node = record.get(value_r);
      const properties = {};
      for (const prop in node.properties) {
        const val = node.properties[prop];
        if (val instanceof neo4j.types.Integer) {
          properties[prop] = val.low + val.high * Math.pow(2, 32);
        } else {
          properties[prop] = val;
        }
      }
      return {
        labels: node.labels,
        properties
      };
    });
  } finally {
    await session.close();
  }
}

async function addFile(id_file) {
  try {
    const query = `MERGE (:File {id_file: ${id_file}})`;
    const result = await neoWriter (query);
    console.log(result);
  } catch (error) {
    console.error(error);
  } finally {
    await driver.close();
  }
}

async function addUser(id_user) {
  try {
    const query = `MERGE (:User {id_user: ${id_user}})`;
    const result = await neoWriter (query);
    console.log(result);
  } catch (error) {
    console.error(error);
  } finally {
    await driver.close();
  }
}

async function addComment(id_comment) {
  try {
    const query = `MERGE (:Comment {id_comment: ${id_comment}})`;
    const result = await neoWriter (query);
    console.log(result);
  } catch (error) {
    console.error(error);
  } finally {
    await driver.close();
  }
}

async function upLog(id_user, id_file) {
  try {
    const query = `MERGE (u:User {id_user: ${id_user}}), (f1:File {id_file: ${id_file}}) CREATE (u)-[:cargo]->(f1)`;
    const result = await neoWriter (query);
    console.log(result);
  } catch (error) {
    console.error(error);
  } finally {
    await driver.close();
  }
}

async function downLog(id_user, id_file) {
  try {
    const query = `MERGE (u:User {id_user: ${id_user}}), (f1:File {id_file: ${id_file}}) CREATE (u)-[:descargo]->(f1)`;
    const result = await neoWriter (query);
    console.log(result);
  } catch (error) {
    console.error(error);
  } finally {
    await driver.close();
  }
}

async function postLog(id_user, id_comment) {
  try {
    const query = `MERGE (u:User {id_user: ${id_user}}), (c1:Comment {id_comment: ${id_comment}}) CREATE (u)-[:realizo]->(c1)`;
    const result = await neoWriter (query);
    console.log(result);
  } catch (error) {
    console.error(error);
  } finally {
    await driver.close();
  }
}

async function checkDownloaders(id_file) {
  try {
    const query = `MATCH (u:User)-[:descargo]->(f:File {id_file: ${id_file}}) RETURN u`;
    const result = await neoReader(query, 'u');
    console.log(result);
  } catch (error) {
    console.error(error);
  } finally {
    await driver.close();
  }
}

async function checkFilesByOwner(id_user) {
  try {
    const query = `MATCH (u:User {id_user: ${id_user}})-[:cargo]->(f:File) RETURN f`;
    const result = await neoReader(query, 'f');
    console.log(result);
  } catch (error) {
    console.error(error);
  } finally {
    await driver.close();
  }
}

async function checkCommentsByOwner(id_user) {
  try {
    const query = `MATCH (u:User {id_user: ${id_user}})-[:realizo]->(c:Comment) RETURN c`;
    const result = await neoReader(query, 'c');
    console.log(result);
  } catch (error) {
    console.error(error);
  } finally {
    await driver.close();
  }
}
