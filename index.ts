import dotenv from 'dotenv';
import app from './app';

dotenv.config();

const port: number = parseInt(process.env.PORT as string, 10);

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
