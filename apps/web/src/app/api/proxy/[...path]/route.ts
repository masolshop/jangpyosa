import { NextRequest, NextResponse } from 'next/server'

const API_BASE = process.env.API_BASE || 'http://localhost:4000'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/')
  const searchParams = request.nextUrl.searchParams.toString()
  // Remove /api prefix if present (backend doesn't use /api prefix)
  const cleanPath = path.startsWith('api/') ? path.substring(4) : path
  const url = `${API_BASE}/${cleanPath}${searchParams ? `?${searchParams}` : ''}`

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('authorization') 
          ? { 'Authorization': request.headers.get('authorization')! } 
          : {}),
      },
    })

    const data = await response.json()

    return NextResponse.json(data, { status: response.status })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'PROXY_ERROR', message: error.message },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/')
  // Remove /api prefix if present (backend doesn't use /api prefix)
  const cleanPath = path.startsWith('api/') ? path.substring(4) : path
  const url = `${API_BASE}/${cleanPath}`

  try {
    // Try to read body if present, otherwise send empty object
    let body = {}
    try {
      const text = await request.text()
      if (text) {
        body = JSON.parse(text)
      }
    } catch {
      // No body or invalid JSON - use empty object
      body = {}
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('authorization') 
          ? { 'Authorization': request.headers.get('authorization')! } 
          : {}),
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    return NextResponse.json(data, { status: response.status })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'PROXY_ERROR', message: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/')
  // Remove /api prefix if present (backend doesn't use /api prefix)
  const cleanPath = path.startsWith('api/') ? path.substring(4) : path
  const url = `${API_BASE}/${cleanPath}`

  try {
    // Try to read body if present, otherwise send empty object
    let body = {}
    try {
      const text = await request.text()
      if (text) {
        body = JSON.parse(text)
      }
    } catch {
      // No body or invalid JSON - use empty object
      body = {}
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('authorization') 
          ? { 'Authorization': request.headers.get('authorization')! } 
          : {}),
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    return NextResponse.json(data, { status: response.status })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'PROXY_ERROR', message: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/')
  // Remove /api prefix if present (backend doesn't use /api prefix)
  const cleanPath = path.startsWith('api/') ? path.substring(4) : path
  const url = `${API_BASE}/${cleanPath}`

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('authorization') 
          ? { 'Authorization': request.headers.get('authorization')! } 
          : {}),
      },
    })

    const data = await response.json()

    return NextResponse.json(data, { status: response.status })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'PROXY_ERROR', message: error.message },
      { status: 500 }
    )
  }
}
