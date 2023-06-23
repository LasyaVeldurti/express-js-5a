const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("Server Running at http://localhost:3001/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// API 1 GET All Movie Details

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT * 
    FROM movie;
    `;
  const moviesArray = await db.all(getMoviesQuery);
  response.send(moviesArray);
});

// API 2 Add new movie

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  // console.log(movieDetails);
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `
  INSERT 
    INTO 
  movie (director_id, movie_name, lead_actor)
  VALUES
  (
      '${directorId}',
      '${movieName}',
      '${leadActor}'
  );
  `;
  const dbResponse = await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

// API 3 Get Movie from id

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  console.log(movieId);
  const getMovieIdQuery = `
    SELECT * 
    FROM  movie
    WHERE 
    movie_id = '${movieId}';
    `;
  const dbResponse = await db.get(getMovieIdQuery);
  response.send(dbResponse);
});

// API 4 Update Movie details

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;

  const updateMovieQuery = `
    UPDATE
    movie 
    SET 
        director_id = ${directorId},
        movie_name = '${movieName}',
        lead_actor = '${leadActor}'
    
    WHERE movie_id = ${movieId};
    `;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

// API 5 Delete Movie

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const getDeleteMovieQuery = `
    DELETE
    FROM  movie
    WHERE 
    movie_id = '${movieId}';
    `;
  const dbResponse = await db.get(getDeleteMovieQuery);
  console.log(dbResponse);
  response.send("Movie Removed");
});

// API 6 GET All Directors Details

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    SELECT * 
    FROM director;
    `;
  const dbResponse = await db.all(getDirectorsQuery);
  response.send(dbResponse);
});

// API 7 GET All Movies of Directors

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMovieDetailsQuery = `
    SELECT 
    movie_name 
    FROM movie
    WHERE director_id = '${directorId}';
    `;
  const movieArray = await db.all(getMovieDetailsQuery);

  response.send(movieArray);
});

module.exports = app;
