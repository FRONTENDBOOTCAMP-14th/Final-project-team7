import type { Tables, TablesInsert, TablesUpdate } from './database.types'

export type Course = Tables<'course'>
export type CourseInsert = TablesInsert<'course'>
export type CourseUpdate = TablesUpdate<'course'>

export type Record = Tables<'running_record'>
export type RecordInsert = TablesInsert<'running_record'>
export type RecordUpdate = TablesUpdate<'running_record'>

export type Profile = Tables<'profiles'>
export type ProfileInsert = TablesInsert<'profiles'>
export type ProfileUpdate = TablesUpdate<'profiles'>
