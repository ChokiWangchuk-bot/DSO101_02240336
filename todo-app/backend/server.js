require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors({
  origin: '*'
}));
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Create table if not exists
pool.query(`CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  done BOOLEAN DEFAULT false
)`);

app.get('/tasks', async (req, res) => {
  const result = await pool.query('SELECT * FROM tasks ORDER BY id');
  res.json(result.rows);
});
app.post('/tasks', async (req, res) => {
  const { title } = req.body;
  const result = await pool.query(
    'INSERT INTO tasks(title) VALUES($1) RETURNING *', [title]);
  res.json(result.rows[0]);
});
app.put('/tasks/:id', async (req, res) => {
  const { title, done } = req.body;
  const result = await pool.query(
    'UPDATE tasks SET title=$1, done=$2 WHERE id=$3 RETURNING *',
    [title, done, req.params.id]);
  res.json(result.rows[0]);
});
app.delete('/tasks/:id', async (req, res) => {
  await pool.query('DELETE FROM tasks WHERE id=$1', [req.params.id]);
  res.json({ message: 'Deleted' });
});

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`));