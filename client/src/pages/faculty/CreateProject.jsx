import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/api.js';
import Navbar from '../../components/Navbar.jsx';
import FacultySidebar from '../../components/FacultySidebar.jsx';
import Spinner from '../../components/Spinner.jsx';

function RubricBuilder({ rubric, setRubric }) {
  const total = rubric.reduce((s, r) => s + Number(r.weight || 0), 0);

  function addRow() { setRubric(r => [...r, { criteria: '', weight: '' }]); }
  function update(i, field, val) {
    setRubric(r => r.map((row, idx) => idx === i ? { ...row, [field]: val } : row));
  }
  function remove(i) { setRubric(r => r.filter((_, idx) => idx !== i)); }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="label">Rubric</label>
        <span className={`text-xs font-semibold ${total === 100 ? 'text-green-600' : 'text-red-500'}`}>
          Total: {total}% {total !== 100 && '(must be 100%)'}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {rubric.map((row, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              placeholder="Criteria"
              value={row.criteria}
              onChange={e => update(i, 'criteria', e.target.value)}
              className="input flex-1"
            />
            <input
              type="number"
              placeholder="%"
              value={row.weight}
              onChange={e => update(i, 'weight', e.target.value)}
              className="input w-20"
            />
            <button type="button" onClick={() => remove(i)} className="text-red-400 hover:text-red-600 text-lg leading-none">×</button>
          </div>
        ))}
        <button type="button" onClick={addRow} className="btn-secondary text-sm self-start mt-1">+ Add criteria</button>
      </div>
    </div>
  );
}

function MilestoneBuilder({ milestones, setMilestones }) {
  function addRow() { setMilestones(m => [...m, { title: '', description: '', dueDate: '', order: m.length + 1 }]); }
  function update(i, field, val) {
    setMilestones(m => m.map((row, idx) => idx === i ? { ...row, [field]: val } : row));
  }
  function remove(i) {
    setMilestones(m => m.filter((_, idx) => idx !== i).map((r, idx) => ({ ...r, order: idx + 1 })));
  }

  return (
    <div>
      <label className="label mb-2 block">Milestones (min 2)</label>
      <div className="flex flex-col gap-3">
        {milestones.map((m, i) => (
          <div key={i} className="border border-gray-200 rounded-xl p-3 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-bold w-5">M{i + 1}</span>
              <input placeholder="Title" value={m.title} onChange={e => update(i, 'title', e.target.value)} className="input flex-1" />
              <button type="button" onClick={() => remove(i)} className="text-red-400 hover:text-red-600 text-lg leading-none">×</button>
            </div>
            <input placeholder="Description (optional)" value={m.description} onChange={e => update(i, 'description', e.target.value)} className="input" />
            <input type="date" value={m.dueDate} onChange={e => update(i, 'dueDate', e.target.value)} className="input" />
          </div>
        ))}
        <button type="button" onClick={addRow} className="btn-secondary text-sm self-start">+ Add milestone</button>
      </div>
    </div>
  );
}

export default function CreateProject() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', type: 'group', minTeam: 2, maxTeam: 5, totalMarks: 100 });
  const [rubric, setRubric] = useState([{ criteria: 'Code Quality', weight: '40' }, { criteria: 'Documentation', weight: '30' }, { criteria: 'Presentation', weight: '30' }]);
  const [milestones, setMilestones] = useState([{ title: '', description: '', dueDate: '', order: 1 }, { title: '', description: '', dueDate: '', order: 2 }]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function change(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })); }

  async function submit(e) {
    e.preventDefault();
    setError('');
    const rubricWeightTotal = rubric.reduce((s, r) => s + Number(r.weight || 0), 0);
    if (rubric.length > 0 && rubricWeightTotal !== 100) {
      setError('Rubric weights must sum to 100%');
      return;
    }
    if (milestones.length < 2) { setError('Add at least 2 milestones'); return; }
    setLoading(true);
    try {
      const { data } = await api.post(`/courses/${courseId}/projects`, {
        title: form.title,
        description: form.description,
        type: form.type,
        teamSize: { min: Number(form.minTeam), max: Number(form.maxTeam) },
        rubric: rubric.map(r => ({ criteria: r.criteria, weight: Number(r.weight) })),
        totalMarks: Number(form.totalMarks),
      });
      const projectId = data.project._id;
      for (const m of milestones) {
        await api.post(`/projects/${projectId}/milestones`, {
          title: m.title,
          description: m.description,
          dueDate: new Date(m.dueDate).toISOString(),
          order: m.order,
        });
      }
      navigate(`/faculty/projects/${projectId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create project');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <FacultySidebar />
        <main className="flex-1 p-6 max-w-2xl mx-auto w-full">
          <h1 className="text-xl font-bold mb-6">Create Project</h1>
          {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2">{error}</div>}
          <form onSubmit={submit} className="flex flex-col gap-6">
            <div className="card flex flex-col gap-4">
              <div>
                <label className="label">Title</label>
                <input name="title" required value={form.title} onChange={change} className="input" />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea name="description" rows={3} value={form.description} onChange={change} className="input resize-none" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="label">Type</label>
                  <select name="type" value={form.type} onChange={change} className="input">
                    <option value="group">Group</option>
                    <option value="capstone">Capstone</option>
                  </select>
                </div>
                <div>
                  <label className="label">Min team size</label>
                  <input name="minTeam" type="number" min="1" value={form.minTeam} onChange={change} className="input" />
                </div>
                <div>
                  <label className="label">Max team size</label>
                  <input name="maxTeam" type="number" min="1" value={form.maxTeam} onChange={change} className="input" />
                </div>
              </div>
              <div>
                <label className="label">Total marks</label>
                <input name="totalMarks" type="number" min="1" value={form.totalMarks} onChange={change} className="input w-32" />
              </div>
            </div>

            <div className="card">
              <RubricBuilder rubric={rubric} setRubric={setRubric} />
            </div>

            <div className="card">
              <MilestoneBuilder milestones={milestones} setMilestones={setMilestones} />
            </div>

            <button type="submit" disabled={loading} className="btn-primary flex items-center justify-center gap-2">
              {loading && <Spinner size="sm" />} Create project
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}
