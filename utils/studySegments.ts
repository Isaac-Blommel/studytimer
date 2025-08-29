export interface StudySegment {
  start: number // start time in minutes
  end: number   // end time in minutes
  type: 'study' | 'break'
}

/**
 * Calculates optimal study/break segments for a given duration
 * Based on proven productivity techniques:
 * - 25min study, 5min break (Pomodoro)
 * - 50min study, 10min break (Ultradian rhythm)
 * - 90min study, 15min break (Deep work)
 */
export function calculateStudySegments(totalMinutes: number): StudySegment[] {
  const segments: StudySegment[] = []
  let currentTime = 0

  if (totalMinutes <= 30) {
    // Short sessions: mostly study with minimal break
    segments.push({ start: 0, end: Math.max(totalMinutes - 5, totalMinutes * 0.8), type: 'study' })
    if (totalMinutes > 20) {
      segments.push({ start: Math.max(totalMinutes - 5, totalMinutes * 0.8), end: totalMinutes, type: 'break' })
    }
  } else if (totalMinutes <= 45) {
    // Medium sessions: 25/5 Pomodoro pattern
    while (currentTime < totalMinutes) {
      const studyDuration = Math.min(25, totalMinutes - currentTime)
      segments.push({ start: currentTime, end: currentTime + studyDuration, type: 'study' })
      currentTime += studyDuration

      if (currentTime < totalMinutes) {
        const breakDuration = Math.min(5, totalMinutes - currentTime)
        segments.push({ start: currentTime, end: currentTime + breakDuration, type: 'break' })
        currentTime += breakDuration
      }
    }
  } else if (totalMinutes <= 75) {
    // Longer sessions: 50/10 pattern
    while (currentTime < totalMinutes) {
      const studyDuration = Math.min(50, totalMinutes - currentTime)
      segments.push({ start: currentTime, end: currentTime + studyDuration, type: 'study' })
      currentTime += studyDuration

      if (currentTime < totalMinutes) {
        const breakDuration = Math.min(10, totalMinutes - currentTime)
        segments.push({ start: currentTime, end: currentTime + breakDuration, type: 'break' })
        currentTime += breakDuration
      }
    }
  } else {
    // Extended sessions: 90/15 deep work pattern
    while (currentTime < totalMinutes) {
      const studyDuration = Math.min(90, totalMinutes - currentTime)
      segments.push({ start: currentTime, end: currentTime + studyDuration, type: 'study' })
      currentTime += studyDuration

      if (currentTime < totalMinutes) {
        const breakDuration = Math.min(15, Math.min(totalMinutes - currentTime, studyDuration * 0.17))
        segments.push({ start: currentTime, end: currentTime + breakDuration, type: 'break' })
        currentTime += breakDuration
      }
    }
  }

  // Ensure we don't exceed total duration
  const lastSegment = segments[segments.length - 1]
  if (lastSegment && lastSegment.end > totalMinutes) {
    lastSegment.end = totalMinutes
  }

  return segments
}

/**
 * Get the current segment type and remaining time
 */
export function getCurrentSegmentInfo(segments: StudySegment[], currentMinutes: number) {
  const currentSegment = segments.find(segment => 
    currentMinutes >= segment.start && currentMinutes < segment.end
  )
  
  if (!currentSegment) {
    return null
  }

  const remainingMinutes = currentSegment.end - currentMinutes
  return {
    segment: currentSegment,
    remainingMinutes,
    isStudy: currentSegment.type === 'study',
    isBreak: currentSegment.type === 'break'
  }
}

/**
 * Check if it's time to transition to the next segment
 */
export function shouldTransition(segments: StudySegment[], currentMinutes: number) {
  const currentSegment = segments.find(segment => 
    currentMinutes >= segment.start && currentMinutes < segment.end
  )
  
  return !currentSegment || currentMinutes >= currentSegment.end
}

/**
 * Get statistics about the study session
 */
export function getSessionStats(segments: StudySegment[]) {
  const studyTime = segments
    .filter(s => s.type === 'study')
    .reduce((acc, s) => acc + (s.end - s.start), 0)
  
  const breakTime = segments
    .filter(s => s.type === 'break')
    .reduce((acc, s) => acc + (s.end - s.start), 0)
  
  const studySegmentCount = segments.filter(s => s.type === 'study').length
  const breakSegmentCount = segments.filter(s => s.type === 'break').length
  
  return {
    studyTime,
    breakTime,
    totalTime: studyTime + breakTime,
    studySegmentCount,
    breakSegmentCount,
    studyPercentage: Math.round((studyTime / (studyTime + breakTime)) * 100)
  }
}