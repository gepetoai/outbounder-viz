'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ExternalLink, MapPin, Briefcase } from 'lucide-react'

interface Candidate {
  id: string
  name: string
  photo: string
  title: string
  company: string
  location: string
  linkedinUrl?: string
  experience?: Array<{
    title: string
    company: string
    duration: string
    location?: string
  }>
  education?: Array<{
    degree: string
    school: string
    year?: string
  }>
  skills?: string[]
  bio?: string
}

interface CandidateDetailModalProps {
  candidate: Candidate | null
  isOpen: boolean
  onClose: () => void
}

export function CandidateDetailModal ({ candidate, isOpen, onClose }: CandidateDetailModalProps) {
  if (!candidate) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Candidate Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header */}
          <div className="flex gap-4 items-start">
            <img
              src={candidate.photo}
              alt={candidate.name}
              className="w-20 h-20 rounded-full border-2 border-[#B9B8C0]"
            />
            <div className="flex-1">
              <h2 className="text-xl font-bold text-[#1C1B20]">{candidate.name}</h2>
              <p className="text-[#40404C] flex items-center gap-1 mt-1">
                <Briefcase className="h-4 w-4" />
                {candidate.title} at {candidate.company}
              </p>
              <p className="text-[#777D8D] flex items-center gap-1 text-sm mt-1">
                <MapPin className="h-4 w-4" />
                {candidate.location}
              </p>
              {candidate.linkedinUrl && (
                <a
                  href={candidate.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#1C1B20] hover:text-[#40404C] hover:underline text-sm flex items-center gap-1 mt-2 font-medium"
                >
                  View LinkedIn Profile
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>

          {/* Bio */}
          {candidate.bio && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold text-[#1C1B20] mb-2">About</h3>
                <p className="text-[#40404C] text-sm">{candidate.bio}</p>
              </div>
            </>
          )}

          {/* Experience */}
          {candidate.experience && candidate.experience.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold text-[#1C1B20] mb-3">Experience</h3>
                <div className="space-y-4">
                  {candidate.experience.map((exp, idx) => (
                    <div key={idx} className="border-l-2 border-[#B9B8C0] pl-4">
                      <h4 className="font-medium text-[#1C1B20]">{exp.title}</h4>
                      <p className="text-[#40404C] text-sm">{exp.company}</p>
                      <p className="text-[#777D8D] text-xs mt-1">{exp.duration}</p>
                      {exp.location && (
                        <p className="text-[#777D8D] text-xs">{exp.location}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Education */}
          {candidate.education && candidate.education.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold text-[#1C1B20] mb-3">Education</h3>
                <div className="space-y-3">
                  {candidate.education.map((edu, idx) => (
                    <div key={idx}>
                      <h4 className="font-medium text-[#1C1B20]">{edu.degree}</h4>
                      <p className="text-[#40404C] text-sm">{edu.school}</p>
                      {edu.year && (
                        <p className="text-[#777D8D] text-xs">{edu.year}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Skills */}
          {candidate.skills && candidate.skills.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold text-[#1C1B20] mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="bg-[#EEEEEE] text-[#1C1B20] hover:bg-[#B9B8C0] border border-[#B9B8C0]"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

