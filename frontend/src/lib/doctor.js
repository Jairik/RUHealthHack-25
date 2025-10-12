import { supabase } from './supabase'

export async function getAllDoctors() {
  const { data, error } = await supabase
    .from('doctor')
    .select('*')
  
  if (error) throw error
  return data
}

export async function getDoctorById(docId) {
  const { data, error } = await supabase
    .from('doctor')
    .select('*')
    .eq('doc_id', docId)
    .single()
  
  if (error) throw error
  return data
}

export async function getDoctorsWithInsurance() {
  const { data, error } = await supabase
    .from('doctor')
    .select(`
      *,
      doctor_insurance (
        insurance (
          ins_id,
          ins_pol
        )
      )
    `)
  
  if (error) throw error
  return data
}

export async function getDoctorsByInsurance(insuranceId) {
  const { data, error } = await supabase
    .from('doctor_insurance')
    .select(`
      doctor:doc_id (
        doc_id,
        doc_fn,
        doc_ln
      )
    `)
    .eq('ins_id', insuranceId)
  
  if (error) throw error
  return data.map(item => item.doctor)
}