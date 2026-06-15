import { render, screen, waitFor } from '@testing-library/react'
import React from 'react'

// Contoh Mock Router Next.js jika komponennya memakai navigasi
jest.mock('next/navigation', () => ({
  useRouter() {
    return { push: jest.fn() }
  },
}))

describe('Frontend Testing - Halaman Daftar Materi SIPANDA', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('Harus menampilkan pesan loading saat data sedang diambil', () => {
    // Skenario pengujian kamu di sini...
  })
})