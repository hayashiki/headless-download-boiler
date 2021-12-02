import express from 'express'
import {app} from './app.js'

// const port = 8080
//
// app.listen(port, () => {
//   console.log(`Example app listening at http://localhost:${port}`)
// })

const server = app.listen(process.env.PORT || 8080, err => {
  if (err) return console.error(err);
  const port = server.address().port;
  console.info(`App listening on port ${port}`);
});
