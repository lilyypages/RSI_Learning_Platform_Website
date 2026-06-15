import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LoginPage from '../app/auth/login/page' // Sesuaikan path ini dengan folder aslimu jika berbeda
import { useRouter, useSearchParams } from 'next/navigation'

// =========================================================================
// MOCKING: Memalsukan fungsi Next.js Navigation agar bisa dipantau oleh Jest
// =========================================================================
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}))

describe('Frontend Testing - Halaman Login SIPANDA', () => {
  const mockPush = jest.fn()
  const mockRefresh = jest.fn()
  const mockGet = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    // Mengatur perilaku default tiruan navigasi Next.js
    ;(useRouter as jest.fn).mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
    })
    ;(useSearchParams as jest.fn).mockReturnValue({
      get: mockGet,
    })
    // Memalsukan fungsi global fetch API
    global.fetch = jest.fn()
  })

  // =========================================================================
  // A. 5 TEST CASE POSITIF (Skenario Sukses / Komponen Terbaca)
  // =========================================================================
  describe('Skenario Positif', () => {

    it('1. Harus merender elemen header, judul, dan teks panduan dengan benar', () => {
      render(<LoginPage />)
      expect(screen.getByText('Selamat Datang Kembali')).toBeInTheDocument()
      expect(screen.getByText('Silakan masuk menggunakan akun akademik Anda.')).toBeInTheDocument()
      expect(screen.getByText('🐼')).toBeInTheDocument()
    })

    it('2. Harus menampilkan field input Email dan Password dalam keadaan kosong di awal', () => {
      render(<LoginPage />)
      const emailInput = screen.getByPlaceholderText('nama@sekolah.com') as HTMLInputElement
      const passwordInput = screen.getByPlaceholderText('••••••••') as HTMLInputElement
      
      expect(emailInput).toBeInTheDocument()
      expect(emailInput.value).toBe('')
      expect(passwordInput).toBeInTheDocument()
      expect(passwordInput.value).toBe('')
    })

    it('3. Harus bisa mengubah nilai (typing) pada input Email dan Password', () => {
      render(<LoginPage />)
      const emailInput = screen.getByPlaceholderText('nama@sekolah.com') as HTMLInputElement
      const passwordInput = screen.getByPlaceholderText('••••••••') as HTMLInputElement

      fireEvent.change(emailInput, { target: { value: 'guru@test.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })

      expect(emailInput.value).toBe('guru@test.com')
      expect(passwordInput.value).toBe('password123')
    })

    it('4. Harus bisa mengubah tipe input password menjadi "text" ketika tombol mata diklik (Toggle Show Password)', () => {
      render(<LoginPage />)
      const passwordInput = screen.getByPlaceholderText('••••••••') as HTMLInputElement
      const toggleButton = screen.getByRole('button', { name: '' }) // Mencari button icon mata

      expect(passwordInput.type).toBe('password') // Default awal
      
      fireEvent.click(toggleButton)
      expect(passwordInput.type).toBe('text') // Setelah diklik berubah jadi plain text

      fireEvent.click(toggleButton)
      expect(passwordInput.type).toBe('password') // Diklik lagi balik jadi secret
    })

    it('5. Harus berhasil redirect ke /dashboard jika API login mengembalikan success', async () => {
      // Menyusun respons sukses palsu dari API server
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, redirectTo: '/dashboard' }),
      })

      render(<LoginPage />)
      
      fireEvent.change(screen.getByPlaceholderText('nama@sekolah.com'), { target: { value: 'guru@test.com' } })
      fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password123' } })
      fireEvent.click(screen.getByRole('button', { name: 'Masuk ke Platform' }))

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard')
        expect(mockRefresh).toHaveBeenCalled()
      })
    })
  })

  // =========================================================================
  // B. 5 TEST CASE NEGATIF (Skenario Gagal / Validasi Error)
  // =========================================================================
  describe('Skenario Negatif', () => {

    it('1. Tidak boleh memunculkan banner error secara default saat halaman pertama dibuka', () => {
      render(<LoginPage />)
      const errorBanner = screen.queryByText(/Login gagal/i)
      expect(errorBanner).not.toBeInTheDocument()
    })

    it('2. Harus menampilkan pesan error kustom jika API merespons dengan status gagal (!res.ok)', async () => {
      // Menyusun respons gagal dari server (Contoh: Salah password)
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ success: false, message: 'Kata sandi yang Anda masukkan salah.' }),
      })

      render(<LoginPage />)
      
      fireEvent.change(screen.getByPlaceholderText('nama@sekolah.com'), { target: { value: 'guru@test.com' } })
      fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'salah_sandi' } })
      fireEvent.click(screen.getByRole('button', { name: 'Masuk ke Platform' }))

      // Memastikan pesan error dari backend dirender ke layar user
      await waitFor(() => {
        expect(screen.getByText('Kata sandi yang Anda masukkan salah.')).toBeInTheDocument()
      })
    })
