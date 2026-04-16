'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin } from 'lucide-react'

interface AddressInputProps {
  value: string
  onChange: (address: string) => void
  placeholder?: string
  error?: string
}

declare global {
  interface Window {
    google?: any
  }
}

export function AddressInput({ value, onChange, placeholder, error }: AddressInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [apiKeyMissing, setApiKeyMissing] = useState(false)
  const [apiError, setApiError] = useState(false)
  const loadingRef = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    
    // If Google Maps already loaded, initialize autocomplete
    if (window.google && !autocompleteRef.current && inputRef.current) {
      try {
        initializeAutocomplete()
        setIsLoaded(true)
      } catch (error) {
        setApiError(true)
        console.warn('Google Maps autocomplete not available (billing not enabled)')
      }
      return
    }

    // If already loading or loaded, skip
    if (isLoaded || loadingRef.current || apiKeyMissing || apiError) return

    loadGoogleMapsScript()
  }, [isLoaded, apiKeyMissing, apiError])

  const loadGoogleMapsScript = () => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      setApiKeyMissing(true)
      return
    }

    // Check if script already exists
    const existingScript = document.querySelector(
      `script[src*="maps.googleapis.com/maps/api/js"]`
    )
    if (existingScript) {
      setIsLoaded(true)
      return
    }

    loadingRef.current = true
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=vi`
    script.async = true
    script.defer = true
    script.onload = () => {
      loadingRef.current = false
      setIsLoaded(true)
    }
    script.onerror = (error) => {
      loadingRef.current = false
      setApiError(true)
      console.warn('Google Maps API not available:', error)
    }
    document.head.appendChild(script)
  }

  const initializeAutocomplete = () => {
    if (!inputRef.current || !window.google) return

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

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace()
        if (place && place.formatted_address) {
          onChange(place.formatted_address)
        }
      })
    } catch (error) {
      setApiError(true)
      console.warn('Autocomplete initialization failed:', error)
    }
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          title={
            apiKeyMissing 
              ? 'Google Maps API key not configured' 
              : apiError 
              ? 'Google Maps API not available - enter address manually'
              : ''
          }
          className={`w-full rounded-xl border bg-[#141a26] px-4 py-3 pl-11 text-sm text-white placeholder:text-slate-500 outline-none transition ${
            error 
              ? 'border-rose-500/50 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20'
              : 'border-[#1e2535] focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20'
          }`}
          autoComplete="street-address"
        />
      </div>
      {error && <p className="text-xs text-rose-400">{error}</p>}
      {apiKeyMissing && (
        <p className="text-xs text-slate-400">
          💡 Add Google Maps API key to .env.local to enable autocomplete
        </p>
      )}
      {apiError && !apiKeyMissing && (
        <p className="text-xs text-slate-400">
          💡 Google Maps API unavailable. Please enter address manually. (Billing may not be enabled in Google Cloud)
        </p>
      )}
    </div>
  )
}
