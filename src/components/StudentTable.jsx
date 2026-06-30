import React, { useEffect, useState } from 'react'
import { getStudents, createStudent, updateStudent, deleteStudent } from '../api'

const emptyForm = { rollno: '', name: '', gender: 'Male', admissionYear: new Date().getFullYear(), std: '', section: '' }

export default function StudentTable() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState(null)

  async function load() {
    setLoading(true)
    try {
      const data = await getStudents()
      setStudents(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function onChange(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError(null)
    try {
      const payload = {
        rollno: Number(form.rollno),
        name: form.name,
        gender: form.gender,
        admissionYear: Number(form.admissionYear),
        std: Number(form.std),
        section: (form.section || '').toString().charAt(0) || 'A',
      }

      if (editing) {
        await updateStudent(editing, payload)
        setEditing(null)
      } else {
        await createStudent(payload)
      }
      setForm(emptyForm)
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  function onEdit(s) {
    setEditing(s.rollno)
    setForm({
      rollno: s.rollno,
      name: s.name || '',
      gender: s.gender || 'Male',
      admissionYear: s.admissionYear || new Date().getFullYear(),
      std: s.std || '',
      section: s.section || '',
    })
  }

  async function onDelete(id) {
    if (!confirm('Delete student ' + id + '?')) return
    try {
      await deleteStudent(id)
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="student-table">
      {error && <div className="error">{error}</div>}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Roll No</th>
              <th>Name</th>
              <th>Gender</th>
              <th>Admission Year</th>
              <th>Std</th>
              <th>Section</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7">Loading...</td></tr>
            ) : students.length === 0 ? (
              <tr><td colSpan="7">No students</td></tr>
            ) : (
              students.map(s => (
                <tr key={s.rollno}>
                  <td>{s.rollno}</td>
                  <td>{s.name}</td>
                  <td>{s.gender}</td>
                  <td>{s.admissionYear}</td>
                  <td>{s.std}</td>
                  <td>{s.section}</td>
                  <td>
                    <button onClick={() => onEdit(s)}>Edit</button>
                    <button className="danger" onClick={() => onDelete(s.rollno)}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <form className="student-form" onSubmit={onSubmit}>
        <h2>{editing ? 'Edit' : 'Add'} Student</h2>
        <label>Roll No
          <input name="rollno" value={form.rollno} onChange={onChange} required type="number" />
        </label>
        <label>Name
          <input name="name" value={form.name} onChange={onChange} required />
        </label>
        <label>Gender
          <select name="gender" value={form.gender} onChange={onChange}>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </label>
        <label>Admission Year
          <input name="admissionYear" value={form.admissionYear} onChange={onChange} required type="number" />
        </label>
        <label>Std
          <input name="std" value={form.std} onChange={onChange} required type="number" />
        </label>
        <label>Section
          <input name="section" value={form.section} onChange={onChange} maxLength={1} required />
        </label>

        <div className="form-actions">
          <button type="submit">{editing ? 'Update' : 'Add'}</button>
          <button type="button" onClick={() => { setForm(emptyForm); setEditing(null) }}>Reset</button>
        </div>
      </form>
    </div>
  )
}
