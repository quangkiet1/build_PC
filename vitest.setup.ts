process.env.DATABASE_URL ||= 'postgresql://test:test@localhost:5432/pc_builder_test?schema=public'
process.env.JWT_SECRET ||= 'test-secret-for-vitest'

if (!process.env.NODE_ENV) {
	Object.assign(process.env, { NODE_ENV: 'test' })
}