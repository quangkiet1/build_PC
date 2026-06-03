'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { MapPin } from 'lucide-react'

interface AddressInputProps {
  value: string
  onChange: (address: string) => void
  placeholder?: string
  error?: string
}

interface GoogleMapsAutocomplete {
  addListener: (event: string, callback: () => void) => GoogleMapsEventListener
  getPlace: () => { formatted_address?: string; geometry?: object; address_components?: object[] }
}

interface GoogleMapsEventListener {
  remove: () => void
}

interface GoogleMapsPlaces {
  Autocomplete: new (element: HTMLInputElement, options: object) => GoogleMapsAutocomplete
}

interface GoogleMaps {
  maps: {
    places: GoogleMapsPlaces
  }
}

declare global {
  interface Window {
    google?: GoogleMaps
  }
}

export function AddressInput({ value, onChange, placeholder, error }: AddressInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<GoogleMapsAutocomplete | null>(null)
  const listenerRef = useRef<GoogleMapsEventListener | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [apiKeyMissing, setApiKeyMissing] = useState(false)
  const [apiError, setApiError] = useState(false)
  const loadingRef = useRef(false)

  const initializeAutocomplete = useCallback(() => {
    if (!inputRef.current || !window.google?.maps?.places) return

    // Prevent duplicate initialization
    if (autocompleteRef.current) return

    const options = {
      componentRestrictions: { country: 'vn' },
      types: ['address'],
      fields: ['formatted_address', 'geometry', 'address_components'],
    }

    try {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        options
      )

      listenerRef.current = autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace()
        if (place && place.formatted_address) {
          onChange(place.formatted_address)
        }
      })
    } catch (err) {
      setApiError(true)
      console.warn('Autocomplete initialization failed:', err)
    }
  }, [onChange])

  const loadGoogleMapsScript = useCallback(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      setApiKeyMissing(true)
      return
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src*="maps.googleapis.com/maps/api/js"]'
    )
    if (existingScript) {
      if (window.google?.maps?.places) {
        setIsLoaded(true)
      } else {
        loadingRef.current = true
        existingScript.addEventListener('load', () => {
          loadingRef.current = false
          setIsLoaded(true)
        }, { once: true })
        existingScript.addEventListener('error', (err) => {
          loadingRef.current = false
          setApiError(true)
          console.warn('Google Maps API not available:', err)
        }, { once: true })
      }
      return
    }

    loadingRef.current = true
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=vi&loading=async`
    script.async = true
    script.defer = true
    script.onload = () => {
      loadingRef.current = false
      setIsLoaded(true)
    }
    script.onerror = (err) => {
      loadingRef.current = false
      setApiError(true)
      console.warn('Google Maps API not available:', err)
    }
    document.head.appendChild(script)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    if (window.google?.maps?.places && !autocompleteRef.current && inputRef.current) {
      queueMicrotask(() => {
        initializeAutocomplete()
        setIsLoaded(true)
      })
      return
    }

    if (isLoaded || loadingRef.current || apiKeyMissing || apiError) return

    queueMicrotask(loadGoogleMapsScript)
  }, [apiError, apiKeyMissing, initializeAutocomplete, isLoaded, loadGoogleMapsScript])

  useEffect(() => {
    return () => {
      listenerRef.current?.remove()
      listenerRef.current = null
      autocompleteRef.current = null
    }
  }, [])

  return (
    <div className="space-y-2">
      <div className="relative">
        <MapPin className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#FFD600]" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          title={
            apiKeyMissing
              ? 'Chưa cấu hình Google Maps API key'
              : apiError
                ? 'Google Maps chưa khả dụng - nhập địa chỉ thủ công'
                : ''
          }
          className={`w-full rounded-xl border bg-[#141a26] px-4 py-3 pl-11 text-sm text-white placeholder:text-slate-500 outline-none transition ${
            error
              ? 'border-rose-500/50 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20'
              : 'border-white/10 focus:border-[#F7931A]/50 focus:ring-1 focus:ring-[#F7931A]/20'
          }`}
          autoComplete="street-address"
        />
      </div>
      {error && <p className="text-xs text-rose-400">{error}</p>}
      {apiKeyMissing && (
        <p className="text-xs text-slate-400">
          Gợi ý: thêm Google Maps API key vào .env.local để bật tự động hoàn tất.
        </p>
      )}
      {apiError && !apiKeyMissing && (
        <p className="text-xs text-slate-400">
          Google Maps API chưa khả dụng. Vui lòng nhập địa chỉ thủ công.
        </p>
      )}
    </div>
  )
}
