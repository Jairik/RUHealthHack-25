import { supabase } from './supabase'

/**
 * Get all triage cases with full related data
 * Includes: client info, insurance, doctors, and questions/answers
 */
export async function getAllTriageCasesForDashboard() {
  const { data, error } = await supabase
    .from('triage')
    .select(`
      *,
      client:client_id (
        client_id,
        client_fn,
        client_ln,
        client_dob,
        insurance:ins_pol_id (
          ins_id,
          ins_pol
        )
      ),
      doctor1:doc_id1 (
        doc_id,
        doc_fn,
        doc_ln
      ),
      doctor2:doc_id2 (
        doc_id,
        doc_fn,
        doc_ln
      ),
      doctor3:doc_id3 (
        doc_id,
        doc_fn,
        doc_ln
      ),
      triage_question (
        triage_question_id,
        triage_question,
        triage_answer
      )
    `)
    .order('date_time', { ascending: false })
  
  if (error) {
    console.error('Error fetching triage cases:', error)
    throw error
  }

  // Transform data to match Dashboard component format
  return data.map((triage, index) => ({
    // Core triage info
    id: triage.triage_id,
    case_number: `TRG-${String(index + 1).padStart(3, '0')}`,
    agent_id: triage.agent_id,
    
    // Patient info
    patient_first_name: triage.client?.client_fn || 'Unknown',
    patient_last_name: triage.client?.client_ln || '',
    patient_dob: triage.client?.client_dob || null,
    
    // Insurance info
    insurance: triage.client?.insurance?.ins_pol || 'Not specified',
    
    // Timing
    created_date: triage.date_time,
    
    // Epic status
    sent_to_epic: triage.sent_to_epic || false,
    epic_sent_date: triage.epic_sent_date || null,
    
    // Confidence scores (subspecialist_confidences)
    subspecialist_confidences: [
      { name: 'Reproductive Endocrinology', confidence: triage.re_conf * 100 },
      { name: 'Maternal-Fetal Medicine', confidence: triage.mfm_conf * 100 },
      { name: 'Urogynecology', confidence: triage.uro_conf * 100 },
      { name: 'General OB', confidence: triage.gob_conf * 100 },
      { name: 'Miscarriage Care', confidence: triage.mis_conf * 100 },
      { name: 'Gynecologic Oncology', confidence: triage.go_conf * 100 }
    ].filter(s => s.confidence > 0), // Only include non-zero confidences
    
    // Recommended doctors
    recommended_doctor: triage.doctor1 
      ? `Dr. ${triage.doctor1.doc_fn} ${triage.doctor1.doc_ln}`
      : 'Not Assigned',
    
    alternate_doctors: [
      triage.doctor2 ? `Dr. ${triage.doctor2.doc_fn} ${triage.doctor2.doc_ln}` : null,
      triage.doctor3 ? `Dr. ${triage.doctor3.doc_fn} ${triage.doctor3.doc_ln}` : null
    ].filter(Boolean),
    
    // Conversation history (questions and answers)
    conversation_history: triage.triage_question.map(q => ({
      question: q.triage_question,
      answer: q.triage_answer
    })),
    
    // Agent notes
    agent_notes: triage.agent_notes || '',
    
    // Final recommendation (derive from highest confidence)
    final_recommendation: getFinalRecommendation(triage),
    
    // Health history (can be extracted from conversation or stored separately)
    health_history: extractHealthHistory(triage.triage_question)
  }))
}

/**
 * Helper: Determine final recommendation based on confidence scores
 */
function getFinalRecommendation(triage) {
  const confidences = [
    { type: 'Reproductive Endocrinology', score: triage.re_conf },
    { type: 'Maternal-Fetal Medicine', score: triage.mfm_conf },
    { type: 'Urogynecology', score: triage.uro_conf },
    { type: 'General OB', score: triage.gob_conf },
    { type: 'Miscarriage Care', score: triage.mis_conf },
    { type: 'Gynecologic Oncology', score: triage.go_conf }
  ]
  
  const highest = confidences.reduce((max, curr) => 
    curr.score > max.score ? curr : max
  )
  
  return highest.score > 0 ? highest.type : 'General Consultation'
}

