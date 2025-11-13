'use client'

import { useState } from 'react'
import Image from 'next/image'
import { AnimatedDots } from './animated-dots'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { supabase } from '@/lib/supabase'

// const customerLogos = [
//   { name: 'Cvent', src: '/customer-logos/cvent.png', width: 150 },
//   { name: 'Realtor.com', src: '/customer-logos/realtor.png', width: 175 },
//   { name: 'Provi', src: '/customer-logos/provi.png', width: 125 },
//   { name: 'SpotOn', src: '/customer-logos/spoton.png', width: 150 }
// ]

const applications = [
  {
    name: 'Outbounder',
    description: 'Books qualified meetings with cold outreach',
    icon: '/icons/paper-plane-light.svg'
  },
  {
    name: 'Inbounder',
    description: 'Increases conversion of all leads that find you',
    icon: '/icons/arrow-down-to-line-light.svg'
  },
  {
    name: 'Researcher',
    description: 'Builds detailed lead lists',
    icon: '/icons/address-book-light.svg'
  },
  {
    name: 'Recruiter',
    description: 'Helps hire salespeople faster',
    icon: '/icons/users-light.svg'
  }
]

export function HeroSection () {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    linkedin: '',
    phone: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const { error} = await supabase
        .from('Form Fills')
        .insert([{
          name: formData.name,
          email: formData.email,
          linkedin_url: formData.linkedin,
          phone: formData.phone,
          message: formData.message
        }])

      if (error) throw error

      setSubmitStatus('success')
      setFormData({
        name: '',
        email: '',
        linkedin: '',
        phone: '',
        message: ''
      })
    } catch (error) {
      console.error('Error submitting form:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <section className="relative min-h-screen flex items-center bg-white overflow-hidden py-20">
      {/* Animated Dots Background */}
      <AnimatedDots />
      
      {/* Bottom Gradient Fade to White */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-b from-transparent to-white pointer-events-none z-[5]" />
      
      {/* Hero Content - Two Column Layout */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Side - Hero Text & Application Cards */}
          <div className="text-left flex flex-col gap-10">
            {/* Hero Text */}
            <div className="space-y-6">
              <h1 className="text-5xl sm:text-6xl font-bold text-[#1C1B20]">
                Digital Teammates for GTM Teams
              </h1>
              <p className="text-lg sm:text-xl text-[#40404C]">
                Automate your time-consuming revenue tasks to sell more.
              </p>
            </div>

            {/* Application Cards - 2x2 Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {applications.map((app) => (
                <Card
                  key={app.name}
                  className="bg-white border border-[#EEEEEE] shadow-[0px_2px_8px_rgba(0,0,0,0.04)] rounded-[14px] p-7 hover:shadow-[0px_4px_12px_rgba(0,0,0,0.08)] transition-shadow"
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col items-start">
                      <div className="mb-4">
                        <Image
                          src={app.icon}
                          alt={`${app.name} icon`}
                          width={32}
                          height={32}
                          className="w-8 h-8"
                          style={{ filter: 'brightness(0) saturate(100%)' }}
                        />
                      </div>
                      <h3 className="text-2xl font-semibold text-[#1C1B20] mb-2">
                        {app.name}
                      </h3>
                      <p className="text-[15px] text-[#777D8D] leading-relaxed">
                        {app.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Right Side - Contact Form */}
          <div className="bg-white border border-[#EEEEEE] shadow-[0px_2px_8px_rgba(0,0,0,0.04)] rounded-[14px] p-8">
            <h2 className="text-2xl font-bold text-[#1C1B20] mb-6">
              Schedule a demo
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Success Message */}
              {submitStatus === 'success' && (
                <div className="p-4 bg-[#F5F5F5] border border-[#EEEEEE] rounded-md">
                  <p className="text-sm text-[#1C1B20]">Thank you! We&apos;ll be in touch soon.</p>
                </div>
              )}

              {/* Error Message */}
              {submitStatus === 'error' && (
                <div className="p-4 bg-[#F5F5F5] border border-[#EEEEEE] rounded-md">
                  <p className="text-sm text-[#1C1B20]">Something went wrong. Please try again.</p>
                </div>
              )}

              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[#1C1B20] mb-2">
                  Name <span className="text-[#1C1B20]">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-[#EEEEEE] rounded-md focus:outline-none focus:ring-2 focus:ring-[#777D8D] focus:border-transparent bg-white text-[#1C1B20]"
                  placeholder=""
                />
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#1C1B20] mb-2">
                  Email <span className="text-[#1C1B20]">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-[#EEEEEE] rounded-md focus:outline-none focus:ring-2 focus:ring-[#777D8D] focus:border-transparent bg-white text-[#1C1B20]"
                  placeholder=""
                />
              </div>

              {/* LinkedIn URL Field */}
              <div>
                <label htmlFor="linkedin" className="block text-sm font-medium text-[#1C1B20] mb-2">
                  LinkedIn URL <span className="text-[#1C1B20]">*</span>
                </label>
                <input
                  type="url"
                  id="linkedin"
                  name="linkedin"
                  required
                  value={formData.linkedin}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-[#EEEEEE] rounded-md focus:outline-none focus:ring-2 focus:ring-[#777D8D] focus:border-transparent bg-white text-[#1C1B20]"
                  placeholder=""
                />
              </div>

              {/* Phone Field */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-[#1C1B20] mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-[#EEEEEE] rounded-md focus:outline-none focus:ring-2 focus:ring-[#777D8D] focus:border-transparent bg-white text-[#1C1B20]"
                  placeholder=""
                />
              </div>

              {/* Message Field */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-[#1C1B20] mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-[#EEEEEE] rounded-md focus:outline-none focus:ring-2 focus:ring-[#777D8D] focus:border-transparent bg-white text-[#1C1B20] resize-none"
                  placeholder=""
                />
              </div>

              {/* Submit Button */}
              <div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#1C1B20] text-white hover:bg-[#40404C] py-3 px-6 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Speak with us'}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Trusted Partners Section - Below Everything */}
        <div className="mt-16 text-center">
          <p className="text-sm text-[#777D8D] mb-8">Our Trusted Partners</p>
          <div className="flex items-center justify-center gap-8 md:gap-12 lg:gap-16 flex-wrap">
            <a href="https://cvent.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center opacity-70 hover:opacity-90 transition-opacity duration-300">
              <Image
                src="/customer-logos/cvent.png"
                alt="Cvent logo"
                width={150}
                height={50}
                className="object-contain grayscale"
                style={{ height: '50px', width: 'auto' }}
              />
            </a>
            <a href="https://realtor.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center opacity-70 hover:opacity-90 transition-opacity duration-300">
              <Image
                src="/customer-logos/realtor.png"
                alt="Realtor.com logo"
                width={175}
                height={50}
                className="object-contain grayscale"
                style={{ height: '50px', width: 'auto' }}
              />
            </a>
            <a href="https://provi.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center opacity-70 hover:opacity-90 transition-opacity duration-300">
              <Image
                src="/customer-logos/provi.png"
                alt="Provi logo"
                width={125}
                height={50}
                className="object-contain grayscale"
                style={{ height: '50px', width: 'auto' }}
              />
            </a>
            <a href="https://spoton.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center opacity-70 hover:opacity-90 transition-opacity duration-300">
              <Image
                src="/customer-logos/spoton.png"
                alt="SpotOn logo"
                width={150}
                height={50}
                className="object-contain grayscale"
                style={{ height: '50px', width: 'auto' }}
              />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
