import { supabase } from './supabase'

export async function getQuestionsByTriageId(triageId) {
  const { data, error } = await supabase
    .from('triage_question')
    .select('*')
    .eq('triage_id', triageId)
  
  if (error) throw error
  return data
}

export async function createTriageQuestions(triageId, questions) {
  const questionData = questions.map(q => ({
    triage_id: triageId,
    triage_question: q.question,
    triage_answer: q.answer
  }))
  
  const { data, error } = await supabase
    .from('triage_question')
    .insert(questionData)
    .select()
  
  if (error) throw error
  return data
}