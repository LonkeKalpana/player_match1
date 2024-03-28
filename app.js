const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())
let db = null
const dbpath = path.join(__dirname, 'cricketMatchDetails.db')
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('server started')
    })
  } catch (e) {
    console.log(`server stopped ${e.message}`)
  }
}
initializeDBAndServer()

//                  API 1
const convertObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
  }
}
app.get('/players/', async (request, response) => {
  const getSqlQuery = `select * from player_details;`
  const playerArray = await db.all(getSqlQuery)
  response.send(
    playerArray.map(eachplayer => convertObjectToResponseObject(eachplayer)),
  )
})

//          API 2
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getSqlQuery = `select * from player_details where player_id=${playerId};`
  const dbResponse = await db.get(getSqlQuery)
  response.send(convertObjectToResponseObject(dbResponse))
})

//       API 3

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerDetails = request.body
  const {playerName} = playerDetails
  const getSqlQuery = `update player_details set player_name='${playerName}' where player_id = ${playerId};`
  const dbResponse = await db.run(getSqlQuery)
  response.send('Player Details Updated')
})

//            API 4
const convertObjectToResponseObjectOfMatchTable = dbObject => {
  return {
    matchId: dbObject.match_id,
    match: dbObject.match,
    year: dbObject.year,
  }
}

app.get('/matches/:matchId/', async (request, response) => {
  const {matchId} = request.params
  const getSqlQuery = `select * from match_details where match_id=${matchId};`
  const matchArray = await db.get(getSqlQuery)
  response.send(
   // matchArray.map(eachMatch =>
      convertObjectToResponseObjectOfMatchTable(matchArray)
  //  ),
  )
})

///         API 5
app.get('/players/:playerId/matches', async (request, response) => {
  const {playerId} = request.params
  const getSqlQuery = `select * from player_match_score natural join  match_details where  player_id=${playerId};`
  // const playerArray = await db.all(getSqlQuery)

  // const getMatchDetails = `select * from match_details where match_id=${playerArray.match_id}`
  const matchArray = await db.all(getSqlQuery)
  response.send(
    matchArray.map(eachMatch =>
      convertObjectToResponseObjectOfMatchTable(eachMatch),
    ),
  )
})

//        API 6
app.get('/matches/:matchId/players', async (request, response) => {
  const {matchId} = request.params
  const getSqlQuery = `select player_details.player_id as playerId, player_details.player_name  as playerName from player_match_score natural join player_details where match_id=${matchId};`
   //on player_match_score.player_id=player_details.player_id
  const dbResponse = await db.get(getSqlQuery)
  response.send( 
   // dbResponse.map(eachplayer => 
    convertObjectToResponseObject(dbResponse))
//  )
})

//      API 7
// const convertPlayerDetailsObjectToResponseObjectOfMatchTable = dbObject => {
//   return {
//     playerId: dbObject.player_id,
//     playerName: dbObject.player_name,
//     totalScore:dbObject.score,
//     totalFours:dbObject.fours,
//     totalSixes:dbObject.sixes
//   }
// }

app.get('/players/:playerId/playerScores', async (request, response) => {
  const {playerId} = request.params
  const getSqlQuery = `select player_details.player_id as playerId, player_details.player_name  as playerName, sum(player_match_score.score) as totalScore, sum(player_match_score.fours) as totalFours, sum(player_match_score.sixes) as totalSixes  from player_match_score inner join player_details on player_match_score.player_id=player_match_score.player_id  where player_details.player_id=${playerId};`
  const dbResponse = await db.get(getSqlQuery)
  response.send(dbResponse)
  // convertPlayerDetailsObjectToResponseObjectOfMatchTable(dbResponse),
  //)
})

module.exports = app
