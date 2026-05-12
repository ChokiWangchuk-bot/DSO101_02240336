import { useState, useEffect } from 'react';

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const API = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetch(`${API}/tasks`)
      .then(res => res.json())
      .then(data => setTasks(data));
  }, [API]);

  const addTask = async () => {
    if (!title.trim()) return;
    const res = await fetch(`${API}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title })
    });
    const newTask = await res.json();
    setTasks([...tasks, newTask]);
    setTitle('');
  };

  const deleteTask = async (id) => {
    await fetch(`${API}/tasks/${id}`, { method: 'DELETE' });
    setTasks(tasks.filter(t => t.id !== id));
  };

  const toggleDone = async (task) => {
    const res = await fetch(`${API}/tasks/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: task.title, done: !task.done })
    });
    const updated = await res.json();
    setTasks(tasks.map(t => t.id === updated.id ? updated : t));
  };

  return (
    <div style={{ maxWidth: 500, margin: '50px auto', fontFamily: 'Arial' }}>
      <h1>Todo App</h1>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Add a task..."
          style={{ flex: 1, padding: 8, fontSize: 16 }}
        />
        <button onClick={addTask} style={{ padding: '8px 16px' }}>Add</button>
      </div>
      {tasks.map(task => (
        <div key={task.id} style={{
          display: 'flex', alignItems: 'center',
          gap: 8, marginBottom: 8, padding: 8,
          border: '1px solid #ddd', borderRadius: 4
        }}>
          <input
            type="checkbox"
            checked={task.done}
            onChange={() => toggleDone(task)}
          />
          <span style={{
            flex: 1,
            textDecoration: task.done ? 'line-through' : 'none',
            color: task.done ? '#aaa' : '#000'
          }}>
            {task.title}
          </span>
          <button onClick={() => deleteTask(task.id)}
            style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

export default App;