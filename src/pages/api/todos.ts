import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../lib/db';
import Cors from 'cors';

const cors = Cors({
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST', 'DELETE'],
});

function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: Function) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await runMiddleware(req, res, cors);

  switch (req.method) {
    case 'GET':
      return getTodos(req, res);
    case 'POST':
      return addTodo(req, res);
    case 'DELETE':
      return deleteTodo(req, res);
    default:
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function getTodos(_req: NextApiRequest, res: NextApiResponse) {
  try {
    const [rows] = await db.query('SELECT * FROM todos');
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching todos' });
  }
}

async function addTodo(req: NextApiRequest, res: NextApiResponse) {
  const { title, description } = req.body;
  try {
    const [result]: any = await db.query(
      'INSERT INTO todos (title, description) VALUES (?, ?)',
      [title, description]
    );
    const newTodo = {
      id: result.insertId,
      title,
      description,
      created_at: new Date(),
    };
    res.status(201).json(newTodo);
  } catch (error) {
    res.status(500).json({ message: 'Error adding todo' });
  }
}

async function deleteTodo(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  try {
    await db.query('DELETE FROM todos WHERE id = ?', [id]);
    res.status(200).json({ message: 'Todo deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting todo' });
  }
}