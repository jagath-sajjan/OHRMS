import { sql } from 'drizzle-orm'
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  employeeId: text('employee_id').unique().notNull(),
  email: text('email').unique().notNull(),
  role: text('role', { enum: ['employee', 'admin'] }).notNull().default('employee'),
  password: text('password'),
  isMainAdmin: integer('is_main_admin', { mode: 'boolean' }).default(false),
  status: text('status', { enum: ['active', 'suspended'] }).notNull().default('active'),
  warnings: integer('warnings').default(0),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`)
})

export const profiles = sqliteTable('profiles', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  phone: text('phone'),
  address: text('address'),
  dateOfBirth: text('date_of_birth'),
  department: text('department'),
  designation: text('designation'),
  joiningDate: text('joining_date'),
  photoUrl: text('photo_url'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`)
})

export const attendance = sqliteTable('attendance', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  date: text('date').notNull(),
  checkIn: text('check_in'),
  checkOut: text('check_out'),
  status: text('status', { enum: ['present', 'absent', 'half-day', 'leave'] }).notNull().default('absent'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`)
})

export const leaves = sqliteTable('leaves', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type', { enum: ['paid', 'sick', 'unpaid'] }).notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  remarks: text('remarks'),
  status: text('status', { enum: ['pending', 'approved', 'rejected'] }).notNull().default('pending'),
  adminComment: text('admin_comment'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`)
})

export const payroll = sqliteTable('payroll', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  basicSalary: real('basic_salary').notNull().default(0),
  hraPercentage: real('hra_percentage').default(24),
  hra: real('hra').default(0),
  allowances: real('allowances').default(0),
  deductions: real('deductions').default(0),
  deductionsJson: text('deductions_json'),
  netSalary: real('net_salary').notNull().default(0),
  effectiveFrom: text('effective_from').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`)
})

export type User = typeof users.$inferSelect
export type Profile = typeof profiles.$inferSelect
export type Attendance = typeof attendance.$inferSelect
export type Leave = typeof leaves.$inferSelect
export type Payroll = typeof payroll.$inferSelect

export type Deduction = {
  id: string
  title: string
  amount: number
  type: 'fixed' | 'percentage'
}
