import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getD1 } from '@/lib/d1'

/**
 * GET /api/users/me
 * 获取当前登录用户的信息
 */
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // 从 D1 获取用户详细信息
    const db = getD1()
    
    if (db) {
      const user = await db.prepare(
        'SELECT id, email, name, image, email_verified, created_at, updated_at FROM users WHERE id = ?'
      ).bind(session.user.id).first()
      
      if (user) {
        return NextResponse.json({
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          emailVerified: user.email_verified,
          createdAt: user.created_at,
          updatedAt: user.updated_at
        })
      }
    }
    
    // 如果 D1 不可用，返回 session 中的信息
    return NextResponse.json({
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      image: session.user.image
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
