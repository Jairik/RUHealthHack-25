import { supabase } from './supabase'

export async function getAllInsurance() {
  const { data, error } = await supabase
    .from('insurance')
    .select('*')
  
  if (error) throw error
  return data
}

export async function getInsuranceById(insId) {
  const { data, error } = await supabase
    .from('insurance')
    .select('*')
    .eq('ins_id', insId)
    .single()
  
  if (error) throw error
  return data
}

export async function createInsurance(insuranceData) {
  const { data, error } = await supabase
    .from('insurance')
    .insert([insuranceData])
    .select()
  
  if (error) throw error
  return data[0]
}