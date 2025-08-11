'use client'

import { useEffect, useState } from 'react'
import { use1healthAuth } from '@/lib/use1healthAuth'
import { postTo1healthAPI } from '@/lib/api'
import { useLaunchPayload } from '@/lib/useLaunchPayload'

import { db } from '@/lib/firebase'
import { collection, addDoc } from 'firebase/firestore'
import ExampleCard from '@/components/ExampleCard'

export default function Home() {
  // Get token sent from the parent iframe (via postMessage)
  const token = use1healthAuth()

  // Get launch payload from URL (?lpl=...)
  const launchPayload = useLaunchPayload()

  // Store user info from 1health API
  const [userInfo, setUserInfo] = useState<Record<string, unknown> | null>(null)

  // Store error message if API call fails
  const [error, setError] = useState<string | null>(null)

  // When token is available, call the 1health userinfo endpoint
  useEffect(() => {
    if (!token) return

    postTo1healthAPI('v3/health/userinfo', {}, token)
      .then((data) => setUserInfo(data))
      .catch((err) => setError(err.message))
  }, [token])

  // Write a test document to Firestore on page load
  useEffect(() => {
    const writeTestData = async () => {
      try {
        const docRef = await addDoc(collection(db, 'testData'), {
          message: 'Hello from TRC Firebase!',
          timestamp: new Date(),
        })
        console.log('✅ Firestore doc written with ID:', docRef.id)
      } catch (err) {
        console.error('❌ Firestore write failed:', err)
      }
    }

    writeTestData()
  }, [])

  // Render UI
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-bold mb-4">🔐 TRC App Template</h1>

      {/* ✅ Token status */}
      {token ? (
        <>
          <p className="text-green-500">✅ Token acquired!</p>

          {userInfo ? (
            <>
              <pre className="mt-4 bg-gray-800 text-white p-4 rounded w-full max-w-xl overflow-auto">
                {JSON.stringify(userInfo, null, 2)}
              </pre>

              {/* 🧩 Show launch payload */}
              {launchPayload && (
                <div className="mt-4 w-full max-w-xl">
                  <h2 className="text-lg font-semibold mb-2">🚀 Launch Payload:</h2>
                  <pre className="bg-gray-100 text-sm p-4 rounded overflow-auto">
                    {JSON.stringify(launchPayload, null, 2)}
                  </pre>
                </div>
              )}

              {/* 🧱 Example component */}
              <div className="mt-6">
                <ExampleCard />
              </div>
            </>
          ) : (
            <p>Loading user info...</p>
          )}
        </>
      ) : (
        <p className="text-gray-500">Waiting for token...</p>
      )}

      {/* ⚠️ Error message */}
      {error && (
        <p className="text-red-500 mt-4">
          ⚠️ API Error: {error}
        </p>
      )}
    </main>
  )
}
