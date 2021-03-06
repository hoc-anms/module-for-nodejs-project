// configure server express
const bodyParser = require( "body-parser" );
const fs = require( "fs" );
const cors = require( "cors" );
const http = require( "http" );
const https = require( "https" );
const express = require( "express" ),
  app = express();
const logger = require( "morgan" );
const api = require( "./lib/routes" );
const mongoose = require( "mongoose" );
const dotenv = require( "dotenv" );
const swaggerUi = require( "swagger-ui-express" );
const swaggerDoc = require( "./swagger" );

let server = null;

dotenv.config( { "path": ".env" } );

// config server with http of https
if ( process.env.APP_ENV === "production" ) {
  const options = {
    "pfx": fs.readFileSync( process.env.HTTPS_URL ),
    "passphrase": process.env.HTTPS_PASSWORD
  };

  server = https.createServer( options, app );
} else {
  server = http.createServer( app );
}

// connect to mongoose NoSQL DB
mongoose.connect( `${process.env.DB_CONNECTION}://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`, {
  "useCreateIndex": true,
  "useNewUrlParser": true,
  "useUnifiedTopology": true
} );
mongoose.set( "useFindAndModify", false );

// set server port
app.set( "port", process.env.PORT_BASE );

// handle cors
app.use( cors() );

// handle form data using bodyParser
app.use( bodyParser.json( { "extended": true } ) );
app.use( bodyParser.urlencoded( { "extended": false } ) );

// create log on server
app.use( logger( "dev" ) );

// create route api
app.use( "/api/v1", api );

// config swagger
app.use( "/api-docs", swaggerUi.serve, swaggerUi.setup( swaggerDoc ) );

// route default
app.use( "/", ( req, res ) => res.send( "API running!" ) );


// listen a port
server.listen( process.env.PORT_BASE, () => {
  console.log( `Api server: process ${ process.pid } running on ${process.env.APP_URL}:${process.env.PORT_BASE}` );
} );

module.exports = app;