// ==========================================
    // SKENARIO NEGATIF 3
    // ==========================================
    it('3. Harus menampilkan pesan fallback standar jika API gagal tapi tidak memberikan pesan teks', async () => {
      // Mock API merespons dengan !res.ok (status 400) tanpa memberikan message kustom
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ success: false }),
      })

      render(<LoginPage />)

      const emailInput = screen.getByPlaceholderText('nama@sekolah.com')
      const passwordInput = screen.getByPlaceholderText('••••••••')
      const submitBtn = screen.getByRole('button', { name: 'Masuk ke Platform' })

      fireEvent.change(emailInput, { target: { value: 'guru@test.com' } })
      fireEvent.change(passwordInput, { target: { value: 'sandiSalah' } })
      fireEvent.click(submitBtn)

      // Memastikan component merender teks fallback standar
      await waitFor(() => {
        expect(screen.getByText(/Login gagal/i)).toBeInTheDocument()
      })
    })

    // ==========================================
    // SKENARIO NEGATIF 4
    // ==========================================
    it('4. Harus mengunci/menonaktifkan (disable) tombol submit ketika sedang memuat data (isLoading)', async () => {
      // Buat API menunda responnya menggunakan Promise gantung agar state isLoading tertahan sejenak
      let resolveFetch: any
      global.fetch = jest.fn().mockImplementation(() => 
        new Promise((resolve) => {
          resolveFetch = resolve
        })
      )

      render(<LoginPage />)

      const emailInput = screen.getByPlaceholderText('nama@sekolah.com')
      const passwordInput = screen.getByPlaceholderText('••••••••')
      const submitBtn = screen.getByRole('button', { name: 'Masuk ke Platform' })

      fireEvent.change(emailInput, { target: { value: 'guru@test.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      
      // Klik tombol untuk memicu state isLoading = true
      fireEvent.click(submitBtn)

      // Saat loading tertahan, tombol harus dalam keadaan disabled
      expect(submitBtn).toBeDisabled()

      // Selesaikan Promise fetch supaya resource dilepas dengan bersih
      resolveFetch({
        ok: true,
        json: async () => ({ success: true, redirectTo: '/dashboard' }),
      })
    })

    // ==========================================
    // SKENARIO NEGATIF 5
    // ==========================================
    it('5. Harus menampilkan pesan error koneksi jika server down atau terkena internet putus (catch block)', async () => {
      // Simulasikan server crash / network error terjebak di blok catch
      global.fetch = jest.fn().mockRejectedValue(new Error('Network Error'))

      render(<LoginPage />)

      const emailInput = screen.getByPlaceholderText('nama@sekolah.com')
      const passwordInput = screen.getByPlaceholderText('••••••••')
      const submitBtn = screen.getByRole('button', { name: 'Masuk ke Platform' })

      fireEvent.change(emailInput, { target: { value: 'guru@test.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitBtn)

      // Memastikan component menangkap error di catch block dan memunculkan teks error
      await waitFor(() => {
        expect(screen.getByText(/gagal/i)).toBeInTheDocument()
      })
    })

    // ==========================================
    // SKENARIO NEGATIF 6
    // ==========================================
    it('6. Harus memvalidasi atribut HTML5 required/type untuk format email yang tidak valid', () => {
      render(<LoginPage />)
      const emailInput = screen.getByPlaceholderText('nama@sekolah.com') as HTMLInputElement

      // Isi dengan format email yang salah
      fireEvent.change(emailInput, { target: { value: 'emailTanpaAtSign.com' } })
      
      // Memastikan HTML5 validation mendeteksi format yang salah
      expect(emailInput.checkValidity()).toBe(false)
    })

    // ==========================================
    // SKENARIO NEGATIF 7
    // ==========================================
    it('7. Harus memvalidasi bahwa input Email tidak boleh kosong saat submit', () => {
      render(<LoginPage />)
      const emailInput = screen.getByPlaceholderText('nama@sekolah.com') as HTMLInputElement
      
      // Biarkan kosong, lalu cek validitas HTML5 required
      fireEvent.change(emailInput, { target: { value: '' } })
      expect(emailInput.checkValidity()).toBe(false)
    })

    // ==========================================
    // SKENARIO NEGATIF 8
    // ==========================================
    it('8. Harus memvalidasi bahwa input Password tidak boleh kosong saat submit', () => {
      render(<LoginPage />)
      const passwordInput = screen.getByPlaceholderText('••••••••') as HTMLInputElement
      
      // Biarkan kosong, lalu cek validitas HTML5 required
      fireEvent.change(passwordInput, { target: { value: '' } })
      expect(passwordInput.checkValidity()).toBe(false)
    })

    // ==========================================
    // SKENARIO NEGATIF 9
    // ==========================================
    it('9. Harus tetap menampilkan pesan error jika API mengembalikan res.ok (200) tetapi payload data success bernilai false', async () => {
      // Kasus backend mengembalikan status 200 OK tapi payloadnya menyatakan gagal login
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ success: false, message: 'Kredensial akun tidak ditemukan.' }),
      })

      render(<LoginPage />)
      const emailInput = screen.getByPlaceholderText('nama@sekolah.com')
      const passwordInput = screen.getByPlaceholderText('••••••••')
      const submitBtn = screen.getByRole('button', { name: 'Masuk ke Platform' })

      fireEvent.change(emailInput, { target: { value: 'salah@test.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitBtn)

      // Harus mendeteksi pesan error kustom dari payload JSON
      await waitFor(() => {
        expect(screen.getByText('Kredensial akun tidak ditemukan.')).toBeInTheDocument()
      })
    })

    // ==========================================
    // SKENARIO NEGATIF 10
    // ==========================================
    it('10. Harus mengembalikan ke rute fallback standar jika properti redirectTo dari API tidak didefinisikan', async () => {
      // Kasus login sukses tapi backend lupa mengirimkan field 'redirectTo'
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }), // Tanpa property redirectTo
      })

      render(<LoginPage />)
      const emailInput = screen.getByPlaceholderText('nama@sekolah.com')
      const passwordInput = screen.getByPlaceholderText('••••••••')
      const submitBtn = screen.getByRole('button', { name: 'Masuk ke Platform' })

      fireEvent.change(emailInput, { target: { value: 'guru@test.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitBtn)

      // Tetap harus dialihkan (redirect) ke fallback default internal yaitu '/dashboard'
      await waitFor(() => {
        const mockRouter = require('next/navigation').useRouter()
        expect(mockRouter.push).toHaveBeenCalledWith('/dashboard')
      })
    })

  }) // <-- Penutup blok Skenario Negatif
}) // <-- Penutup utama describe('Frontend Testing - Halaman Login SIPANDA')w