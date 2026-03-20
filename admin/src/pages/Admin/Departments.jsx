import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminContext } from '../../context/AdminContext'
import { toast } from 'react-toastify'

const Departments = () => {

    const { 
        aToken, doctors, getAllDoctors,
        departments, departmentsLoading, getAllDepartments, addDepartment, updateDepartment, deleteDepartment,
        getDoctorsByDepartment, blockDoctor, reassignDoctor
    } = useContext(AdminContext)
    
    const navigate = useNavigate()

    // Modal States
    const [showAddModal, setShowAddModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    
    // Form States
    const [newDeptName, setNewDeptName] = useState('')
    const [newDeptDescription, setNewDeptDescription] = useState('')
    const [editDept, setEditDept] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // ✅ Delete modal state
    const [deleteDept, setDeleteDept] = useState(null)
    const [deptDoctors, setDeptDoctors] = useState([])      // active doctors in dept
    const [deptDoctorsLoading, setDeptDoctorsLoading] = useState(false)
    const [doctorActions, setDoctorActions] = useState({})  // { docId: { action: 'block'|'reassign', newDept: '' } }
    const [processingDoctors, setProcessingDoctors] = useState({})  // { docId: true|false }

    useEffect(() => {
        if (aToken) {
            getAllDoctors()
            getAllDepartments()
        }
    }, [aToken])

    const totalDoctors = doctors.length

    // ✅ Open delete modal and load active doctors
    const openDeleteModal = async (dept) => {
        setDeleteDept(dept)
        setDoctorActions({})
        setProcessingDoctors({})
        setShowDeleteModal(true)
        setDeptDoctorsLoading(true)
        const docs = await getDoctorsByDepartment(dept.name)
        setDeptDoctors(docs)
        // Init action state for each doctor
        const initActions = {}
        docs.forEach(d => { initActions[d._id] = { action: '', newDept: '' } })
        setDoctorActions(initActions)
        setDeptDoctorsLoading(false)
    }

    // ✅ Handle block doctor inline in delete modal
    const handleInlineBlock = async (docId) => {
        setProcessingDoctors(prev => ({ ...prev, [docId]: true }))
        const success = await blockDoctor(docId, `Department ${deleteDept.name} being deleted`)
        if (success) {
            setDeptDoctors(prev => prev.filter(d => d._id !== docId))
            await getAllDepartments()
        }
        setProcessingDoctors(prev => ({ ...prev, [docId]: false }))
    }

    // ✅ Handle reassign doctor inline in delete modal
    const handleInlineReassign = async (docId) => {
        const action = doctorActions[docId]
        if (!action?.newDept) {
            toast.error('Please select a department to reassign to')
            return
        }
        setProcessingDoctors(prev => ({ ...prev, [docId]: true }))
        const success = await reassignDoctor(docId, action.newDept)
        if (success) {
            setDeptDoctors(prev => prev.filter(d => d._id !== docId))
            await getAllDepartments()
        }
        setProcessingDoctors(prev => ({ ...prev, [docId]: false }))
    }

    // ✅ Final delete — only possible when deptDoctors is empty
    const handleFinalDelete = async () => {
        if (deptDoctors.length > 0) return
        setIsSubmitting(true)
        const success = await deleteDepartment(deleteDept._id)
        setIsSubmitting(false)
        if (success) {
            setShowDeleteModal(false)
            setDeleteDept(null)
            setDeptDoctors([])
        }
    }

    // ==================== Add / Edit ====================

    const handleAddDepartment = async (e) => {
        e.preventDefault()
        if (!newDeptName.trim()) { toast.error('Please enter department name'); return }
        setIsSubmitting(true)
        const success = await addDepartment(newDeptName.trim(), newDeptDescription.trim())
        setIsSubmitting(false)
        if (success) {
            setShowAddModal(false)
            setNewDeptName('')
            setNewDeptDescription('')
        }
    }

    const handleEditDepartment = async (e) => {
        e.preventDefault()
        if (!editDept || !editDept.name.trim()) { toast.error('Please enter department name'); return }
        setIsSubmitting(true)
        const success = await updateDepartment(editDept._id, {
            name: editDept.name.trim(),
            description: editDept.description?.trim() || '',
            isActive: editDept.isActive
        })
        setIsSubmitting(false)
        if (success) { setShowEditModal(false); setEditDept(null) }
    }

    const openEditModal = (dept) => { setEditDept({ ...dept }); setShowEditModal(true) }

    // Other depts for reassign dropdown (excluding current dept)
    const otherDepts = departments.filter(d => deleteDept && d._id !== deleteDept._id)

    return (
        <div className='w-full max-w-6xl m-5'>

            {/* Header */}
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6'>
                <div>
                    <h1 className='text-2xl font-bold text-gray-800'>Departments</h1>
                    <p className='text-gray-500 text-sm mt-1'>Manage medical departments and their doctors</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className='flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25'
                >
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 6v6m0 0v6m0-6h6m-6 0H6' />
                    </svg>
                    Add Department
                </button>
            </div>

            {/* Stats Bar */}
            <div className='bg-white rounded-xl shadow-sm p-4 mb-6'>
                <div className='flex items-center gap-6'>
                    <div className='flex items-center gap-2'>
                        <div className='w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center'>
                            <svg className='w-5 h-5 text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' />
                            </svg>
                        </div>
                        <div>
                            <p className='text-2xl font-bold text-gray-800'>{departments.length}</p>
                            <p className='text-xs text-gray-500'>Departments</p>
                        </div>
                    </div>
                    <div className='w-px h-10 bg-gray-200'></div>
                    <div className='flex items-center gap-2'>
                        <div className='w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center'>
                            <svg className='w-5 h-5 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
                            </svg>
                        </div>
                        <div>
                            <p className='text-2xl font-bold text-gray-800'>{totalDoctors}</p>
                            <p className='text-xs text-gray-500'>Total Doctors</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Loading */}
            {departmentsLoading ? (
                <div className='bg-white rounded-xl shadow-sm p-12 text-center'>
                    <div className='animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4'></div>
                    <p className='text-gray-500'>Loading departments...</p>
                </div>
            ) : (
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'>
                    
                    {/* All Doctors Card */}
                    <div
                        onClick={() => navigate('/doctors')}
                        className='bg-gradient-to-br from-primary to-blue-600 rounded-2xl shadow-lg p-6 cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-300 text-white group'
                    >
                        <div className='flex items-start justify-between mb-4'>
                            <div className='w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform'>
                                <svg className='w-7 h-7 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
                                </svg>
                            </div>
                            <svg className='w-6 h-6 text-white/70 group-hover:translate-x-1 transition-transform' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5l7 7-7 7' />
                            </svg>
                        </div>
                        <h3 className='text-xl font-bold mb-1'>All Doctors</h3>
                        <p className='text-white/80 text-sm mb-3'>View all registered doctors</p>
                        <div className='flex items-center gap-2 pt-3 border-t border-white/20'>
                            <span className='text-3xl font-bold'>{totalDoctors}</span>
                            <span className='text-white/70 text-sm'>doctors</span>
                        </div>
                    </div>

                    {/* Department Cards */}
                    {departments.map((dept) => (
                        <div key={dept._id} className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-300 group'>
                            <div className='flex items-start justify-between mb-4'>
                                <div
                                    className='w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center cursor-pointer group-hover:bg-primary/20 transition-all'
                                    onClick={() => navigate(`/doctors/${encodeURIComponent(dept.name)}`)}
                                >
                                    <svg className='w-7 h-7 text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' />
                                    </svg>
                                </div>
                                <div className='flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                                    <button onClick={(e) => { e.stopPropagation(); openEditModal(dept) }}
                                        className='p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all' title='Edit'>
                                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
                                        </svg>
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); openDeleteModal(dept) }}
                                        className='p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all' title='Delete'>
                                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <div className='cursor-pointer' onClick={() => navigate(`/doctors/${encodeURIComponent(dept.name)}`)}>
                                <h3 className='text-lg font-bold text-gray-800 mb-1 group-hover:text-primary transition-colors'>{dept.name}</h3>
                                {dept.description && <p className='text-gray-500 text-sm mb-3 line-clamp-2'>{dept.description}</p>}
                                
                                <div className='flex items-center gap-2 mb-3'>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${dept.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                        {dept.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                    {dept.blockedCount > 0 && (
                                        <span className='px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500'>
                                            {dept.blockedCount} blocked
                                        </span>
                                    )}
                                </div>

                                <div className='flex items-center justify-between pt-3 border-t border-gray-100'>
                                    <div className='flex items-center gap-2'>
                                        <svg className='w-5 h-5 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                                        </svg>
                                        <span className='text-gray-600'>
                                            <span className='font-bold text-gray-800'>{dept.doctorCount || 0}</span> active doctors
                                        </span>
                                    </div>
                                    <svg className='w-5 h-5 text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5l7 7-7 7' />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Empty State */}
                    {departments.length === 0 && !departmentsLoading && (
                        <div className='col-span-full bg-white rounded-xl shadow-sm p-12 text-center'>
                            <h3 className='text-xl font-semibold text-gray-700 mb-2'>No Departments Yet</h3>
                            <p className='text-gray-500 mb-4'>Create your first department to organize doctors</p>
                            <button onClick={() => setShowAddModal(true)}
                                className='px-6 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all'>
                                Add Department
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* ==================== ADD MODAL ==================== */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
                        <div className='bg-gradient-to-r from-primary/10 to-blue-50 px-6 py-4 border-b border-gray-100'>
                            <h3 className="text-xl font-bold text-gray-800">Add New Department</h3>
                            <p className='text-sm text-gray-500'>Create a new medical department</p>
                        </div>
                        <form onSubmit={handleAddDepartment} className="p-6">
                            <div className='mb-4'>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>Department Name <span className='text-red-500'>*</span></label>
                                <input type='text' value={newDeptName} onChange={(e) => setNewDeptName(e.target.value)}
                                    placeholder='e.g., Cardiologist, Orthopedic'
                                    className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all'
                                    autoFocus required />
                            </div>
                            <div className='mb-6'>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>Description <span className='text-gray-400'>(Optional)</span></label>
                                <textarea value={newDeptDescription} onChange={(e) => setNewDeptDescription(e.target.value)}
                                    placeholder='Brief description...' rows={3}
                                    className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none' />
                            </div>
                            <div className='flex gap-3'>
                                <button type='button' onClick={() => { setShowAddModal(false); setNewDeptName(''); setNewDeptDescription('') }}
                                    disabled={isSubmitting}
                                    className="flex-1 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50">
                                    Cancel
                                </button>
                                <button type='submit' disabled={isSubmitting || !newDeptName.trim()}
                                    className="flex-1 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                    {isSubmitting ? 'Adding...' : 'Add Department'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ==================== EDIT MODAL ==================== */}
            {showEditModal && editDept && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
                        <div className='bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100'>
                            <h3 className="text-xl font-bold text-gray-800">Edit Department</h3>
                            <p className='text-sm text-gray-500'>Update department details</p>
                        </div>
                        <form onSubmit={handleEditDepartment} className="p-6">
                            <div className='mb-4'>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>Department Name <span className='text-red-500'>*</span></label>
                                <input type='text' value={editDept.name} onChange={(e) => setEditDept({ ...editDept, name: e.target.value })}
                                    className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all' required />
                            </div>
                            <div className='mb-4'>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>Description</label>
                                <textarea value={editDept.description || ''} onChange={(e) => setEditDept({ ...editDept, description: e.target.value })}
                                    rows={3} className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none' />
                            </div>
                            <div className='mb-6'>
                                <label className='flex items-center gap-3 cursor-pointer'>
                                    <div onClick={() => setEditDept({ ...editDept, isActive: !editDept.isActive })}
                                        className={`w-12 h-6 rounded-full transition-all relative ${editDept.isActive ? 'bg-green-500' : 'bg-gray-300'}`}>
                                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${editDept.isActive ? 'right-1' : 'left-1'}`}></span>
                                    </div>
                                    <span className='text-sm font-medium text-gray-700'>{editDept.isActive ? 'Active' : 'Inactive'}</span>
                                </label>
                            </div>
                            <div className='flex gap-3'>
                                <button type='button' onClick={() => { setShowEditModal(false); setEditDept(null) }} disabled={isSubmitting}
                                    className="flex-1 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50">
                                    Cancel
                                </button>
                                <button type='submit' disabled={isSubmitting || !editDept.name.trim()}
                                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all disabled:opacity-50">
                                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ==================== SMART DELETE MODAL ==================== */}
            {showDeleteModal && deleteDept && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                        
                        {/* Header */}
                        <div className='px-6 py-4 border-b border-gray-100 flex-shrink-0'>
                            <div className='flex items-center justify-between'>
                                <div>
                                    <h3 className='text-xl font-bold text-gray-800'>Delete Department</h3>
                                    <p className='text-sm text-gray-500'>"{deleteDept.name}"</p>
                                </div>
                                <button onClick={() => { setShowDeleteModal(false); setDeleteDept(null); setDeptDoctors([]) }}
                                    className='text-gray-400 hover:text-gray-600'>
                                    <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className='overflow-y-auto flex-1 p-6'>

                            {deptDoctorsLoading ? (
                                <div className='text-center py-8'>
                                    <div className='w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3'></div>
                                    <p className='text-gray-500 text-sm'>Loading doctors...</p>
                                </div>
                            ) : deptDoctors.length === 0 ? (
                                /* No active doctors — ready to delete */
                                <div className='text-center py-6'>
                                    <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                                        <svg className='w-8 h-8 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5 13l4 4L19 7' />
                                        </svg>
                                    </div>
                                    <h4 className='text-lg font-semibold text-gray-700 mb-2'>Ready to Delete</h4>
                                    <p className='text-gray-500 text-sm mb-2'>No active doctors in this department.</p>
                                    {deleteDept.blockedCount > 0 && (
                                        <p className='text-xs text-gray-400'>{deleteDept.blockedCount} blocked doctor(s) will remain blocked until manually unblocked.</p>
                                    )}
                                </div>
                            ) : (
                                /* Has active doctors — show list with actions */
                                <div>
                                    <div className='p-3 bg-amber-50 rounded-xl border border-amber-200 mb-4'>
                                        <p className='text-sm text-amber-700 font-medium'>
                                            ⚠️ {deptDoctors.length} active doctor(s) need to be handled before deleting this department.
                                        </p>
                                        <p className='text-xs text-amber-600 mt-1'>Block or reassign each doctor, then delete.</p>
                                    </div>

                                    <div className='space-y-3'>
                                        {deptDoctors.map(doc => (
                                            <div key={doc._id} className='border border-gray-200 rounded-xl p-4'>
                                                {/* Doctor Info */}
                                                <div className='flex items-center gap-3 mb-3'>
                                                    <img src={doc.image} alt={doc.name} className='w-10 h-10 rounded-full object-cover border border-gray-200' />
                                                    <div>
                                                        <p className='font-semibold text-gray-800 text-sm'>{doc.name}</p>
                                                        <p className='text-xs text-gray-500'>{doc.email}</p>
                                                    </div>
                                                    <div className='ml-auto'>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${doc.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                            {doc.available ? 'Available' : 'Unavailable'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className='flex flex-col gap-2'>
                                                    {/* Block Button */}
                                                    <button
                                                        onClick={() => handleInlineBlock(doc._id)}
                                                        disabled={processingDoctors[doc._id]}
                                                        className='flex items-center justify-center gap-2 w-full py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900 transition-all disabled:opacity-50'
                                                    >
                                                        {processingDoctors[doc._id] ? (
                                                            <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                                                        ) : (
                                                            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636' />
                                                            </svg>
                                                        )}
                                                        Block Doctor
                                                    </button>

                                                    {/* Divider */}
                                                    <div className='flex items-center gap-2'>
                                                        <div className='flex-1 h-px bg-gray-200'></div>
                                                        <span className='text-xs text-gray-400'>or reassign to</span>
                                                        <div className='flex-1 h-px bg-gray-200'></div>
                                                    </div>

                                                    {/* Reassign Row */}
                                                    <div className='flex gap-2'>
                                                        <select
                                                            value={doctorActions[doc._id]?.newDept || ''}
                                                            onChange={e => setDoctorActions(prev => ({
                                                                ...prev,
                                                                [doc._id]: { ...prev[doc._id], newDept: e.target.value }
                                                            }))}
                                                            className='flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white'
                                                        >
                                                            <option value=''>Select department</option>
                                                            {otherDepts.map(d => (
                                                                <option key={d._id} value={d.name}>{d.name}</option>
                                                            ))}
                                                        </select>
                                                        <button
                                                            onClick={() => handleInlineReassign(doc._id)}
                                                            disabled={processingDoctors[doc._id] || !doctorActions[doc._id]?.newDept}
                                                            className='px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
                                                        >
                                                            Reassign
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className='flex border-t border-gray-100 flex-shrink-0'>
                            <button
                                onClick={() => { setShowDeleteModal(false); setDeleteDept(null); setDeptDoctors([]) }}
                                className="flex-1 py-4 text-gray-700 font-semibold hover:bg-gray-50 transition-all border-r border-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleFinalDelete}
                                disabled={isSubmitting || deptDoctors.length > 0}
                                className="flex-1 py-4 text-red-600 font-semibold hover:bg-red-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? 'Deleting...' : (
                                    <>
                                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                                        </svg>
                                        {deptDoctors.length > 0 ? `Handle ${deptDoctors.length} doctor(s) first` : 'Delete Department'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}

export default Departments