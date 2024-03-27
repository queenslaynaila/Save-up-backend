import dotenv from 'dotenv';
import app from './app';

dotenv.config();
const port = 3001; // Define the port number

app.listen({ port }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening on ${address}`);
});