/**
 * Helper: Extract health history from conversation
 */
function extractHealthHistory(questions) {
  // Look for questions that contain health-related keywords
  const healthKeywords = [
    'pregnant', 'pregnancy', 'medical history', 'condition', 
    'medication', 'allergy', 'surgery', 'symptoms'
  ]
  
  return questions
    .filter(q => 
      healthKeywords.some(keyword => 
        q.triage_question.toLowerCase().includes(keyword) ||
        q.triage_answer.toLowerCase().includes(keyword)
      )
    )
    .map(q => ({
      question: q.triage_question,
      answer: q.triage_answer
    }))
}

/**
 * Get single triage case by ID with full details
 */
export async function getTriageCaseById(triageId) {
  const { data, error } = await supabase
    .from('triage')
    .select(`
      *,
      client:client_id (
        client_id,
        client_fn,
        client_ln,
        client_dob,
        insurance:ins_pol_id (
          ins_id,
          ins_pol
        )
      ),
      doctor1:doc_id1 (
        doc_id,
        doc_fn,
        doc_ln
      ),
      doctor2:doc_id2 (
        doc_id,
        doc_fn,
        doc_ln
      ),
      doctor3:doc_id3 (
        doc_id,
        doc_fn,
        doc_ln
      ),
      triage_question (
        triage_question_id,
        triage_question,
        triage_answer
      )
    `)
    .eq('triage_id', triageId)
    .single()
  
  if (error) throw error
  
  // Use same transformation as getAllTriageCasesForDashboard
  return transformTriageCase(data, 0)
}

/**
 * Mark triage as sent to Epic
 */
export async function markTriageSentToEpic(triageId) {
  const { data, error } = await supabase
    .from('triage')
    .update({
      sent_to_epic: true,
      epic_sent_date: new Date().toISOString()
    })
    .eq('triage_id', triageId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

/**
 * Get triage statistics for dashboard
 */
export async function getTriageStats() {
  const { data, error } = await supabase
    .from('triage')
    .select('date_time, sent_to_epic')
  
  if (error) throw error
  
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekAgo = new Date(today)
  weekAgo.setDate(weekAgo.getDate() - 7)
  
  return {
    total: data.length,
    today: data.filter(t => new Date(t.date_time) >= today).length,
    thisWeek: data.filter(t => new Date(t.date_time) >= weekAgo).length,
    sentToEpic: data.filter(t => t.sent_to_epic).length,
    pending: data.filter(t => !t.sent_to_epic).length
  }
}

/**
 * Search triage cases
 */
export async function searchTriageCases(searchTerm) {
  const { data, error } = await supabase
    .from('triage')
    .select(`
      *,
      client:client_id (
        client_id,
        client_fn,
        client_ln,
        client_dob,
        insurance:ins_pol_id (
          ins_id,
          ins_pol
        )
      ),
      doctor1:doc_id1 (
        doc_id,
        doc_fn,
        doc_ln
      ),
      doctor2:doc_id2 (
        doc_id,
        doc_fn,
        doc_ln
      ),
      doctor3:doc_id3 (
        doc_id,
        doc_fn,
        doc_ln
      ),
      triage_question (
        triage_question_id,
        triage_question,
        triage_answer
      )
    `)
    .or(`agent_notes.ilike.%${searchTerm}%`)
    .order('date_time', { ascending: false })
  
  if (error) throw error
  
  // Also search in client names
  const allCases = await getAllTriageCasesForDashboard()
  
  return allCases.filter(case_ => {
    const searchLower = searchTerm.toLowerCase()
    return (
      case_.patient_first_name?.toLowerCase().includes(searchLower) ||
      case_.patient_last_name?.toLowerCase().includes(searchLower) ||
      case_.final_recommendation?.toLowerCase().includes(searchLower) ||
      case_.recommended_doctor?.toLowerCase().includes(searchLower) ||
      case_.agent_id?.toString().includes(searchLower) ||
      case_.case_number?.toLowerCase().includes(searchLower)
    )
  })
}